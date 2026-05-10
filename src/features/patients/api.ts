import { apiFetch } from '@/lib/api/http';

export class PatientFeatureApiError extends Error {
  readonly authRequired: boolean;
  readonly code?: string;

  constructor(
    message: string,
    readonly status: number,
    code?: string,
  ) {
    super(message);
    this.name = 'PatientFeatureApiError';
    this.code = code;
    this.authRequired = status === 401;
  }
}

type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
};

async function safeErrorBody(res: Response): Promise<ApiErrorBody> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return {};

  try {
    const body = (await res.json()) as unknown;
    return body && typeof body === 'object' ? (body as ApiErrorBody) : {};
  } catch {
    return {};
  }
}

function safeMessage(status: number, body: ApiErrorBody): string {
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (status === 401) return 'Please sign in again to view patient data.';
  if (status === 404) return 'Patient data was not found.';
  return 'Patient data could not be loaded.';
}

async function getJson(path: string): Promise<unknown> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const body = await safeErrorBody(res);
    const code = typeof body.error === 'string' ? body.error : undefined;
    throw new PatientFeatureApiError(safeMessage(res.status, body), res.status, code);
  }
  return res.json() as Promise<unknown>;
}

function patientPath(patientId: string, suffix = ''): string {
  return `/api/patients/${encodeURIComponent(patientId)}${suffix}`;
}

export function fetchPatients(): Promise<unknown> {
  return getJson('/api/patients');
}

export function fetchPatient(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId));
}

export function fetchPatientAllergies(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/allergies'));
}

export function fetchPatientProblems(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/problems'));
}

export function fetchPatientMedications(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/medications'));
}

export function fetchPatientPrescriptions(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/prescriptions'));
}

export function fetchPatientCareTeam(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/care-team'));
}

export function fetchPatientEncounters(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/encounters'));
}

export function fetchPatientImmunizations(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/immunizations'));
}

export function fetchPatientVitals(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/vitals'));
}

export function fetchPatientLabs(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/labs'));
}

export function fetchPatientProcedures(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/procedures'));
}

export function fetchPatientDocuments(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/documents'));
}

export function fetchPatientCoverage(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/coverage'));
}

export function fetchPatientDiagnosticReports(patientId: string): Promise<unknown> {
  return getJson(patientPath(patientId, '/diagnostic-reports'));
}

export function fetchPractitioner(practitionerId: string): Promise<unknown> {
  return getJson(`/api/practitioners/${encodeURIComponent(practitionerId)}`);
}
