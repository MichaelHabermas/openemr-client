import { afterEach, describe, expect, mock, test } from 'bun:test';
import axios from 'axios';
import type { AppConfig } from '../config';
import { createFhirService, type ClinicalResourceKey } from './fhir-service';

type AxiosGet = typeof axios.get;

const config: AppConfig = {
  openemrUrl: 'https://openemr.example',
  oauthClientId: 'client-id',
  oauthClientSecret: 'client-secret',
  redirectUri: 'http://localhost:5173/callback',
  port: 3000,
  appOrigin: 'http://localhost:5173',
  oauthScope: 'openid api:fhir user/Patient.rs',
};

const originalGet = axios.get;

afterEach(() => {
  axios.get = originalGet;
});

function mockAxiosGet(data: unknown) {
  const get = mock(async () => ({ data })) as unknown as AxiosGet;
  axios.get = get;
  return get;
}

function expectAxiosGetCall(get: AxiosGet, url: string) {
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith(url, {
    headers: { Authorization: 'Bearer access-token' },
  });
}

describe('createFhirService', () => {
  test('fetchPatientBundle returns the raw upstream Patient collection bundle', async () => {
    const upstreamBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Patient', id: 'patient-1' } }],
    };
    const get = mockAxiosGet(upstreamBundle);
    const service = createFhirService(config);

    await expect(service.fetchPatientBundle('access-token')).resolves.toBe(upstreamBundle);

    expectAxiosGetCall(get, 'https://openemr.example/apis/default/fhir/Patient');
  });

  test('fetchPatient reads a raw Patient resource by encoded id path segment', async () => {
    const upstreamPatient = {
      resourceType: 'Patient',
      id: 'patient/id with spaces',
    };
    const get = mockAxiosGet(upstreamPatient);
    const service = createFhirService(config);

    await expect(service.fetchPatient('access-token', 'patient/id with spaces')).resolves.toBe(
      upstreamPatient,
    );

    expectAxiosGetCall(
      get,
      'https://openemr.example/apis/default/fhir/Patient/patient%2Fid%20with%20spaces',
    );
  });

  test.each([
    ['allergies', 'AllergyIntolerance'],
    ['problems', 'Condition'],
    ['medications', 'MedicationRequest'],
    ['prescriptions', 'MedicationRequest'],
    ['care-team', 'CareTeam'],
    ['encounters', 'Encounter'],
  ] as const)(
    'fetchPatientClinicalBundle maps %s to %s and scopes by encoded patient query param',
    async (resourceKey: ClinicalResourceKey, resourceType: string) => {
      const upstreamBundle = {
        resourceType: 'Bundle',
        entry: [{ resource: { resourceType, id: `${resourceKey}-1` } }],
      };
      const get = mockAxiosGet(upstreamBundle);
      const service = createFhirService(config);

      await expect(
        service.fetchPatientClinicalBundle('access-token', resourceKey, 'patient/id with spaces'),
      ).resolves.toBe(upstreamBundle);

      expectAxiosGetCall(
        get,
        `https://openemr.example/apis/default/fhir/${resourceType}?patient=patient%2Fid+with+spaces`,
      );
    },
  );
});
