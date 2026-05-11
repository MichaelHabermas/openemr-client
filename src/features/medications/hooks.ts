import { useEffect, useState } from 'react';

import type { LoadState, PatientFeatureError } from '@/features/patients/types';

import { MedicationCatalogApiError, fetchMedicationsCatalog } from './api';
import { normalizeMedicationCatalogBundle } from './normalizers';
import type { MedicationCatalogRow } from './types';

function toError(error: unknown): PatientFeatureError {
  if (error instanceof MedicationCatalogApiError) {
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

export function useMedicationsCatalog(): LoadState<MedicationCatalogRow[]> {
  return useAsyncState(
    async () => normalizeMedicationCatalogBundle(await fetchMedicationsCatalog()),
    (rows) => rows.length === 0,
  );
}
