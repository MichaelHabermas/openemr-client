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
import type { FhirService } from './services/fhir-service';
import type { OAuthService } from './services/oauth-service';

export interface AppServices {
  oauth: OAuthService;
  fhir: FhirService;
}

export interface CreateAppOptions {
  config: AppConfig;
  services: AppServices;
}

function firstQueryString(value: express.Request['query'][string]): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
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

  app.get('/api/patients', async (req, res) => {
    const token = readAccessTokenCookie(req);
    if (!token) {
      res.status(401).json({ error: apiErrorCodes.notAuthenticated });
      return;
    }
    try {
      const bundle = await services.fhir.fetchPatientBundle(token);
      res.json(bundle);
    } catch (error) {
      const mapped = mapFhirError(error);
      if (mapped.body.error === apiErrorCodes.upstreamAuthFailed) {
        clearAccessTokenCookie(res);
      }
      console.error('FHIR proxy failed', { status: mapped.status, error: mapped.body.error });
      res.status(mapped.status).json(mapped.body);
    }
  });

  return app;
}
