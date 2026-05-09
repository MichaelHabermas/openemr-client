import { useLayoutEffect } from 'react';

function bffOrigin(): string {
  const fromEnv = import.meta.env.VITE_BFF_ORIGIN;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim().replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:3000';
  return window.location.origin;
}

/**
 * OAuth starts on the BFF (`GET /login`). If the dev server serves the SPA for `/login`
 * before the proxy runs, React would otherwise match `*` and send users back to `/`.
 * This route forces a full navigation to the BFF login handler.
 */
export function LoginRedirectPage() {
  useLayoutEffect(() => {
    window.location.replace(`${bffOrigin()}/login`);
  }, []);

  return (
    <div className='grid min-h-[calc(100dvh-9rem)] place-items-center'>
      <p className='text-muted-foreground text-sm'>Redirecting to sign-in…</p>
    </div>
  );
}
