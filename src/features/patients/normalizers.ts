import type {
  FhirAllergyIntolerance,
  FhirCareTeam,
  FhirCondition,
  FhirEncounter,
  FhirMedicationRequest,
  FhirPatient,
  FhirReference,
} from '@/types/fhir';
import type {
  AllergyRow,
  CareTeamRow,
  EncounterRow,
  MedicationRow,
  PatientHeaderModel,
  PatientSummary,
  PrescriptionRow,
  ProblemRow,
} from './types';

const UNKNOWN = 'Unknown';
const NOT_RECORDED = 'Not recorded';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function hasMeaningfulValue(value: string): boolean {
  return value !== UNKNOWN && value !== NOT_RECORDED && value !== 'No MRN';
}

function resourceId(resource: { id?: string }, fallbackPrefix: string): string {
  return resource.id ?? `${fallbackPrefix}-unknown`;
}

function isResourceType<T extends { resourceType: string }>(
  value: unknown,
  resourceType: T['resourceType'],
): value is T {
  return isRecord(value) && value.resourceType === resourceType;
}

export function bundleEntriesOf<T extends { resourceType: string }>(
  bundle: unknown,
  resourceType: T['resourceType'],
): T[] {
  if (!isRecord(bundle) || bundle.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) {
    return [];
  }

  return bundle.entry.flatMap((entry) => {
    const resource = isRecord(entry) ? entry.resource : undefined;
    return isResourceType<T>(resource, resourceType) ? [resource] : [];
  });
}

export function displayCodeableConcept(value: unknown, fallback = UNKNOWN): string {
  if (!isRecord(value)) return fallback;
  const text = stringValue(value.text);
  if (text) return text;
  const directDisplay = stringValue(value.display);
  if (directDisplay) return directDisplay;
  const directCode = stringValue(value.code);
  if (directCode) return directCode;

  if (Array.isArray(value.coding)) {
    for (const coding of value.coding) {
      if (!isRecord(coding)) continue;
      const display = stringValue(coding.display);
      if (display) return display;
      const code = stringValue(coding.code);
      if (code) return code;
    }
  }

  return fallback;
}

export function displayReference(value: unknown, fallback = NOT_RECORDED): string {
  if (!isRecord(value)) return fallback;
  return stringValue(value.display) ?? stringValue(value.reference) ?? fallback;
}

