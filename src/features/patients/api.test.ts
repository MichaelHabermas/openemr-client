import { afterEach, describe, expect, mock, test } from 'bun:test';

import {
  fetchPatient,
  fetchPatientAllergies,
  fetchPatientCareTeam,
  fetchPatientEncounters,
  fetchPatientMedications,
  fetchPatientPrescriptions,
  fetchPatientProblems,
  fetchPatients,
  PatientFeatureApiError,
} from './api';

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

afterEach(() => {
  mock.restore();
  globalThis.fetch = originalFetch;
});

function installFetchMock(fetchMock: ReturnType<typeof mock>) {
  globalThis.fetch = fetchMock as unknown as typeof fetch;
}

describe('patient feature API', () => {
  test('fetchPatients calls the patient list BFF endpoint with credentials', async () => {
    const fetchMock = mock(() => jsonResponse({ resourceType: 'Bundle' }));
    installFetchMock(fetchMock);

    await expect(fetchPatients()).resolves.toEqual({ resourceType: 'Bundle' });

    expect(fetchMock).toHaveBeenCalledWith('/api/patients', {
      credentials: 'include',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
  });

  test('patient-scoped methods encode patient ids and call all E3 endpoints', async () => {
    const fetchMock = mock(() => jsonResponse({ ok: true }));
    installFetchMock(fetchMock);
    const patientId = 'patient/id with spaces';

    await fetchPatient(patientId);
    await fetchPatientAllergies(patientId);
    await fetchPatientProblems(patientId);
    await fetchPatientMedications(patientId);
    await fetchPatientPrescriptions(patientId);
    await fetchPatientCareTeam(patientId);
    await fetchPatientEncounters(patientId);

    expect(fetchMock.mock.calls.map((call) => (call as unknown[])[0])).toEqual([
      '/api/patients/patient%2Fid%20with%20spaces',
      '/api/patients/patient%2Fid%20with%20spaces/allergies',
      '/api/patients/patient%2Fid%20with%20spaces/problems',
      '/api/patients/patient%2Fid%20with%20spaces/medications',
      '/api/patients/patient%2Fid%20with%20spaces/prescriptions',
      '/api/patients/patient%2Fid%20with%20spaces/care-team',
      '/api/patients/patient%2Fid%20with%20spaces/encounters',
    ]);
  });

  test('401 responses become typed auth-required errors with safe messages', async () => {
    installFetchMock(mock(() => jsonResponse({ error: 'not_authenticated' }, { status: 401 })));

    await expect(fetchPatients()).rejects.toMatchObject({
      name: 'PatientFeatureApiError',
      status: 401,
      code: 'not_authenticated',
      authRequired: true,
      message: 'Please sign in again to view patient data.',
    } satisfies Partial<PatientFeatureApiError>);
  });

  test('non-json errors do not leak raw response text', async () => {
    installFetchMock(
      mock(
        () =>
          new Response('upstream stack trace with patient payload', {
            status: 502,
            headers: { 'content-type': 'text/plain' },
          }),
      ),
    );

    await expect(fetchPatients()).rejects.toMatchObject({
      status: 502,
      message: 'Patient data could not be loaded.',
    });
  });
});
