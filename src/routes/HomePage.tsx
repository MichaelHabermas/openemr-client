import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const [params] = useSearchParams();
  const oauthError = params.get('error') === 'oauth';

  return (
    <div className='grid min-h-[calc(100dvh-9rem)] place-items-center'>
      <Card className='w-full max-w-2xl rounded-lg border-primary/20 shadow-sm'>
        <CardHeader>
          <p className='text-primary text-xs font-semibold tracking-wide uppercase'>
            Clinical co-pilot dashboard
          </p>
          <CardTitle className='text-3xl tracking-tight'>Connect to OpenEMR</CardTitle>
          <CardDescription>
            Sign in with OAuth2 to open the modern patient dashboard. OpenEMR remains the source of
            truth; this app is a clearer presentation layer over its FHIR data.
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
            <Link to='/login'>Login with OpenEMR</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
