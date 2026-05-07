import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { oauthStateCookieName } from '../constants';

const oauthStateByteLength = 32;

const oauthStateCookieOptions = {
  httpOnly: true,
  maxAge: 10 * 60 * 1000,
  path: '/',
  sameSite: 'lax',
} satisfies CookieOptions;

export function generateOAuthState(): string {
  return randomBytes(oauthStateByteLength).toString('base64url');
}

export function readOAuthStateCookie(req: Request): string | undefined {
  const state = req.cookies?.[oauthStateCookieName];
  return typeof state === 'string' && state ? state : undefined;
}

export function setOAuthStateCookie(res: Response, state: string) {
  res.cookie(oauthStateCookieName, state, {
    ...oauthStateCookieOptions,
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearOAuthStateCookie(res: Response) {
  res.clearCookie(oauthStateCookieName, { path: oauthStateCookieOptions.path });
}

export function createOAuthStateCookie(res: Response): string {
  const state = generateOAuthState();
  setOAuthStateCookie(res, state);
  return state;
}

export function isValidOAuthState(
  actual: string | undefined,
  expected: string | undefined,
): boolean {
  if (!actual || !expected) return false;

  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);

  if (actualBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(actualBytes, expectedBytes);
}
