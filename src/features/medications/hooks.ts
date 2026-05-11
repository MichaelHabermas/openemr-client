import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { fetchMedicationsCatalog, type MedicationCatalogApiError } from './api';
import { normalizeMedicationCatalogBundle } from './normalizers';
import type { MedicationCatalogRow } from './types';

export type MedicationQuery<T> = UseQueryResult<T, MedicationCatalogApiError>;

export const medicationKeys = {
  catalog: ['medications', 'catalog'] as const,
};

export function useMedicationsCatalog(): MedicationQuery<MedicationCatalogRow[]> {
  return useQuery({
    queryKey: medicationKeys.catalog,
    queryFn: async () => normalizeMedicationCatalogBundle(await fetchMedicationsCatalog()),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}
