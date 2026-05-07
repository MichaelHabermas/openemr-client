import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const [params] = useSearchParams();
  const oauthError = params.get('error') === 'oauth';

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Connect to OpenEMR</CardTitle>
          <CardDescription>
            Sign in with OAuth2. Your credentials stay on the server; the app only receives an
            httpOnly session cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {oauthError ? (
            <p className='text-sm text-destructive' role='alert'>
              Sign-in failed. Check server logs and your{' '}
              <code className='rounded bg-muted px-1 py-0.5 text-xs'>.env</code> values.
            </p>
          ) : null}
          <Button asChild size='lg'>
            <a href='/login'>Login with OpenEMR</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
