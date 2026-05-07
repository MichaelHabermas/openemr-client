import type { FhirPatient } from '@/types/fhir';

export function patientDisplayName(p: FhirPatient): string {
  const n = p.name?.[0];
  if (!n) return p.id ?? 'Patient';
  if (n.text) return n.text;
  const given = n.given?.join(' ');
  const family = n.family;
  return [given, family].filter(Boolean).join(' ') || (p.id ?? 'Patient');
}
