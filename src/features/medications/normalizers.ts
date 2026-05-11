import type { FhirMedication } from '@/types/fhir';
import {
  bundleEntriesOf,
  displayCodeableConcept,
  displayReference,
} from '@/features/patients/normalizers';
import type { MedicationCatalogRow } from './types';

const UNKNOWN = 'Unknown';
const NOT_RECORDED = 'Not recorded';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function hasMeaningfulValue(value: string): boolean {
  return value !== UNKNOWN && value !== NOT_RECORDED;
}

function isResourceType<T extends { resourceType: string }>(
  value: unknown,
  resourceType: T['resourceType'],
): value is T {
  return isRecord(value) && value.resourceType === resourceType;
}

function resourceId(resource: { id?: string }, fallbackPrefix: string): string {
  return resource.id ?? `${fallbackPrefix}-unknown`;
}

export function normalizeMedicationCatalog(value: unknown): MedicationCatalogRow | null {
  if (!isResourceType<FhirMedication>(value, 'Medication')) return null;
  const name = displayCodeableConcept(value.code);
  const row = {
    id: resourceId(value, 'medication-catalog'),
    name,
    status: value.status ? value.status.charAt(0).toUpperCase() + value.status.slice(1) : UNKNOWN,
    form: displayCodeableConcept(value.form, NOT_RECORDED),
    manufacturer: displayReference(value.manufacturer, NOT_RECORDED),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizeMedicationCatalogBundle(bundle: unknown): MedicationCatalogRow[] {
  return bundleEntriesOf<FhirMedication>(bundle, 'Medication').flatMap((item) => {
    const row = normalizeMedicationCatalog(item);
    return row ? [row] : [];
  });
}
