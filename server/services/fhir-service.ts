import axios from 'axios';
import type { AppConfig } from '../config';

const resourceTypesByKey = {
  allergies: 'AllergyIntolerance',
  problems: 'Condition',
  medications: 'MedicationRequest',
  prescriptions: 'MedicationRequest',
  'care-team': 'CareTeam',
  encounters: 'Encounter',
} as const;

export type ClinicalResourceKey = keyof typeof resourceTypesByKey;

export interface FhirService {
  fetchPatientBundle(accessToken: string): Promise<unknown>;
  fetchPatient(accessToken: string, patientId: string): Promise<unknown>;
  fetchPatientClinicalBundle(
    accessToken: string,
    resourceKey: ClinicalResourceKey,
    patientId: string,
  ): Promise<unknown>;
}

export function createFhirService(config: AppConfig): FhirService {
  const fhirBaseUrl = new URL('/apis/default/fhir/', config.openemrUrl);

  async function getFhirResource(accessToken: string, url: URL) {
    const res = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }

  return {
    async fetchPatientBundle(accessToken: string) {
      const url = new URL('Patient', fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchPatient(accessToken: string, patientId: string) {
      const url = new URL(`Patient/${encodeURIComponent(patientId)}`, fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchPatientClinicalBundle(
      accessToken: string,
      resourceKey: ClinicalResourceKey,
      patientId: string,
    ) {
      const resourceType = resourceTypesByKey[resourceKey];
      const url = new URL(resourceType, fhirBaseUrl);
      url.searchParams.set('patient', patientId);
      return getFhirResource(accessToken, url);
    },
  };
}
