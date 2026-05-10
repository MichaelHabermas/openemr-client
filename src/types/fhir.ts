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

export interface FhirProcedure {
  resourceType: 'Procedure';
  id?: string;
  status?: string;
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  performedDateTime?: string;
  performedPeriod?: FhirPeriod;
  performer?: Array<{
    actor?: FhirReference;
  }>;
  reasonCode?: FhirCodeableConcept[];
  bodySite?: FhirCodeableConcept[];
  category?: FhirCodeableConcept;
  note?: Array<{ text?: string }>;
}

export interface FhirDocumentReference {
  resourceType: 'DocumentReference';
  id?: string;
  status?: string;
  type?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  subject?: FhirReference;
  date?: string;
  author?: FhirReference[];
  description?: string;
  content?: Array<{
    attachment?: {
      contentType?: string;
      url?: string;
      title?: string;
      size?: number;
    };
  }>;
}

export interface FhirCoverage {
  resourceType: 'Coverage';
  id?: string;
  status?: string;
  type?: FhirCodeableConcept;
  subscriber?: FhirReference;
  beneficiary?: FhirReference;
  relationship?: FhirCodeableConcept;
  period?: FhirPeriod;
  payor?: FhirReference[];
  class?: Array<{
    type?: FhirCodeableConcept;
    value?: string;
    name?: string;
  }>;
}

export interface FhirGoal {
  resourceType: 'Goal';
  id?: string;
  lifecycleStatus?: string;
  achievementStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  description?: FhirCodeableConcept;
  subject?: FhirReference;
  startDate?: string;
  target?: Array<{
    measure?: FhirCodeableConcept;
    detailString?: string;
    dueDate?: string;
  }>;
  statusDate?: string;
  note?: Array<{ text?: string }>;
}

export interface FhirCarePlan {
  resourceType: 'CarePlan';
  id?: string;
  status?: string;
  intent?: string;
  title?: string;
  description?: string;
  category?: FhirCodeableConcept[];
  subject?: FhirReference;
  period?: FhirPeriod;
  careTeam?: FhirReference[];
  addresses?: FhirReference[];
  goal?: FhirReference[];
  activity?: Array<{
    detail?: {
      status?: string;
      code?: FhirCodeableConcept;
      description?: string;
    };
  }>;
}

export interface FhirFamilyMemberHistory {
  resourceType: 'FamilyMemberHistory';
  id?: string;
  status?: string;
  patient?: FhirReference;
  relationship?: FhirCodeableConcept;
  sex?: FhirCodeableConcept;
  bornDate?: string;
  deceasedBoolean?: boolean;
  deceasedDate?: string;
  condition?: Array<{
    code?: FhirCodeableConcept;
    outcome?: FhirCodeableConcept;
    onsetAge?: { value?: number; unit?: string };
    onsetString?: string;
  }>;
}

export interface FhirAppointment {
  resourceType: 'Appointment';
  id?: string;
  status?: string;
  serviceType?: FhirCodeableConcept[];
  appointmentType?: FhirCodeableConcept;
  reasonCode?: FhirCodeableConcept[];
  start?: string;
  end?: string;
  minutesDuration?: number;
  description?: string;
  participant?: Array<{
    actor?: FhirReference;
    status?: string;
  }>;
}

export interface FhirDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id?: string;
  status?: string;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: FhirPeriod;
  issued?: string;
  performer?: FhirReference[];
  result?: FhirReference[];
  conclusion?: string;
}
