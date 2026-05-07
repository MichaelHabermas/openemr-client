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
  hasPartialData: boolean;
}

export interface CareTeamRow {
  id: string;
  name: string;
  role: string;
  status: string;
  reference: string;
  hasPartialData: boolean;
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
  sortTime: number;
  hasPartialData: boolean;
}
