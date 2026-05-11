import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { LocationsTable } from '@/features/directory/components/LocationsTable';
import { OrganizationsTable } from '@/features/directory/components/OrganizationsTable';
import { useLocations, useOrganizations } from '@/features/directory/hooks';

export function DirectoryPage() {
  const navigate = useNavigate();
  const locationsState = useLocations();
  const organizationsState = useOrganizations();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const authRequired =
      (locationsState.status === 'error' && locationsState.error.authRequired) ||
      (organizationsState.status === 'error' && organizationsState.error.authRequired);
    if (authRequired && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/');
    }
  }, [navigate, locationsState, organizationsState]);

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-primary text-xs font-semibold tracking-wide uppercase'>
          OpenEMR facility index
        </p>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight'>Facility Directory</h1>
      </div>

      <LocationsTable state={locationsState} />
      <OrganizationsTable state={organizationsState} />
    </div>
  );
}
