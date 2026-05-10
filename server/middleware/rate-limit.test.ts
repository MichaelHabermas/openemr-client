import { describe, expect, it } from 'bun:test';
import type { Request, Response } from 'express';
import { rateLimiter } from './rate-limit';
import { apiErrorCodes } from '../errors/api-errors';

function mockReq(ip = '127.0.0.1') {
  return {
    ip,
    headers: {},
    method: 'GET',
    url: '/test',
    app: { get: () => false },
  } as unknown as Request;
}

function mockRes() {
  let statusCode: number | undefined;
  let body: unknown;
  const res = {
    setHeader: () => res,
    getHeader: () => undefined,
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      body = data;
      return res;
    },
  } as unknown as Response;
  return { res, getStatus: () => statusCode, getBody: () => body };
}

function callMiddleware(limiter: ReturnType<typeof rateLimiter>, ip?: string) {
  return new Promise<{ nextCalled: boolean; status: number | undefined; body: unknown }>(
    (resolve) => {
      const { res, getStatus, getBody } = mockRes();
      let nextCalled = false;

      const result = limiter(mockReq(ip), res, () => {
        nextCalled = true;
      });

      Promise.resolve(result).then(() => {
        resolve({ nextCalled, status: getStatus(), body: getBody() });
      });
    },
  );
}

describe('rateLimiter', () => {
  it('returns a middleware function', () => {
    const limiter = rateLimiter();
    expect(typeof limiter).toBe('function');
  });

  it('allows requests under the limit', async () => {
    const limiter = rateLimiter({ limit: 5 });
    const result = await callMiddleware(limiter);
    expect(result.nextCalled).toBe(true);
  });

  it('returns 429 with rateLimited error when limit is exceeded', async () => {
    const limiter = rateLimiter({ limit: 2, windowMs: 60_000 });

    await callMiddleware(limiter, '10.0.0.1');
    await callMiddleware(limiter, '10.0.0.1');

    const result = await callMiddleware(limiter, '10.0.0.1');
    expect(result.nextCalled).toBe(false);
    expect(result.status).toBe(429);
    expect(result.body).toEqual({ error: apiErrorCodes.rateLimited });
  });
});
