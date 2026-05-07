import type { FhirBundle } from '@/types/fhir';
import { apiFetch } from './http';

export class PatientsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'PatientsApiError';
  }
}

export async function fetchPatientBundle(): Promise<FhirBundle> {
  const res = await apiFetch('/api/patients');
  if (!res.ok) {
    const body = await res.text();
    throw new PatientsApiError(body || res.statusText, res.status);
  }
  return res.json() as Promise<FhirBundle>;
}

export async function logout(): Promise<void> {
  await apiFetch('/api/logout', { method: 'POST' });
}
