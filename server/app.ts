import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import {
  createOAuthStateCookie,
  clearOAuthStateCookie,
  isValidOAuthState,
  readOAuthStateCookie,
} from './auth/oauth-state';
import {
  clearAccessTokenCookie,
  readAccessTokenCookie,
  setAccessTokenCookie,
} from './auth/session';
import type { AppConfig } from './config';
import { apiErrorCodes } from './errors/api-errors';
import { mapFhirError } from './errors/fhir-error-mapper';
import { rateLimiter } from './middleware/rate-limit';
import { requireCustomHeader } from './middleware/require-custom-header';
import { securityHeaders } from './middleware/security-headers';
import { validatePatientId } from './middleware/validate-patient-id';
import type { ClinicalResourceKey, FhirService } from './services/fhir-service';
import type { OAuthService } from './services/oauth-service';

export interface AppServices {
  oauth: OAuthService;
  fhir: FhirService;
}

export interface CreateAppOptions {
  config: AppConfig;
  services: AppServices;
}

type ProtectedFhirRequestHandler = (accessToken: string, req: express.Request) => Promise<unknown>;

function firstQueryString(value: express.Request['query'][string]): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
}

function patientIdParam(req: express.Request): string {
  const { patientId } = req.params;
  return Array.isArray(patientId) ? patientId[0] : patientId;
}

function protectedFhirRoute(
  operation: string,
  handler: ProtectedFhirRequestHandler,
): express.RequestHandler {
  return async (req, res) => {
    const token = readAccessTokenCookie(req);
    if (!token) {
      res.status(401).json({ error: apiErrorCodes.notAuthenticated });
      return;
    }

    try {
      const payload = await handler(token, req);
      res.json(payload);
    } catch (error) {
      const mapped = mapFhirError(error);
      console.error('FHIR proxy failed', {
        operation,
        status: mapped.status,
        error: mapped.body.error,
      });
      if (mapped.status === 401) {
        clearAccessTokenCookie(res);
      }
      res.status(mapped.status).json(mapped.body);
    }
  };
}