function displayDate(value: unknown, fallback = NOT_RECORDED): string {
  const raw = stringValue(value);
  if (!raw) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    const monthNumber = Number(month);
    const dayNumber = Number(day);
    if (monthNumber >= 1 && monthNumber <= 12 && dayNumber >= 1 && dayNumber <= 31) {
      return `${monthNumber}/${dayNumber}/${year}`;
    }
    return raw;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function normalizeStatus(value: unknown, fallback = UNKNOWN): string {
  const raw = displayCodeableConcept(value, stringValue(value) ?? fallback);
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : fallback;
}

export function patientDisplayName(patient: Pick<FhirPatient, 'id' | 'name'>): string {
  const names = Array.isArray(patient.name) ? patient.name : [];
  const first = names.find((name) => isRecord(name));
  if (!first) return patient.id ?? 'Patient';

  const text = stringValue(first.text);
  if (text) return text;
  const given = stringArray(first.given).join(' ');
  const family = stringValue(first.family);
  return [given, family].filter(Boolean).join(' ') || (patient.id ?? 'Patient');
}

function selectMrn(patient: FhirPatient): string {
  const identifiers = Array.isArray(patient.identifier) ? patient.identifier : [];
  const explicitMrn = identifiers.find((identifier) => {
    const typeText = displayCodeableConcept(identifier.type, '').toLowerCase();
    return (
      typeText.includes('medical record') ||
      typeText === 'mrn' ||
      identifier.system?.toLowerCase().includes('mrn')
    );
  });

  return (
    explicitMrn?.value ??
    identifiers.find((identifier) => stringValue(identifier.value))?.value ??
    'No MRN'
  );
}

function formatPatientSex(gender: unknown): string {
  const raw = stringValue(gender);
  if (!raw) return NOT_RECORDED;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function activeStatus(patient: FhirPatient): {
  label: string;
  description: string;
  isActive: boolean | null;
} {
  if (patient.active === true) {
    return { label: 'Active', description: 'Active patient record', isActive: true };
  }
  if (patient.active === false) {
    return { label: 'Inactive', description: 'Inactive patient record', isActive: false };
  }
  return { label: UNKNOWN, description: 'Active status not recorded', isActive: null };
}

function patientSearchTerms(
  patient: FhirPatient,
  summary: Omit<PatientSummary, 'searchText'>,
): string[] {
  const names = Array.isArray(patient.name) ? patient.name : [];
  const identifiers = Array.isArray(patient.identifier) ? patient.identifier : [];
  const nameTerms = names.flatMap((name) => [
    stringValue(name.text),
    stringValue(name.family),
    ...stringArray(name.given),
  ]);
  const identifierTerms = identifiers.flatMap((identifier) => [
    stringValue(identifier.value),
    stringValue(identifier.system),
    displayCodeableConcept(identifier.type, ''),
  ]);

  return [
    patient.id,
    patient.birthDate,
    patient.gender,
    summary.id,
    summary.displayName,
    summary.birthDateLabel,
    summary.sexLabel,
    summary.mrnLabel,
    summary.activeStatusLabel,
    ...nameTerms,
    ...identifierTerms,
  ].filter((term): term is string => typeof term === 'string' && term.trim().length > 0);
}

export function normalizePatientSummary(value: unknown): PatientSummary | null {
  if (!isResourceType<FhirPatient>(value, 'Patient')) return null;
  const status = activeStatus(value);
  const id = value.id ?? patientDisplayName(value);
  const summary = {
    id,
    displayName: patientDisplayName(value),
    birthDateLabel: displayDate(value.birthDate),
    sexLabel: formatPatientSex(value.gender),
    mrnLabel: selectMrn(value),
    activeStatusLabel: status.label,
    isActive: status.isActive,
  };
  return {
    ...summary,
    searchText: Array.from(new Set(patientSearchTerms(value, summary)))
      .join(' ')
      .toLowerCase(),
  };
}

export function normalizePatientHeader(value: unknown): PatientHeaderModel | null {
  const summary = normalizePatientSummary(value);
  if (!summary || !isResourceType<FhirPatient>(value, 'Patient')) return null;
  return {
    ...summary,
    activeStatusDescription: activeStatus(value).description,
  };
}

export function normalizePatientSummaries(bundle: unknown): PatientSummary[] {
  return bundleEntriesOf<FhirPatient>(bundle, 'Patient').flatMap((patient) => {
    const summary = normalizePatientSummary(patient);
    return summary ? [summary] : [];
  });
}

function reactionText(allergy: FhirAllergyIntolerance): string {
  const reactions = Array.isArray(allergy.reaction) ? allergy.reaction : [];
  const labels = reactions.flatMap((reaction) =>
    Array.isArray(reaction.manifestation)
      ? reaction.manifestation.map((item) => displayCodeableConcept(item, '')).filter(Boolean)
      : [],
  );
  return labels.join(', ') || NOT_RECORDED;
}

function allergySeverity(allergy: FhirAllergyIntolerance): string {
  const reactions = Array.isArray(allergy.reaction) ? allergy.reaction : [];
  return (
    reactions.map((reaction) => stringValue(reaction.severity)).find((severity) => severity) ??
    stringValue(allergy.criticality) ??
    NOT_RECORDED
  );
}

export function normalizeAllergy(value: unknown): AllergyRow | null {
  if (!isResourceType<FhirAllergyIntolerance>(value, 'AllergyIntolerance')) return null;
  const row = {
    id: resourceId(value, 'allergy'),
    substance: displayCodeableConcept(value.code),
    clinicalStatus: normalizeStatus(value.clinicalStatus),
    verificationStatus: normalizeStatus(value.verificationStatus),
    reaction: reactionText(value),
    severity: allergySeverity(value),
    recordedDate: displayDate(value.recordedDate),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.substance) || !hasMeaningfulValue(row.clinicalStatus),
  };
}

export function normalizeProblem(value: unknown): ProblemRow | null {
  if (!isResourceType<FhirCondition>(value, 'Condition')) return null;
  const category = Array.isArray(value.category)
    ? value.category
        .map((item) => displayCodeableConcept(item, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const clinicalStatus = normalizeStatus(value.clinicalStatus);
  const normalizedClinicalStatus = clinicalStatus.toLowerCase();
  const row = {
    id: resourceId(value, 'problem'),
    name: displayCodeableConcept(value.code),
    clinicalStatus,
    verificationStatus: normalizeStatus(value.verificationStatus),
    dateLabel: displayDate(value.onsetDateTime ?? value.recordedDate),
    category: category || NOT_RECORDED,
    isActive:
      hasMeaningfulValue(clinicalStatus) &&
      !normalizedClinicalStatus.includes('inactive') &&
      !normalizedClinicalStatus.includes('resolved'),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

function medicationName(value: FhirMedicationRequest): string {
  return (
    displayCodeableConcept(value.medicationCodeableConcept, '') ||
    displayReference(value.medicationReference, '') ||
    UNKNOWN
  );
}

function dosageText(value: FhirMedicationRequest): string {
  const dosage = Array.isArray(value.dosageInstruction) ? value.dosageInstruction : [];
  return dosage.map((item) => stringValue(item.text)).find(Boolean) ?? NOT_RECORDED;
}

export function normalizeMedicationRequest(value: unknown): MedicationRow | null {
  if (!isResourceType<FhirMedicationRequest>(value, 'MedicationRequest')) return null;
  const row = {
    id: resourceId(value, 'medication'),
    name: medicationName(value),
    status: normalizeStatus(value.status),
    dosage: dosageText(value),
    dateLabel: displayDate(value.authoredOn),
    prescriber: displayReference(value.requester),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name) || !hasMeaningfulValue(row.status),
  };
}

export function normalizePrescription(value: unknown): PrescriptionRow | null {
  if (!isResourceType<FhirMedicationRequest>(value, 'MedicationRequest')) return null;
  const row = {
    id: resourceId(value, 'prescription'),
    name: medicationName(value),
    status: normalizeStatus(value.status),
    intent: normalizeStatus(value.intent),
    authoredDate: displayDate(value.authoredOn),
    dosage: dosageText(value),
    prescriber: displayReference(value.requester),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name) || !hasMeaningfulValue(row.status),
  };
}

export function normalizeCareTeam(value: unknown): CareTeamRow[] {
  if (!isResourceType<FhirCareTeam>(value, 'CareTeam')) return [];
  const participants = Array.isArray(value.participant) ? value.participant : [];
  if (participants.length === 0) {
    return [
      {
        id: resourceId(value, 'care-team'),
        name: NOT_RECORDED,
        role: NOT_RECORDED,
        status: normalizeStatus(value.status),
        reference: NOT_RECORDED,
        hasPartialData: true,
      },
    ];
  }

  return participants.map((participant, index) => {
    const role = Array.isArray(participant.role)
      ? participant.role
          .map((item) => displayCodeableConcept(item, ''))
          .filter(Boolean)
          .join(', ')
      : '';
    const member = participant.member as FhirReference | undefined;
    const name = displayReference(member);
    return {
      id: `${resourceId(value, 'care-team')}-${index}`,
      name,
      role: role || NOT_RECORDED,
      status: normalizeStatus(value.status),
      reference: member?.reference ?? NOT_RECORDED,
      hasPartialData: !hasMeaningfulValue(name),
    };
  });
}

export function normalizeEncounter(value: unknown): EncounterRow | null {
  if (!isResourceType<FhirEncounter>(value, 'Encounter')) return null;
  const type = Array.isArray(value.type)
    ? value.type
        .map((item) => displayCodeableConcept(item, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const location = Array.isArray(value.location)
    ? value.location
        .map((item) => displayReference(item.location, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const participant = Array.isArray(value.participant)
    ? value.participant
        .map((item) => displayReference(item.individual, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const startRaw = stringValue(value.period?.start);
  const sortTime = startRaw ? new Date(startRaw).getTime() : 0;

  const row = {
    id: resourceId(value, 'encounter'),
    type: type || UNKNOWN,
    classLabel: displayCodeableConcept(value.class),
    status: normalizeStatus(value.status),
    start: displayDate(value.period?.start),
    end: displayDate(value.period?.end),
    location: location || NOT_RECORDED,
    participant: participant || NOT_RECORDED,
    sortTime: Number.isNaN(sortTime) ? 0 : sortTime,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.type) || !hasMeaningfulValue(row.start),
  };
}

export const normalizeClinicalBundle = {
  allergies: (bundle: unknown): AllergyRow[] =>
    bundleEntriesOf<FhirAllergyIntolerance>(bundle, 'AllergyIntolerance').flatMap((item) => {
      const row = normalizeAllergy(item);
      return row ? [row] : [];
    }),
  problems: (bundle: unknown): ProblemRow[] =>
    bundleEntriesOf<FhirCondition>(bundle, 'Condition').flatMap((item) => {
      const row = normalizeProblem(item);
      return row ? [row] : [];
    }),
  medications: (bundle: unknown): MedicationRow[] =>
    bundleEntriesOf<FhirMedicationRequest>(bundle, 'MedicationRequest').flatMap((item) => {
      const row = normalizeMedicationRequest(item);
      return row ? [row] : [];
    }),
  prescriptions: (bundle: unknown): PrescriptionRow[] =>
    bundleEntriesOf<FhirMedicationRequest>(bundle, 'MedicationRequest').flatMap((item) => {
      const row = normalizePrescription(item);
      return row ? [row] : [];
    }),
  careTeam: (bundle: unknown): CareTeamRow[] =>
    bundleEntriesOf<FhirCareTeam>(bundle, 'CareTeam').flatMap((item) => normalizeCareTeam(item)),
  encounters: (bundle: unknown): EncounterRow[] =>
    bundleEntriesOf<FhirEncounter>(bundle, 'Encounter')
      .flatMap((item) => {
        const row = normalizeEncounter(item);
        return row ? [row] : [];
      })
      .sort((a, b) => b.sortTime - a.sortTime),
};
