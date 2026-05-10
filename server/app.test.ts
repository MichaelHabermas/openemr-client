import { describe, expect, test } from 'bun:test';
import type express from 'express';
import { createApp } from './app';
import { accessTokenCookieName, oauthStateCookieName } from './constants';
import type { AppConfig } from './config';

type OAuthFake = {
  calls: string[];
  error?: unknown;
  exchangeCodeForToken(code: string): Promise<string>;
};

type FhirFake = {
  calls: Array<{
    operation: string;
    accessToken: string;
    resourceKey?: string;
    patientId?: string;
    practitionerId?: string;
  }>;
  error?: unknown;
  fetchPatientBundle(accessToken: string): Promise<unknown>;
  fetchPatient(accessToken: string, patientId: string): Promise<unknown>;
  fetchPatientClinicalBundle(
    accessToken: string,
    resourceKey: string,
    patientId: string,
  ): Promise<unknown>;
  fetchPractitioner(accessToken: string, practitionerId: string): Promise<unknown>;
};

type RouteLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ handle: express.RequestHandler }>;
  };
};

type MockResponse = {
  statusCode: number;
  body: unknown;
  cookies: Array<{
    name: string;
    value?: string;
    options?: Record<string, unknown>;
    cleared: boolean;
  }>;
  redirectUrl?: string;
  status(code: number): MockResponse;
  send(body: unknown): MockResponse;
  json(body: unknown): MockResponse;
  redirect(url: string): MockResponse;
  cookie(name: string, value: string, options?: Record<string, unknown>): MockResponse;
  clearCookie(name: string, options?: Record<string, unknown>): MockResponse;
  end(): MockResponse;
};

const config: AppConfig = {
  openemrUrl: 'https://openemr.example',
  oauthClientId: 'client-id',
  oauthClientSecret: 'client-secret',
  redirectUri: 'http://localhost:5173/callback',
  port: 3000,
  appOrigin: 'http://localhost:5173',
  oauthScope: 'openid api:fhir user/Patient.read',
};

function createFakes() {
  const patientPayload = {
    resourceType: 'Patient',
    id: 'patient-1',
    name: [{ family: 'Nguyen', given: ['Alex'] }],
  };
  const oauth: OAuthFake = {
    calls: [],
    async exchangeCodeForToken(code: string) {
      oauth.calls.push(code);
      if (oauth.error) throw oauth.error;
      return 'fake-access-token';
    },
  };
  const fhir: FhirFake = {
    calls: [],
    async fetchPatientBundle(accessToken: string) {
      fhir.calls.push({ operation: 'fetchPatientBundle', accessToken });
      if (fhir.error) throw fhir.error;
      return {
        resourceType: 'Bundle',
        entry: [{ resource: { resourceType: 'Patient', id: 'patient-1' } }],
      };
    },
    async fetchPatient(accessToken: string, patientId: string) {
      fhir.calls.push({ operation: 'fetchPatient', accessToken, patientId });
      if (fhir.error) throw fhir.error;
      return patientPayload;
    },
    async fetchPatientClinicalBundle(accessToken: string, resourceKey: string, patientId: string) {
      fhir.calls.push({
        operation: 'fetchPatientClinicalBundle',
        accessToken,
        resourceKey,
        patientId,
      });
      if (fhir.error) throw fhir.error;
      return { resourceType: 'Bundle', type: resourceKey, patientId };
    },
    async fetchPractitioner(accessToken: string, practitionerId: string) {
      fhir.calls.push({ operation: 'fetchPractitioner', accessToken, practitionerId });
      if (fhir.error) throw fhir.error;
      return { resourceType: 'Practitioner', id: practitionerId, name: [{ family: 'Smith' }] };
    },
  };
  return { oauth, fhir };
}

function createTestApp() {
  const services = createFakes();
  const app = createApp({ config, services });
  return { app, services };
}

function getRouteHandlers(
  app: express.Express,
  method: string,
  path: string,
): express.RequestHandler[] {
  const layers = app.router?.stack as RouteLayer[] | undefined;
  const layer = layers?.find(
    (candidate) =>
      candidate.route?.path === path && candidate.route.methods[method.toLowerCase()] === true,
  );
  const handlers = layer?.route?.stack.map((s) => s.handle);

  if (!handlers || handlers.length === 0) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }

  return handlers;
}

