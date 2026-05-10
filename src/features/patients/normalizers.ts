import type {
  FhirAllergyIntolerance,
  FhirCarePlan,
  FhirCareTeam,
  FhirCondition,
  FhirCoverage,
  FhirDiagnosticReport,
  FhirDocumentReference,
  FhirEncounter,
  FhirGoal,
  FhirImmunization,
  FhirMedicationRequest,
  FhirObservation,
  FhirPatient,
  FhirPractitioner,
  FhirProcedure,
  FhirReference,
} from '@/types/fhir';
import type {
  AllergyRow,
  CarePlanRow,
  CareTeamRow,
  CoverageRow,
  DiagnosticReportRow,
  DocumentRow,
  EncounterRow,
  GoalRow,
  ImmunizationRow,
  LabRow,
  MedicationRow,
  PatientHeaderModel,
  PatientSummary,
  PrescriptionRow,
  ProblemRow,
  ProcedureRow,
  VitalRow,
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

export function displayCoding(value: unknown, fallback = UNKNOWN): string {
  if (!isRecord(value)) return fallback;
  return stringValue(value.display) ?? stringValue(value.code) ?? fallback;
}

export function displayReference(value: unknown, fallback = NOT_RECORDED): string {
  if (!isRecord(value)) return fallback;
  return stringValue(value.display) ?? stringValue(value.reference) ?? fallback;
}

function displayDate(value: unknown, fallback = NOT_RECORDED): string {
  const raw = stringValue(value);
  if (!raw) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function computeAge(birthDate: unknown): string {
  const raw = stringValue(birthDate);
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
  const [y, m, d] = raw.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  const monthDiff = now.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) age--;
  return age >= 0 ? String(age) : '';
}

function normalizeStatus(value: unknown, fallback = UNKNOWN): string {
  const raw = displayCodeableConcept(value, stringValue(value) ?? fallback);
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : fallback;
}

function patientDisplayName(patient: Pick<FhirPatient, 'id' | 'name'>): string {
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
    ageLabel: computeAge(value.birthDate),
  };
}

export function normalizePatientSummaries(bundle: unknown): PatientSummary[] {
  return bundleEntriesOf<FhirPatient>(bundle, 'Patient').flatMap((patient) => {
    const summary = normalizePatientSummary(patient);
    return summary ? [summary] : [];
  });
}

function extractNarrativeText(text: unknown): string | undefined {
  if (!isRecord(text)) return undefined;
  const div = stringValue(text.div);
  if (!div) return undefined;
  const stripped = div.replace(/<[^>]+>/g, '').trim();
  return stripped || undefined;
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
  let substance = displayCodeableConcept(value.code);
  if (substance === UNKNOWN) {
    substance = extractNarrativeText(value.text) ?? UNKNOWN;
  }
  const row = {
    id: resourceId(value, 'allergy'),
    substance,
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
  const qty = value.dispenseRequest?.quantity?.value;
  const row = {
    id: resourceId(value, 'prescription'),
    name: medicationName(value),
    status: normalizeStatus(value.status),
    intent: normalizeStatus(value.intent),
    authoredDate: displayDate(value.authoredOn),
    dosage: dosageText(value),
    prescriber: displayReference(value.requester),
    quantity: qty != null ? String(qty) : NOT_RECORDED,
    refills:
      value.dispenseRequest?.numberOfRepeatsAllowed != null
        ? String(value.dispenseRequest.numberOfRepeatsAllowed)
        : NOT_RECORDED,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name) || !hasMeaningfulValue(row.status),
  };
}

