import axios from 'axios';
import type { AppConfig } from '../config';

export interface FhirService {
  fetchPatientBundle(accessToken: string): Promise<unknown>;
}

export function createFhirService(config: AppConfig): FhirService {
  return {
    async fetchPatientBundle(accessToken: string) {
      const url = `${config.openemrUrl}/apis/default/fhir/Patient`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    },
  };
}
