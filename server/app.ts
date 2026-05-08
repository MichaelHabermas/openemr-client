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
import axios from 'axios';
import type { AppConfig } from './config';
import { apiErrorCodes } from './errors/api-errors';
import { mapFhirError } from './errors/fhir-error-mapper';
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

function fhirUpstreamDetail(error: unknown): string | undefined {
  if (axios.isAxiosError(error) && error.response?.data) {
    const d = error.response.data;
    if (typeof d === 'string') return d.slice(0, 200);
    try {
      return JSON.stringify(d).slice(0, 200);
    } catch {}
  }
  return undefined;
}

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
      const upstream = fhirUpstreamDetail(error);
      console.error('FHIR proxy failed', {
        operation,
        status: mapped.status,
        error: mapped.body.error,
        upstream,
      });
      res.status(mapped.status).json(mapped.body);
    }
  };
}

export function createApp({ config, services }: CreateAppOptions) {
  const app = express();

  app.use(
    cors({
      origin: config.appOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());

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

  app.get(
    '/api/patients/:patientId',
    protectedFhirRoute('fetchPatient', (token, req) =>
      services.fhir.fetchPatient(token, patientIdParam(req)),
    ),
  );

  function patientClinicalRoute(resourceKey: ClinicalResourceKey) {
    return protectedFhirRoute(`fetchPatientClinicalBundle:${resourceKey}`, (token, req) =>
      services.fhir.fetchPatientClinicalBundle(token, resourceKey, patientIdParam(req)),
    );
  }

  app.get('/api/patients/:patientId/allergies', patientClinicalRoute('allergies'));

  app.get('/api/patients/:patientId/problems', patientClinicalRoute('problems'));

  app.get('/api/patients/:patientId/medications', patientClinicalRoute('medications'));

  app.get('/api/patients/:patientId/prescriptions', patientClinicalRoute('prescriptions'));

  app.get('/api/patients/:patientId/care-team', patientClinicalRoute('care-team'));

  app.get('/api/patients/:patientId/encounters', patientClinicalRoute('encounters'));

  return app;
}
