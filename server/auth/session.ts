import type { CookieOptions, Request, Response } from 'express';
import { accessTokenCookieName } from '../constants';

const accessTokenCookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
} satisfies CookieOptions;

export function readAccessTokenCookie(req: Request): string | undefined {
  const token = req.cookies?.[accessTokenCookieName];
  return typeof token === 'string' && token ? token : undefined;
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie(accessTokenCookieName, accessToken, {
    ...accessTokenCookieOptions,
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearAccessTokenCookie(res: Response) {
  res.clearCookie(accessTokenCookieName, { path: accessTokenCookieOptions.path });
}
