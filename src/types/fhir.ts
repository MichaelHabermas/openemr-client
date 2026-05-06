/** Minimal FHIR shapes used by the patient list UI */

export interface FhirPatient {
  resourceType: "Patient";
  id?: string;
  name?: Array<{
    family?: string;
    given?: string[];
    text?: string;
  }>;
}

export interface FhirBundle {
  resourceType: "Bundle";
  entry?: Array<{
    resource?: FhirPatient;
  }>;
}