export function normalizeCareTeam(value: unknown): CareTeamRow[] {
  if (!isResourceType<FhirCareTeam>(value, 'CareTeam')) return [];
  const participants = Array.isArray(value.participant) ? value.participant : [];
  const facility = Array.isArray(value.managingOrganization)
    ? displayReference(value.managingOrganization[0], NOT_RECORDED)
    : NOT_RECORDED;

  if (participants.length === 0) {
    return [
      {
        id: resourceId(value, 'care-team'),
        name: NOT_RECORDED,
        role: NOT_RECORDED,
        status: normalizeStatus(value.status),
        facility,
        since: NOT_RECORDED,
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
    const refStr = stringValue(member?.reference);
    const practitionerRef = refStr?.startsWith('Practitioner/') ? refStr : undefined;
    return {
      id: `${resourceId(value, 'care-team')}-${index}`,
      name,
      role: role || NOT_RECORDED,
      status: normalizeStatus(value.status),
      facility,
      since: displayDate(participant.period?.start),
      hasPartialData: !hasMeaningfulValue(name),
      practitionerRef,
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
  const participants = Array.isArray(value.participant) ? value.participant : [];
  const participant = participants
    .map((item) => displayReference(item.individual, ''))
    .filter(Boolean)
    .join(', ');
  const participantRefs = participants
    .map((item) => stringValue((item.individual as FhirReference | undefined)?.reference))
    .filter((ref): ref is string => !!ref && ref.startsWith('Practitioner/'));
  const start = displayDate(value.period?.start);
  return {
    id: resourceId(value, 'encounter'),
    type: type || UNKNOWN,
    classLabel: displayCoding(value.class),
    status: normalizeStatus(value.status),
    start,
    end: displayDate(value.period?.end),
    location: location || NOT_RECORDED,
    participant: participant || NOT_RECORDED,
    participantRefs: participantRefs.length > 0 ? participantRefs : undefined,
    hasPartialData: !hasMeaningfulValue(type || UNKNOWN) || !hasMeaningfulValue(start),
  };
}

export function normalizeImmunization(value: unknown): ImmunizationRow | null {
  if (!isResourceType<FhirImmunization>(value, 'Immunization')) return null;
  const protocol = Array.isArray(value.protocolApplied) ? value.protocolApplied[0] : undefined;
  const doseNum = protocol?.doseNumberPositiveInt ?? protocol?.doseNumberString;
  const performer = Array.isArray(value.performer)
    ? value.performer
        .map((p) => displayReference(p.actor, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const row = {
    id: resourceId(value, 'immunization'),
    vaccine: displayCodeableConcept(value.vaccineCode),
    date: displayDate(value.occurrenceDateTime ?? value.occurrenceString),
    status: normalizeStatus(value.status),
    dose: doseNum != null ? String(doseNum) : NOT_RECORDED,
    site: displayCodeableConcept(value.site, NOT_RECORDED),
    performer: performer || NOT_RECORDED,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.vaccine),
  };
}

function observationValue(obs: FhirObservation): string {
  if (obs.valueQuantity?.value != null) {
    const unit = obs.valueQuantity.unit ?? obs.valueQuantity.code ?? '';
    return `${obs.valueQuantity.value} ${unit}`.trim();
  }
  if (obs.valueString) return obs.valueString;
  if (obs.valueCodeableConcept) return displayCodeableConcept(obs.valueCodeableConcept);

  if (Array.isArray(obs.component) && obs.component.length > 0) {
    return obs.component
      .map((c) => {
        const label = displayCodeableConcept(c.code, '');
        const val =
          c.valueQuantity?.value != null
            ? `${c.valueQuantity.value} ${c.valueQuantity.unit ?? ''}`.trim()
            : (c.valueString ?? '');
        return label ? `${label}: ${val}` : val;
      })
      .filter(Boolean)
      .join('; ');
  }
  return NOT_RECORDED;
}

export function normalizeVital(value: unknown): VitalRow | null {
  if (!isResourceType<FhirObservation>(value, 'Observation')) return null;
  const row = {
    id: resourceId(value, 'vital'),
    name: displayCodeableConcept(value.code),
    value: observationValue(value),
    date: displayDate(value.effectiveDateTime ?? value.issued),
    status: normalizeStatus(value.status),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name) || !hasMeaningfulValue(row.value),
  };
}

function referenceRangeText(obs: FhirObservation): string {
  if (!Array.isArray(obs.referenceRange) || obs.referenceRange.length === 0) return NOT_RECORDED;
  return (
    obs.referenceRange
      .map((r) => {
        if (r.text) return r.text;
        const low = r.low?.value != null ? `${r.low.value} ${r.low.unit ?? ''}`.trim() : '';
        const high = r.high?.value != null ? `${r.high.value} ${r.high.unit ?? ''}`.trim() : '';
        if (low && high) return `${low} – ${high}`;
        if (low) return `≥ ${low}`;
        if (high) return `≤ ${high}`;
        return '';
      })
      .filter(Boolean)
      .join('; ') || NOT_RECORDED
  );
}

export function normalizeLab(value: unknown): LabRow | null {
  if (!isResourceType<FhirObservation>(value, 'Observation')) return null;
  const row = {
    id: resourceId(value, 'lab'),
    name: displayCodeableConcept(value.code),
    value: observationValue(value),
    date: displayDate(value.effectiveDateTime ?? value.issued),
    status: normalizeStatus(value.status),
    referenceRange: referenceRangeText(value),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name) || !hasMeaningfulValue(row.value),
  };
}

export function normalizeProcedure(value: unknown): ProcedureRow | null {
  if (!isResourceType<FhirProcedure>(value, 'Procedure')) return null;
  const performer = Array.isArray(value.performer)
    ? value.performer
        .map((p) => displayReference(p.actor, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const reason = Array.isArray(value.reasonCode)
    ? value.reasonCode
        .map((r) => displayCodeableConcept(r, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const row = {
    id: resourceId(value, 'procedure'),
    name: displayCodeableConcept(value.code),
    date: displayDate(value.performedDateTime ?? value.performedPeriod?.start),
    status: normalizeStatus(value.status),
    performer: performer || NOT_RECORDED,
    reason: reason || NOT_RECORDED,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizeDocument(value: unknown): DocumentRow | null {
  if (!isResourceType<FhirDocumentReference>(value, 'DocumentReference')) return null;
  const author = Array.isArray(value.author)
    ? value.author
        .map((a) => displayReference(a, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const row = {
    id: resourceId(value, 'document'),
    type: displayCodeableConcept(value.type),
    date: displayDate(value.date),
    status: normalizeStatus(value.status),
    author: author || NOT_RECORDED,
    description: stringValue(value.description) ?? NOT_RECORDED,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.type),
  };
}

export function normalizeCoverage(value: unknown): CoverageRow | null {
  if (!isResourceType<FhirCoverage>(value, 'Coverage')) return null;
  const payor = Array.isArray(value.payor)
    ? value.payor
        .map((p) => displayReference(p, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const coverageClass = Array.isArray(value.class)
    ? value.class.find((c) => {
        const typeText = displayCodeableConcept(c.type, '').toLowerCase();
        return typeText === 'group' || typeText.includes('subscriber');
      })
    : undefined;
  const period = value.period
    ? `${displayDate(value.period.start)} – ${displayDate(value.period.end)}`
    : NOT_RECORDED;
  const row = {
    id: resourceId(value, 'coverage'),
    type: displayCodeableConcept(value.type),
    status: normalizeStatus(value.status),
    payor: payor || NOT_RECORDED,
    period,
    subscriberId: coverageClass?.value ?? NOT_RECORDED,
    relationship: displayCodeableConcept(value.relationship, NOT_RECORDED),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.type) || !hasMeaningfulValue(row.payor),
  };
}

export function normalizeDiagnosticReport(value: unknown): DiagnosticReportRow | null {
  if (!isResourceType<FhirDiagnosticReport>(value, 'DiagnosticReport')) return null;
  const category = Array.isArray(value.category)
    ? value.category
        .map((c) => displayCodeableConcept(c, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const performer = Array.isArray(value.performer)
    ? value.performer
        .map((p) => displayReference(p, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const row = {
    id: resourceId(value, 'diagnostic-report'),
    name: displayCodeableConcept(value.code),
    date: displayDate(value.effectiveDateTime ?? value.effectivePeriod?.start ?? value.issued),
    status: normalizeStatus(value.status),
    category: category || NOT_RECORDED,
    performer: performer || NOT_RECORDED,
    conclusion: stringValue(value.conclusion) ?? NOT_RECORDED,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizeGoal(value: unknown): GoalRow | null {
  if (!isResourceType<FhirGoal>(value, 'Goal')) return null;
  const category = Array.isArray(value.category)
    ? value.category
        .map((item) => displayCodeableConcept(item, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const target = Array.isArray(value.target) ? value.target[0] : undefined;
  const row = {
    id: resourceId(value, 'goal'),
    description: displayCodeableConcept(value.description),
    lifecycleStatus: normalizeStatus(value.lifecycleStatus),
    achievementStatus: displayCodeableConcept(value.achievementStatus, NOT_RECORDED),
    category: category || NOT_RECORDED,
    startDate: displayDate(value.startDate),
    targetDate: displayDate(target?.dueDate),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.description),
  };
}

export function normalizeCarePlan(value: unknown): CarePlanRow | null {
  if (!isResourceType<FhirCarePlan>(value, 'CarePlan')) return null;
  const category = Array.isArray(value.category)
    ? value.category
        .map((item) => displayCodeableConcept(item, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const period = value.period
    ? `${displayDate(value.period.start)} – ${displayDate(value.period.end)}`
    : NOT_RECORDED;
  const row = {
    id: resourceId(value, 'care-plan'),
    title: stringValue(value.title) ?? displayCodeableConcept(value.category?.[0], UNKNOWN),
    status: normalizeStatus(value.status),
    intent: normalizeStatus(value.intent),
    category: category || NOT_RECORDED,
    period,
    description: stringValue(value.description) ?? NOT_RECORDED,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.title),
  };
}

export function normalizePractitionerName(value: unknown): string | null {
  if (!isResourceType<FhirPractitioner>(value, 'Practitioner')) return null;
  const names = Array.isArray(value.name) ? value.name : [];
  const first = names[0];
  if (!first) return value.id ?? null;
  const text = stringValue(first.text);
  if (text) return text;
  const given = stringArray(first.given).join(' ');
  const family = stringValue(first.family);
  return ([given, family].filter(Boolean).join(' ') || value.id) ?? null;
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
  medications: (bundle: unknown): MedicationRow[] => {
    const entries = bundleEntriesOf<FhirMedicationRequest>(bundle, 'MedicationRequest');
    const nonOrders = entries.filter((item) => item.intent !== 'order');
    const source = nonOrders.length > 0 ? nonOrders : entries;
    return source.flatMap((item) => {
      const row = normalizeMedicationRequest(item);
      return row ? [row] : [];
    });
  },
  prescriptions: (bundle: unknown): PrescriptionRow[] => {
    const entries = bundleEntriesOf<FhirMedicationRequest>(bundle, 'MedicationRequest');
    const orders = entries.filter((item) => item.intent === 'order');
    return orders.flatMap((item) => {
      const row = normalizePrescription(item);
      return row ? [row] : [];
    });
  },
  careTeam: (bundle: unknown): CareTeamRow[] =>
    bundleEntriesOf<FhirCareTeam>(bundle, 'CareTeam').flatMap((item) => normalizeCareTeam(item)),
  encounters: (bundle: unknown): EncounterRow[] => {
    const entries = bundleEntriesOf<FhirEncounter>(bundle, 'Encounter');
    const withSort = entries.flatMap((item) => {
      const row = normalizeEncounter(item);
      if (!row) return [];
      const startRaw = stringValue(item.period?.start);
      const t = startRaw ? new Date(startRaw).getTime() : 0;
      return [{ row, sortTime: Number.isNaN(t) ? 0 : t }];
    });
    withSort.sort((a, b) => b.sortTime - a.sortTime);
    return withSort.map((entry) => entry.row);
  },
  immunizations: (bundle: unknown): ImmunizationRow[] =>
    bundleEntriesOf<FhirImmunization>(bundle, 'Immunization').flatMap((item) => {
      const row = normalizeImmunization(item);
      return row ? [row] : [];
    }),
  vitals: (bundle: unknown): VitalRow[] => {
    const entries = bundleEntriesOf<FhirObservation>(bundle, 'Observation');
    const withSort = entries.flatMap((item) => {
      const row = normalizeVital(item);
      if (!row) return [];
      const dateRaw = stringValue(item.effectiveDateTime ?? item.issued);
      const t = dateRaw ? new Date(dateRaw).getTime() : 0;
      return [{ row, sortTime: Number.isNaN(t) ? 0 : t }];
    });
    withSort.sort((a, b) => b.sortTime - a.sortTime);
    return withSort.map((entry) => entry.row);
  },
  labs: (bundle: unknown): LabRow[] => {
    const entries = bundleEntriesOf<FhirObservation>(bundle, 'Observation');
    const withSort = entries.flatMap((item) => {
      const row = normalizeLab(item);
      if (!row) return [];
      const dateRaw = stringValue(item.effectiveDateTime ?? item.issued);
      const t = dateRaw ? new Date(dateRaw).getTime() : 0;
      return [{ row, sortTime: Number.isNaN(t) ? 0 : t }];
    });
    withSort.sort((a, b) => b.sortTime - a.sortTime);
    return withSort.map((entry) => entry.row);
  },
  procedures: (bundle: unknown): ProcedureRow[] =>
    bundleEntriesOf<FhirProcedure>(bundle, 'Procedure').flatMap((item) => {
      const row = normalizeProcedure(item);
      return row ? [row] : [];
    }),
  documents: (bundle: unknown): DocumentRow[] =>
    bundleEntriesOf<FhirDocumentReference>(bundle, 'DocumentReference').flatMap((item) => {
      const row = normalizeDocument(item);
      return row ? [row] : [];
    }),
  coverage: (bundle: unknown): CoverageRow[] =>
    bundleEntriesOf<FhirCoverage>(bundle, 'Coverage').flatMap((item) => {
      const row = normalizeCoverage(item);
      return row ? [row] : [];
    }),
  diagnosticReports: (bundle: unknown): DiagnosticReportRow[] =>
    bundleEntriesOf<FhirDiagnosticReport>(bundle, 'DiagnosticReport').flatMap((item) => {
      const row = normalizeDiagnosticReport(item);
      return row ? [row] : [];
    }),
  goals: (bundle: unknown): GoalRow[] =>
    bundleEntriesOf<FhirGoal>(bundle, 'Goal').flatMap((item) => {
      const row = normalizeGoal(item);
      return row ? [row] : [];
    }),
  carePlans: (bundle: unknown): CarePlanRow[] =>
    bundleEntriesOf<FhirCarePlan>(bundle, 'CarePlan').flatMap((item) => {
      const row = normalizeCarePlan(item);
      return row ? [row] : [];
    }),
};
