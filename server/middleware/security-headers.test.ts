import { describe, expect, it } from 'bun:test';
import type { Request, Response } from 'express';
import { securityHeaders } from './security-headers';

function createMockRes() {
  const headers = new Map<string, string>();
  return {
    setHeader: (name: string, value: string) => headers.set(name, value),
    _headers: headers,
  } as unknown as Response;
}

describe('securityHeaders', () => {
  it('sets all headers in production mode', () => {
    const handler = securityHeaders(true);
    const res = createMockRes();
    let called = false;
    handler({} as Request, res, () => {
      called = true;
    });

    const h = (res as unknown as { _headers: Map<string, string> })._headers;
    expect(h.get('X-Content-Type-Options')).toBe('nosniff');
    expect(h.get('X-Frame-Options')).toBe('DENY');
    expect(h.get('X-XSS-Protection')).toBe('0');
    const csp = h.get('Content-Security-Policy')!;
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(h.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
    expect(called).toBe(true);
  });

  it('omits HSTS in non-production mode', () => {
    const handler = securityHeaders(false);
    const res = createMockRes();
    handler({} as Request, res, () => {});

    const h = (res as unknown as { _headers: Map<string, string> })._headers;
    expect(h.has('Strict-Transport-Security')).toBe(false);
  });

  it('sets all other headers in non-production mode', () => {
    const handler = securityHeaders(false);
    const res = createMockRes();
    handler({} as Request, res, () => {});

    const h = (res as unknown as { _headers: Map<string, string> })._headers;
    expect(h.get('X-Content-Type-Options')).toBe('nosniff');
    expect(h.get('X-Frame-Options')).toBe('DENY');
    expect(h.get('X-XSS-Protection')).toBe('0');
    expect(h.get('Content-Security-Policy')).toContain("default-src 'self'");
  });
});
