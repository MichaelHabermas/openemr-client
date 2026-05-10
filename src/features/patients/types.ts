export interface PatientFeatureError {
  status: number;
  code?: string;
  message: string;
  authRequired: boolean;
}

export type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; isEmpty: boolean }
  | { status: 'error'; error: PatientFeatureError };

export interface PatientSummary {
  id: string;
  displayName: string;
  birthDateLabel: string;
  sexLabel: string;
  mrnLabel: string;
  activeStatusLabel: string;
  isActive: boolean | null;
  searchText: string;
}

export interface PatientHeaderModel extends PatientSummary {
  activeStatusDescription: string;
  ageLabel: string;
}

export interface AllergyRow {
  id: string;
  substance: string;
  clinicalStatus: string;
  verificationStatus: string;
  reaction: string;
  severity: string;
  recordedDate: string;
  hasPartialData: boolean;
}

export interface ProblemRow {
  id: string;
  name: string;
  clinicalStatus: string;
  verificationStatus: string;
  dateLabel: string;
  category: string;
  isActive: boolean;
  hasPartialData: boolean;
}

export interface MedicationRow {
  id: string;
  name: string;
  status: string;
  dosage: string;
  dateLabel: string;
  prescriber: string;
  hasPartialData: boolean;
}

export interface PrescriptionRow {
  id: string;
  name: string;
  status: string;
  intent: string;
  authoredDate: string;
  dosage: string;
  prescriber: string;
  quantity: string;
  refills: string;
  hasPartialData: boolean;
}

export interface CareTeamRow {
  id: string;
  name: string;
  role: string;
  status: string;
  facility: string;
  since: string;
  hasPartialData: boolean;
  practitionerRef?: string;
}

export interface EncounterRow {
  id: string;
  type: string;
  classLabel: string;
  status: string;
  start: string;
  end: string;
  location: string;
  participant: string;
  hasPartialData: boolean;
  participantRefs?: string[];
}

export interface ImmunizationRow {
  id: string;
  vaccine: string;
  date: string;
  status: string;
  dose: string;
  site: string;
  performer: string;
  hasPartialData: boolean;
}

export interface VitalRow {
  id: string;
  name: string;
  value: string;
  date: string;
  status: string;
  hasPartialData: boolean;
}

export interface LabRow {
  id: string;
  name: string;
  value: string;
  date: string;
  status: string;
  referenceRange: string;
  hasPartialData: boolean;
}

export interface ProcedureRow {
  id: string;
  name: string;
  date: string;
  status: string;
  performer: string;
  reason: string;
  hasPartialData: boolean;
}

export interface DocumentRow {
  id: string;
  type: string;
  date: string;
  status: string;
  author: string;
  description: string;
  hasPartialData: boolean;
}

export interface CoverageRow {
  id: string;
  type: string;
  status: string;
  payor: string;
  period: string;
  subscriberId: string;
  relationship: string;
  hasPartialData: boolean;
}

export interface GoalRow {
  id: string;
  description: string;
  lifecycleStatus: string;
  achievementStatus: string;
  category: string;
  startDate: string;
  targetDate: string;
  hasPartialData: boolean;
}

export interface CarePlanRow {
  id: string;
  title: string;
  status: string;
  intent: string;
  category: string;
  period: string;
  description: string;
  hasPartialData: boolean;
}

export interface DiagnosticReportRow {
  id: string;
  name: string;
  date: string;
  status: string;
  category: string;
  performer: string;
  conclusion: string;
  hasPartialData: boolean;
}

export interface SocialHistoryRow {
  id: string;
  name: string;
  value: string;
  date: string;
  status: string;
  hasPartialData: boolean;
}

export interface FamilyHistoryRow {
  id: string;
  relationship: string;
  condition: string;
  outcome: string;
  onset: string;
  status: string;
  hasPartialData: boolean;
}

export interface AppointmentRow {
  id: string;
  type: string;
  reason: string;
  start: string;
  end: string;
  status: string;
  participant: string;
  hasPartialData: boolean;
}

export interface DeviceRow {
  id: string;
  deviceName: string;
  type: string;
  status: string;
  manufacturer: string;
  expirationDate: string;
  hasPartialData: boolean;
}

export interface ServiceRequestRow {
  id: string;
  name: string;
  status: string;
  intent: string;
  priority: string;
  requester: string;
  authoredOn: string;
  hasPartialData: boolean;
}

export interface RelatedPersonRow {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  address: string;
  hasPartialData: boolean;
}
