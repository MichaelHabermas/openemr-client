import type { PatientSummary } from './types';

function queryTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function filterPatients(patients: PatientSummary[], query: string): PatientSummary[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return patients;

  return patients.filter((patient) => tokens.every((token) => patient.searchText.includes(token)));
}