async function callRoute(
  app: express.Express,
  method: string,
  path: string,
  request: Partial<express.Request> = {},
) {
  const response = createResponse();
  const handlers = getRouteHandlers(app, method, path);
  const req = {
    params: {},
    query: {},
    cookies: {},
    ...request,
  } as express.Request;

  for (const handler of handlers) {
    let nextCalled = false;
    await handler(req, response as unknown as express.Response, () => {
      nextCalled = true;
    });
    if (!nextCalled) break;
  }

  return response;
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    body: undefined,
    cookies: [],
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(body: unknown) {
      this.body = body;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    redirect(url: string) {
      this.statusCode = 302;
      this.redirectUrl = url;
      return this;
    },
    cookie(name: string, value: string, options?: Record<string, unknown>) {
      this.cookies.push({ name, value, options, cleared: false });
      return this;
    },
    clearCookie(name: string, options?: Record<string, unknown>) {
      this.cookies.push({ name, options, cleared: true });
      return this;
    },
    end() {
      return this;
    },
  };
}

function expectCookie(
  response: MockResponse,
  name: string,
  predicate: (cookie: MockResponse['cookies'][number]) => void,
) {
  const cookie = response.cookies.find((candidate) => candidate.name === name);
  expect(cookie).toBeTruthy();
  predicate(cookie as MockResponse['cookies'][number]);
}

function upstreamError(status: number) {
  return Object.assign(new Error(`Upstream ${status}`), {
    response: { status },
  });
}