export function createApp({ config, services }: CreateAppOptions) {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: config.appOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(securityHeaders(process.env.NODE_ENV === 'production'));
  app.use(rateLimiter());
  app.use(requireCustomHeader());

  app.get('/login', (_req, res) => {
    const state = createOAuthStateCookie(res);
    const authUrl = new URL('/oauth2/default/authorize', config.openemrUrl);
    authUrl.search = new URLSearchParams({
      response_type: 'code',
      client_id: config.oauthClientId,
      redirect_uri: config.redirectUri,
      scope: config.oauthScope,
      state,
    }).toString();
    res.redirect(authUrl.toString());
  });

  app.get('/callback', async (req, res) => {
    const code = firstQueryString(req.query.code);
    const callbackState = firstQueryString(req.query.state);
    const cookieState = readOAuthStateCookie(req);
    clearOAuthStateCookie(res);

    if (!code) {
      console.error('OAuth callback failed', { reason: 'missing_code' });
      res.redirect(`${config.appOrigin}/?error=oauth`);
      return;
    }
    if (!isValidOAuthState(callbackState, cookieState)) {
      console.error('OAuth callback failed', { reason: 'state_mismatch' });
      res.redirect(`${config.appOrigin}/?error=oauth`);
      return;
    }
    try {
      const token = await services.oauth.exchangeCodeForToken(code);
      setAccessTokenCookie(res, token);
      res.redirect(`${config.appOrigin}/patients`);
    } catch {
      console.error('OAuth callback failed', { reason: 'token_exchange_failed' });
      res.redirect(`${config.appOrigin}/?error=oauth`);
    }
  });

  app.post('/api/logout', (_req, res) => {
    clearAccessTokenCookie(res);
    res.status(204).end();
  });

  app.get(
    '/api/patients',
    protectedFhirRoute('fetchPatientBundle', (token) => services.fhir.fetchPatientBundle(token)),
  );

  const validatePid = validatePatientId();

  app.get(
    '/api/patients/:patientId',
    validatePid,
    protectedFhirRoute('fetchPatient', (token, req) =>
      services.fhir.fetchPatient(token, patientIdParam(req)),
    ),
  );

  function patientClinicalRoute(resourceKey: ClinicalResourceKey) {
    return protectedFhirRoute(`fetchPatientClinicalBundle:${resourceKey}`, (token, req) =>
      services.fhir.fetchPatientClinicalBundle(token, resourceKey, patientIdParam(req)),
    );
  }

  app.get('/api/patients/:patientId/allergies', validatePid, patientClinicalRoute('allergies'));

  app.get('/api/patients/:patientId/problems', validatePid, patientClinicalRoute('problems'));

  app.get('/api/patients/:patientId/medications', validatePid, patientClinicalRoute('medications'));

  app.get(
    '/api/patients/:patientId/prescriptions',
    validatePid,
    patientClinicalRoute('prescriptions'),
  );

  app.get('/api/patients/:patientId/care-team', validatePid, patientClinicalRoute('care-team'));

  app.get('/api/patients/:patientId/encounters', validatePid, patientClinicalRoute('encounters'));

  app.get(
    '/api/patients/:patientId/immunizations',
    validatePid,
    patientClinicalRoute('immunizations'),
  );

  app.get('/api/patients/:patientId/vitals', validatePid, patientClinicalRoute('vitals'));

  app.get('/api/patients/:patientId/labs', validatePid, patientClinicalRoute('labs'));

  app.get('/api/patients/:patientId/procedures', validatePid, patientClinicalRoute('procedures'));

  app.get('/api/patients/:patientId/documents', validatePid, patientClinicalRoute('documents'));

  app.get('/api/patients/:patientId/coverage', validatePid, patientClinicalRoute('coverage'));

  app.get(
    '/api/patients/:patientId/diagnostic-reports',
    validatePid,
    patientClinicalRoute('diagnostic-reports'),
  );

  app.get('/api/patients/:patientId/goals', validatePid, patientClinicalRoute('goals'));

  app.get('/api/patients/:patientId/care-plans', validatePid, patientClinicalRoute('care-plans'));

  app.get(
    '/api/patients/:patientId/social-history',
    validatePid,
    patientClinicalRoute('social-history'),
  );

  app.get(
    '/api/patients/:patientId/family-history',
    validatePid,
    patientClinicalRoute('family-history'),
  );

  app.get(
    '/api/patients/:patientId/appointments',
    validatePid,
    patientClinicalRoute('appointments'),
  );

  app.get('/api/patients/:patientId/devices', validatePid, patientClinicalRoute('devices'));

  app.get(
    '/api/patients/:patientId/service-requests',
    validatePid,
    patientClinicalRoute('service-requests'),
  );

  app.get(
    '/api/patients/:patientId/related-persons',
    validatePid,
    patientClinicalRoute('related-persons'),
  );

  app.get(
    '/api/patients/:patientId/encounters/:encounterId',
    validatePid,
    protectedFhirRoute('fetchEncounter', (token, req) => {
      const { encounterId } = req.params;
      const id = Array.isArray(encounterId) ? encounterId[0] : encounterId;
      return services.fhir.fetchEncounter(token, id);
    }),
  );

  app.get(
    '/api/patients/:patientId/encounters/:encounterId/observations',
    validatePid,
    protectedFhirRoute('fetchEncounterObservations', (token, req) => {
      const { encounterId } = req.params;
      const id = Array.isArray(encounterId) ? encounterId[0] : encounterId;
      return services.fhir.fetchEncounterObservations(token, id);
    }),
  );

  app.get('/api/patients/:patientId/documents/:documentId/content', validatePid, (async (
    req,
    res,
  ) => {
    const token = readAccessTokenCookie(req);
    if (!token) {
      res.status(401).json({ error: apiErrorCodes.notAuthenticated });
      return;
    }
    const { documentId } = req.params;
    const id = Array.isArray(documentId) ? documentId[0] : documentId;
    try {
      const { contentType, data } = await services.fhir.fetchDocumentContent(token, id);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', data.length);
      res.send(data);
    } catch (error) {
      const mapped = mapFhirError(error);
      console.error('FHIR proxy failed', {
        operation: 'fetchDocumentContent',
        status: mapped.status,
        error: mapped.body.error,
      });
      if (mapped.status === 401) {
        clearAccessTokenCookie(res);
      }
      res.status(mapped.status).json(mapped.body);
    }
  }) as express.RequestHandler);

  app.get(
    '/api/practitioners/:practitionerId',
    protectedFhirRoute('fetchPractitioner', (token, req) => {
      const { practitionerId } = req.params;
      const id = Array.isArray(practitionerId) ? practitionerId[0] : practitionerId;
      return services.fhir.fetchPractitioner(token, id);
    }),
  );

  app.get(
    '/api/practitioners/:practitionerId/roles',
    protectedFhirRoute('fetchPractitionerRoles', (token, req) => {
      const { practitionerId } = req.params;
      const id = Array.isArray(practitionerId) ? practitionerId[0] : practitionerId;
      return services.fhir.fetchPractitionerRoles(token, id);
    }),
  );

  app.get(
    '/api/locations',
    protectedFhirRoute('fetchLocationBundle', (token) => services.fhir.fetchLocationBundle(token)),
  );

  app.get(
    '/api/organizations',
    protectedFhirRoute('fetchOrganizationBundle', (token) =>
      services.fhir.fetchOrganizationBundle(token),
    ),
  );

  app.get(
    '/api/medications-catalog',
    protectedFhirRoute('fetchMedicationBundle', (token) =>
      services.fhir.fetchMedicationBundle(token),
    ),
  );

  app.post(
    '/api/patients/:patientId/allergies',
    validatePid,
    protectedFhirRoute('createAllergyIntolerance', (token, req) =>
      services.fhir.createAllergyIntolerance(token, req.body),
    ),
  );

  app.post(
    '/api/patients/:patientId/problems',
    validatePid,
    protectedFhirRoute('createCondition', (token, req) =>
      services.fhir.createCondition(token, req.body),
    ),
  );

  app.post(
    '/api/patients/:patientId/appointments',
    validatePid,
    protectedFhirRoute('createAppointment', (token, req) =>
      services.fhir.createAppointment(token, req.body),
    ),
  );

  app.get(
    '/api/patients/:patientId/provenance',
    validatePid,
    protectedFhirRoute('fetchPatientProvenance', (token, req) =>
      services.fhir.fetchPatientProvenance(token, patientIdParam(req)),
    ),
  );

  return app;
}
