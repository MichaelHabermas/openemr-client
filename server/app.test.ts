import { describe, expect, test } from 'bun:test';
import type express from 'express';
import { createApp } from './app';
import { accessTokenCookieName } from './constants';
import type { AppConfig } from './config';

type OAuthFake = {
	calls: string[];
	exchangeCodeForToken(code: string): Promise<string>;
};

type FhirFake = {
	calls: string[];
	fetchPatientBundle(accessToken: string): Promise<unknown>;
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
	const oauth: OAuthFake = {
		calls: [],
		async exchangeCodeForToken(code: string) {
			oauth.calls.push(code);
			return 'fake-access-token';
		},
	};
	const fhir: FhirFake = {
		calls: [],
		async fetchPatientBundle(accessToken: string) {
			fhir.calls.push(accessToken);
			return {
				resourceType: 'Bundle',
				entry: [{ resource: { resourceType: 'Patient', id: 'patient-1' } }],
			};
		},
	};
	return { oauth, fhir };
}

function createTestApp() {
	const services = createFakes();
	const app = createApp({ config, services });
	return { app, services };
}

function getRouteHandler(
	app: express.Express,
	method: string,
	path: string,
): express.RequestHandler {
	const layers = app.router?.stack as RouteLayer[] | undefined;
	const layer = layers?.find(
		(candidate) =>
			candidate.route?.path === path && candidate.route.methods[method.toLowerCase()] === true,
	);
	const handler = layer?.route?.stack[0]?.handle;

	if (!handler) {
		throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
	}

	return handler;
}

async function callRoute(
	app: express.Express,
	method: string,
	path: string,
	request: Partial<express.Request> = {},
) {
	const response = createResponse();
	const handler = getRouteHandler(app, method, path);

	await handler(request as express.Request, response as unknown as express.Response, () => {
		throw new Error(`Unexpected next() call from ${method.toUpperCase()} ${path}`);
	});

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

describe('createApp routes', () => {
	test('GET /login redirects with OAuth query params', async () => {
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
		expect(redirectUrl.searchParams.get('state')).toBe('abc123');
	});

	test('GET /callback without code returns 400 and does not call OAuth', async () => {
		const { app, services } = createTestApp();

		const response = await callRoute(app, 'GET', '/callback', { query: {} });

		expect(response.statusCode).toBe(400);
		expect(response.body).toBe('No authorization code received');
		expect(services.oauth.calls).toEqual([]);
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

	test('GET /api/patients without a cookie returns 401 and does not call FHIR', async () => {
		const { app, services } = createTestApp();

		const response = await callRoute(app, 'GET', '/api/patients', { cookies: {} });

		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({ error: 'Not authenticated' });
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
		expect(services.fhir.calls).toEqual(['fake-cookie-token']);
	});
});
