/** Partial FHIR shapes for dashboard display. This is not a full FHIR SDK. */

export interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FhirCodeableConcept {
  text?: string;
  coding?: FhirCoding[];
}

export interface FhirReference {
  reference?: string;
  display?: string;
}

export interface FhirPeriod {
  start?: string;
  end?: string;
}

export interface FhirIdentifier {
  system?: string;
  value?: string;
  type?: FhirCodeableConcept;
}

export interface FhirHumanName {
  family?: string;
  given?: string[];
  text?: string;
}

export interface FhirPatient {
  resourceType: 'Patient';
  id?: string;
  active?: boolean;
  birthDate?: string;
  gender?: string;
  identifier?: FhirIdentifier[];
  name?: FhirHumanName[];
}

export interface FhirAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: FhirCodeableConcept;
  code?: FhirCodeableConcept;
  criticality?: string;
  text?: { status?: string; div?: string };
  reaction?: Array<{
    manifestation?: FhirCodeableConcept[];
    severity?: string;
  }>;
  recordedDate?: string;
  verificationStatus?: FhirCodeableConcept;
}

export interface FhirCondition {
  resourceType: 'Condition';
  id?: string;
  category?: FhirCodeableConcept[];
  clinicalStatus?: FhirCodeableConcept;
  code?: FhirCodeableConcept;
  onsetDateTime?: string;
  recordedDate?: string;
  verificationStatus?: FhirCodeableConcept;
}

export interface FhirMedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  authoredOn?: string;
  dispenseRequest?: {
    quantity?: { value?: number; unit?: string };
    numberOfRepeatsAllowed?: number;
  };
  dosageInstruction?: Array<{
    text?: string;
  }>;
  intent?: string;
  medicationCodeableConcept?: FhirCodeableConcept;
  medicationReference?: FhirReference;
  requester?: FhirReference;
  status?: string;
}

export interface FhirCareTeam {
  resourceType: 'CareTeam';
  id?: string;
  managingOrganization?: FhirReference[];
  participant?: Array<{
    member?: FhirReference;
    period?: FhirPeriod;
    role?: FhirCodeableConcept[];
  }>;
  status?: string;
}

export interface FhirEncounter {
  resourceType: 'Encounter';
  id?: string;
  class?: FhirCoding;
  location?: Array<{
    location?: FhirReference;
  }>;
  participant?: Array<{
    individual?: FhirReference;
  }>;
  period?: FhirPeriod;
  status?: string;
  type?: FhirCodeableConcept[];
}

export interface FhirImmunization {
  resourceType: 'Immunization';
  id?: string;
  status?: string;
  vaccineCode?: FhirCodeableConcept;
  patient?: FhirReference;
  occurrenceDateTime?: string;
  occurrenceString?: string;
  primarySource?: boolean;
  lotNumber?: string;
  site?: FhirCodeableConcept;
  route?: FhirCodeableConcept;
  doseQuantity?: { value?: number; unit?: string };
  performer?: Array<{ actor?: FhirReference }>;
  note?: Array<{ text?: string }>;
  protocolApplied?: Array<{
    doseNumberPositiveInt?: number;
    doseNumberString?: string;
    series?: string;
  }>;
}

export interface FhirObservation {
  resourceType: 'Observation';
  id?: string;
  status?: string;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  effectiveDateTime?: string;
  issued?: string;
  valueQuantity?: { value?: number; unit?: string; system?: string; code?: string };
  valueString?: string;
  valueCodeableConcept?: FhirCodeableConcept;
  component?: Array<{
    code?: FhirCodeableConcept;
    valueQuantity?: { value?: number; unit?: string; system?: string; code?: string };
    valueString?: string;
  }>;
  referenceRange?: Array<{
    low?: { value?: number; unit?: string };
    high?: { value?: number; unit?: string };
    text?: string;
  }>;
}

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  name?: FhirHumanName[];
  identifier?: FhirIdentifier[];
  active?: boolean;
}