describe('createApp routes', () => {
  test('GET /login stores an OAuth state cookie matching the redirect state', async () => {
    const { app } = createTestApp();

    const response = await callRoute(app, 'GET', '/login');

    expect(response.statusCode).toBe(302);
    expect(response.redirectUrl).toBeTruthy();

    const redirectUrl = new URL(response.redirectUrl ?? '');
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      'https://openemr.example/oauth2/default/authorize',
    );
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('client_id')).toBe('client-id');
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe('http://localhost:5173/callback');
    expect(redirectUrl.searchParams.get('scope')).toBe('openid api:fhir user/Patient.read');
    expect(redirectUrl.searchParams.has('client_secret')).toBe(false);
    const state = redirectUrl.searchParams.get('state');
    expect(state).toBeTruthy();
    expect(state).not.toBe('abc123');
    if (!state) throw new Error('Expected OAuth state in redirect URL');
    expectCookie(response, oauthStateCookieName, (cookie) => {
      expect(cookie.cleared).toBe(false);
      expect(cookie.value).toBe(state);
      expect(cookie.options).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    });
  });

  test('GET /login generates a fresh OAuth state per request', async () => {
    const { app } = createTestApp();

    const firstResponse = await callRoute(app, 'GET', '/login');
    const secondResponse = await callRoute(app, 'GET', '/login');

    const firstState = new URL(firstResponse.redirectUrl ?? '').searchParams.get('state');
    const secondState = new URL(secondResponse.redirectUrl ?? '').searchParams.get('state');
    expect(firstState).toBeTruthy();
    expect(secondState).toBeTruthy();
    expect(firstState).not.toBe(secondState);
  });

  test('GET /callback without code redirects to the OAuth error path and does not call OAuth', async () => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', '/callback', {
      query: { state: 'state-1' },
      cookies: { [oauthStateCookieName]: 'state-1' },
    });

    expect(response.statusCode).toBe(302);
    expect(response.redirectUrl).toBe('http://localhost:5173/?error=oauth');
    expect(response.cookies).toContainEqual({
      name: oauthStateCookieName,
      options: { path: '/' },
      cleared: true,
    });
    expect(services.oauth.calls).toEqual([]);
  });

  test('GET /callback without a state fails before token exchange and clears state', async () => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', '/callback', {
      query: { code: 'auth-code' },
      cookies: { [oauthStateCookieName]: 'state-1' },
    });

    expect(response.statusCode).toBe(302);
    expect(response.redirectUrl).toBe('http://localhost:5173/?error=oauth');
    expect(response.cookies).toContainEqual({
      name: oauthStateCookieName,
      options: { path: '/' },
      cleared: true,
    });
    expect(services.oauth.calls).toEqual([]);
  });

  test('GET /callback with mismatched state fails before token exchange and clears state', async () => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', '/callback', {
      query: { code: 'auth-code', state: 'callback-state' },
      cookies: { [oauthStateCookieName]: 'cookie-state' },
    });

    expect(response.statusCode).toBe(302);
    expect(response.redirectUrl).toBe('http://localhost:5173/?error=oauth');
    expect(response.cookies).toContainEqual({
      name: oauthStateCookieName,
      options: { path: '/' },
      cleared: true,
    });
    expect(services.oauth.calls).toEqual([]);
  });

  test('GET /callback with matching state exchanges the code, clears state, and sets access token', async () => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', '/callback', {
      query: { code: 'auth-code', state: 'state-1' },
      cookies: { [oauthStateCookieName]: 'state-1' },
    });

    expect(response.statusCode).toBe(302);
    expect(response.redirectUrl).toBe('http://localhost:5173/patients');
    expect(response.cookies).toContainEqual({
      name: oauthStateCookieName,
      options: { path: '/' },
      cleared: true,
    });
    expectCookie(response, accessTokenCookieName, (cookie) => {
      expect(cookie.cleared).toBe(false);
      expect(cookie.value).toBe('fake-access-token');
      expect(cookie.options).toMatchObject({
        httpOnly: true,
        maxAge: 3600 * 1000,
        sameSite: 'lax',
        path: '/',
      });
    });
    expect(services.oauth.calls).toEqual(['auth-code']);
  });

  test('GET /callback redirects to the OAuth error path when token exchange fails', async () => {
    const { app, services } = createTestApp();
    services.oauth.error = new Error('Token response missing access_token');

    const response = await callRoute(app, 'GET', '/callback', {
      query: { code: 'auth-code', state: 'state-1' },
      cookies: { [oauthStateCookieName]: 'state-1' },
    });

    expect(response.statusCode).toBe(302);
    expect(response.redirectUrl).toBe('http://localhost:5173/?error=oauth');
    expect(response.cookies).toContainEqual({
      name: oauthStateCookieName,
      options: { path: '/' },
      cleared: true,
    });
    expect(response.cookies.some((cookie) => cookie.name === accessTokenCookieName)).toBe(false);
    expect(services.oauth.calls).toEqual(['auth-code']);
  });

  test('POST /api/logout returns 204 and clears the access token cookie', async () => {
    const { app } = createTestApp();

    const response = await callRoute(app, 'POST', '/api/logout');

    expect(response.statusCode).toBe(204);
    expect(response.cookies).toContainEqual({
      name: accessTokenCookieName,
      options: { path: '/' },
      cleared: true,
    });
  });

  test('GET /api/patients without a cookie returns canonical not_authenticated and does not call FHIR', async () => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', '/api/patients', { cookies: {} });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'not_authenticated' });
    expect(services.fhir.calls).toEqual([]);
  });

  test('GET /api/patients with a cookie calls FHIR with the access token', async () => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', '/api/patients', {
      cookies: { [accessTokenCookieName]: 'fake-cookie-token' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Patient', id: 'patient-1' } }],
    });
    expect(services.fhir.calls).toEqual([
      { operation: 'fetchPatientBundle', accessToken: 'fake-cookie-token' },
    ]);
  });

  test.each([
    ['/api/patients/:patientId', 'fetchPatient', undefined],
    ['/api/patients/:patientId/allergies', 'fetchPatientClinicalBundle', 'allergies'],
    ['/api/patients/:patientId/problems', 'fetchPatientClinicalBundle', 'problems'],
    ['/api/patients/:patientId/medications', 'fetchPatientClinicalBundle', 'medications'],
    ['/api/patients/:patientId/prescriptions', 'fetchPatientClinicalBundle', 'prescriptions'],
    ['/api/patients/:patientId/care-team', 'fetchPatientClinicalBundle', 'care-team'],
    ['/api/patients/:patientId/encounters', 'fetchPatientClinicalBundle', 'encounters'],
  ] as const)('GET %s exists and requires auth', async (routePath) => {
    const { app, services } = createTestApp();

    const response = await callRoute(app, 'GET', routePath, {
      params: { patientId: 'patient-1' },
      cookies: {},
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'not_authenticated' });
    expect(services.fhir.calls).toEqual([]);
  });

  test.each([
    ['/api/patients/:patientId', 'fetchPatient', undefined],
    ['/api/patients/:patientId/allergies', 'fetchPatientClinicalBundle', 'allergies'],
    ['/api/patients/:patientId/problems', 'fetchPatientClinicalBundle', 'problems'],
    ['/api/patients/:patientId/medications', 'fetchPatientClinicalBundle', 'medications'],
    ['/api/patients/:patientId/prescriptions', 'fetchPatientClinicalBundle', 'prescriptions'],
    ['/api/patients/:patientId/care-team', 'fetchPatientClinicalBundle', 'care-team'],
    ['/api/patients/:patientId/encounters', 'fetchPatientClinicalBundle', 'encounters'],
  ] as const)(
    'GET %s calls %s with token and patient id',
    async (routePath, operation, resourceKey) => {
      const { app, services } = createTestApp();

      const response = await callRoute(app, 'GET', routePath, {
        params: { patientId: 'patient-1' },
        cookies: { [accessTokenCookieName]: 'fake-cookie-token' },
      });

      expect(response.statusCode).toBe(200);
      const expectedCall = { operation, accessToken: 'fake-cookie-token', patientId: 'patient-1' };
      expect(services.fhir.calls).toEqual([
        resourceKey === undefined ? expectedCall : { ...expectedCall, resourceKey },
      ]);
    },
  );

  test('GET /api/patients/:patientId returns the upstream patient payload', async () => {
    const { app } = createTestApp();

    const response = await callRoute(app, 'GET', '/api/patients/:patientId', {
      params: { patientId: 'patient-1' },
      cookies: { [accessTokenCookieName]: 'fake-cookie-token' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ family: 'Nguyen', given: ['Alex'] }],
    });
  });

  test('GET /api/patients/:patientId maps upstream 404 to not_found', async () => {
    const { app, services } = createTestApp();
    services.fhir.error = upstreamError(404);

    const response = await callRoute(app, 'GET', '/api/patients/:patientId', {
      params: { patientId: 'missing-patient' },
      cookies: { [accessTokenCookieName]: 'fake-cookie-token' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: 'not_found' });
    expect(services.fhir.calls).toEqual([
      { operation: 'fetchPatient', accessToken: 'fake-cookie-token', patientId: 'missing-patient' },
    ]);
  });

  test.each([
    [400, 400, 'bad_fhir_request'],
    [401, 401, 'upstream_auth_failed'],
    [403, 403, 'forbidden'],
    [404, 404, 'not_found'],
    [500, 502, 'fhir_unavailable'],
  ] as const)(
    'GET /api/patients/:patientId/allergies maps upstream FHIR %i to controlled error',
    async (upstreamStatus, responseStatus, error) => {
      const { app, services } = createTestApp();
      services.fhir.error = upstreamError(upstreamStatus);

      const response = await callRoute(app, 'GET', '/api/patients/:patientId/allergies', {
        params: { patientId: 'patient-1' },
        cookies: { [accessTokenCookieName]: 'fake-cookie-token' },
      });

      expect(response.statusCode).toBe(responseStatus);
      expect(response.body).toEqual({ error });
      expect(services.fhir.calls).toEqual([
        {
          operation: 'fetchPatientClinicalBundle',
          accessToken: 'fake-cookie-token',
          resourceKey: 'allergies',
          patientId: 'patient-1',
        },
      ]);
      if (upstreamStatus === 401) {
        expect(response.cookies).toContainEqual({
          name: accessTokenCookieName,
          options: { path: '/' },
          cleared: true,
        });
      } else {
        expect(response.cookies).toEqual([]);
      }
    },
  );

  test('GET /api/patients/:patientId/allergies maps network FHIR failures to fhir_unavailable', async () => {
    const { app, services } = createTestApp();
    services.fhir.error = new Error('connect ECONNREFUSED fake-token');

    const response = await callRoute(app, 'GET', '/api/patients/:patientId/allergies', {
      params: { patientId: 'patient-1' },
      cookies: { [accessTokenCookieName]: 'fake-cookie-token' },
    });

    expect(response.statusCode).toBe(502);
    expect(response.body).toEqual({ error: 'fhir_unavailable' });
    expect(response.cookies).toEqual([]);
  });
});
