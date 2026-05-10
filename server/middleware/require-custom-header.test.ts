import { describe, expect, it } from 'bun:test';
import type { Request, Response } from 'express';
import { requireCustomHeader } from './require-custom-header';
import { apiErrorCodes } from '../errors/api-errors';

function run(method: string, headers: Record<string, string> = {}) {
  const handler = requireCustomHeader();
  let nextCalled = false;
  let statusCode: number | undefined;
  let body: unknown;

  const req = { method, headers } as unknown as Request;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: unknown) {
      body = data;
    },
  } as unknown as Response;

  handler(req, res, () => {
    nextCalled = true;
  });
  return { nextCalled, statusCode, body };
}

describe('requireCustomHeader', () => {
  it('rejects POST without X-Requested-With', () => {
    const result = run('POST');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual({ error: apiErrorCodes.forbidden });
  });

  it('allows POST with X-Requested-With', () => {
    const result = run('POST', { 'x-requested-with': 'XMLHttpRequest' });
    expect(result.nextCalled).toBe(true);
  });

  it('allows GET without X-Requested-With', () => {
    const result = run('GET');
    expect(result.nextCalled).toBe(true);
  });

  it('allows HEAD without X-Requested-With', () => {
    const result = run('HEAD');
    expect(result.nextCalled).toBe(true);
  });

  it('allows OPTIONS without X-Requested-With', () => {
    const result = run('OPTIONS');
    expect(result.nextCalled).toBe(true);
  });

  it('rejects DELETE without X-Requested-With', () => {
    const result = run('DELETE');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('rejects PUT without X-Requested-With', () => {
    const result = run('PUT');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('rejects PATCH without X-Requested-With', () => {
    const result = run('PATCH');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(403);
  });
});
