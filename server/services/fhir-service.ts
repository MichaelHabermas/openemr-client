import axios from 'axios';
import type { AppConfig } from '../config';

const resourceTypesByKey = {
  allergies: 'AllergyIntolerance',
  problems: 'Condition',
  medications: 'MedicationRequest',
  prescriptions: 'MedicationRequest',
  'care-team': 'CareTeam',
  encounters: 'Encounter',
  immunizations: 'Immunization',
  vitals: 'Observation',
  labs: 'Observation',
  'social-history': 'Observation',
  procedures: 'Procedure',
  documents: 'DocumentReference',
  coverage: 'Coverage',
  'diagnostic-reports': 'DiagnosticReport',
  goals: 'Goal',
  'care-plans': 'CarePlan',
  'family-history': 'FamilyMemberHistory',
  appointments: 'Appointment',
  devices: 'Device',
  'service-requests': 'ServiceRequest',
  'related-persons': 'RelatedPerson',
} as const;

const categoryByKey: Partial<Record<ClinicalResourceKey, string>> = {
  vitals: 'vital-signs',
  labs: 'laboratory',
  'social-history': 'social-history',
};

export type ClinicalResourceKey = keyof typeof resourceTypesByKey;

export interface FhirService {
  fetchPatientBundle(accessToken: string): Promise<unknown>;
  fetchPatient(accessToken: string, patientId: string): Promise<unknown>;
  fetchPatientClinicalBundle(
    accessToken: string,
    resourceKey: ClinicalResourceKey,
    patientId: string,
  ): Promise<unknown>;
  fetchPractitioner(accessToken: string, practitionerId: string): Promise<unknown>;
  fetchEncounter(accessToken: string, encounterId: string): Promise<unknown>;
  fetchEncounterObservations(accessToken: string, encounterId: string): Promise<unknown>;
  fetchDocumentContent(
    accessToken: string,
    documentId: string,
  ): Promise<{ contentType: string; data: Buffer }>;
  fetchLocationBundle(accessToken: string): Promise<unknown>;
  fetchOrganizationBundle(accessToken: string): Promise<unknown>;
  fetchMedicationBundle(accessToken: string): Promise<unknown>;
  fetchPractitionerRoles(accessToken: string, practitionerId: string): Promise<unknown>;
  createAllergyIntolerance(accessToken: string, body: unknown): Promise<unknown>;
  createCondition(accessToken: string, body: unknown): Promise<unknown>;
  createAppointment(accessToken: string, body: unknown): Promise<unknown>;
  fetchPatientProvenance(accessToken: string, patientId: string): Promise<unknown>;
}

export function createFhirService(config: AppConfig): FhirService {
  const fhirBaseUrl = new URL('/apis/default/fhir/', config.openemrUrl);

  async function getFhirResource(accessToken: string, url: URL) {
    const res = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }

  async function postFhirResource(accessToken: string, url: URL, body: unknown) {
    const res = await axios.post(url.toString(), body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
      },
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
      const category = categoryByKey[resourceKey];
      if (category) {
        url.searchParams.set('category', category);
      }
      return getFhirResource(accessToken, url);
    },

    async fetchPractitioner(accessToken: string, practitionerId: string) {
      const url = new URL(`Practitioner/${encodeURIComponent(practitionerId)}`, fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchEncounter(accessToken: string, encounterId: string) {
      const url = new URL(`Encounter/${encodeURIComponent(encounterId)}`, fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchEncounterObservations(accessToken: string, encounterId: string) {
      const url = new URL('Observation', fhirBaseUrl);
      url.searchParams.set('encounter', `Encounter/${encounterId}`);
      return getFhirResource(accessToken, url);
    },

    async fetchLocationBundle(accessToken: string) {
      const url = new URL('Location', fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchOrganizationBundle(accessToken: string) {
      const url = new URL('Organization', fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchMedicationBundle(accessToken: string) {
      const url = new URL('Medication', fhirBaseUrl);
      return getFhirResource(accessToken, url);
    },

    async fetchPractitionerRoles(accessToken: string, practitionerId: string) {
      const url = new URL('PractitionerRole', fhirBaseUrl);
      url.searchParams.set('practitioner', `Practitioner/${practitionerId}`);
      return getFhirResource(accessToken, url);
    },

    async createAllergyIntolerance(accessToken: string, body: unknown) {
      const url = new URL('AllergyIntolerance', fhirBaseUrl);
      return postFhirResource(accessToken, url, body);
    },

    async createCondition(accessToken: string, body: unknown) {
      const url = new URL('Condition', fhirBaseUrl);
      return postFhirResource(accessToken, url, body);
    },

    async createAppointment(accessToken: string, body: unknown) {
      const url = new URL('Appointment', fhirBaseUrl);
      return postFhirResource(accessToken, url, body);
    },

    async fetchPatientProvenance(accessToken: string, patientId: string) {
      const url = new URL('Provenance', fhirBaseUrl);
      url.searchParams.set('patient', patientId);
      return getFhirResource(accessToken, url);
    },

    async fetchDocumentContent(accessToken: string, documentId: string) {
      const url = new URL(`Binary/${encodeURIComponent(documentId)}`, fhirBaseUrl);
      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'arraybuffer',
      });
      const contentType =
        typeof res.headers['content-type'] === 'string'
          ? res.headers['content-type']
          : 'application/octet-stream';
      return { contentType, data: Buffer.from(res.data as ArrayBuffer) };
    },
  };
}
