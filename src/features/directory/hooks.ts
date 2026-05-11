import { useEffect, useState } from 'react';

import type { LoadState, PatientFeatureError } from '@/features/patients/types';

import { DirectoryApiError, fetchLocations, fetchOrganizations } from './api';
import { normalizeLocationBundle, normalizeOrganizationBundle } from './normalizers';
import type { LocationRow, OrganizationRow } from './types';

function toError(error: unknown): PatientFeatureError {
  if (error instanceof DirectoryApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      authRequired: error.authRequired,
    };
  }
  return { status: 0, message: 'Data could not be loaded.', authRequired: false };
}

function useAsyncState<T>(load: () => Promise<T>, isEmpty: (data: T) => boolean): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void load()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data, isEmpty: isEmpty(data) });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: toError(error) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export function useLocations(): LoadState<LocationRow[]> {
  return useAsyncState(
    async () => normalizeLocationBundle(await fetchLocations()),
    (rows) => rows.length === 0,
  );
}

export function useOrganizations(): LoadState<OrganizationRow[]> {
  return useAsyncState(
    async () => normalizeOrganizationBundle(await fetchOrganizations()),
    (rows) => rows.length === 0,
  );
}
