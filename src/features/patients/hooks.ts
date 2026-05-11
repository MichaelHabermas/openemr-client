import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';

import {
  createAllergy,
  createAppointment,
  createProblem,
  fetchEncounterDetail,
  fetchEncounterObservations,
  fetchPatient,
  fetchPatientAllergies,
  fetchPatientAppointments,
  fetchPatientCarePlans,
  fetchPatientCareTeam,
  fetchPatientCoverage,
  fetchPatientDevices,
  fetchPatientDiagnosticReports,
  fetchPatientDocuments,
  fetchPatientEncounters,
  fetchPatientFamilyHistory,
  fetchPatientGoals,
  fetchPatientImmunizations,
  fetchPatientLabs,
  fetchPatientMedications,
  fetchPatientPrescriptions,
  fetchPatientProblems,
  fetchPatientProcedures,
  fetchPatientRelatedPersons,
  fetchPatientServiceRequests,
  fetchPatientSocialHistory,
  fetchPatientVitals,
  fetchPatients,
  fetchPractitioner,
  fetchPatientProvenance,
  fetchPractitionerRoles,
  PatientFeatureApiError,
} from './api';
import {
  normalizeClinicalBundle,
  normalizePatientHeader,
  normalizePatientSummaries,
  normalizePractitionerName,
  normalizePractitionerSpecialty,
  normalizeProvenanceBundle,
} from './normalizers';
import type {
  AllergyRow,
  AppointmentRow,
  CarePlanRow,
  CareTeamRow,
  CoverageRow,
  DeviceRow,
  DiagnosticReportRow,
  DocumentRow,
  EncounterRow,
  FamilyHistoryRow,
  GoalRow,
  ImmunizationRow,
  LabRow,
  LoadState,
  MedicationRow,
  PatientFeatureError,
  PatientHeaderModel,
  PatientSummary,
  PrescriptionRow,
  ProblemRow,
  ProcedureRow,
  ProvenanceRecord,
  RelatedPersonRow,
  ServiceRequestRow,
  SocialHistoryRow,
  VitalRow,
} from './types';

function toFeatureError(error: unknown): PatientFeatureError {
  if (error instanceof PatientFeatureApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      authRequired: error.authRequired,
    };
  }
  return {
    status: 0,
    message: 'Patient data could not be loaded.',
    authRequired: false,
  };
}

function useAsyncPatientState<T>(
  load: () => Promise<T>,
  isEmpty: (data: T) => boolean,
  deps: DependencyList,
  enabled = true,
): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({
    status: enabled ? 'loading' : 'idle',
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setState({ status: 'loading' });
    });

    void load()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data, isEmpty: isEmpty(data) });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: toFeatureError(error) });
      });

    return () => {
      cancelled = true;
    };
    // The caller owns stable dependencies for the load closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function usePatients(): LoadState<PatientSummary[]> {
  return useAsyncPatientState(
    async () => normalizePatientSummaries(await fetchPatients()),
    (patients) => patients.length === 0,
    [],
  );
}

export function usePatient(patientId: string): LoadState<PatientHeaderModel | null> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizePatientHeader(await fetchPatient(patientId)),
    (patient) => patient === null,
    [patientId],
    enabled,
  );
}

type ClinicalRowsByKind = {
  allergies: AllergyRow[];
  problems: ProblemRow[];
  medications: MedicationRow[];
  prescriptions: PrescriptionRow[];
  careTeam: CareTeamRow[];
  encounters: EncounterRow[];
  immunizations: ImmunizationRow[];
  vitals: VitalRow[];
  labs: LabRow[];
  procedures: ProcedureRow[];
  documents: DocumentRow[];
  coverage: CoverageRow[];
  diagnosticReports: DiagnosticReportRow[];
  goals: GoalRow[];
  carePlans: CarePlanRow[];
  socialHistory: SocialHistoryRow[];
  familyHistory: FamilyHistoryRow[];
  appointments: AppointmentRow[];
  devices: DeviceRow[];
  serviceRequests: ServiceRequestRow[];
  relatedPersons: RelatedPersonRow[];
};

function usePatientAllergies(patientId: string): LoadState<ClinicalRowsByKind['allergies']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.allergies(await fetchPatientAllergies(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientProblems(patientId: string): LoadState<ClinicalRowsByKind['problems']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.problems(await fetchPatientProblems(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientMedications(patientId: string): LoadState<ClinicalRowsByKind['medications']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.medications(await fetchPatientMedications(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientPrescriptions(
  patientId: string,
): LoadState<ClinicalRowsByKind['prescriptions']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.prescriptions(await fetchPatientPrescriptions(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientCareTeam(patientId: string): LoadState<ClinicalRowsByKind['careTeam']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.careTeam(await fetchPatientCareTeam(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientEncounters(patientId: string): LoadState<ClinicalRowsByKind['encounters']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.encounters(await fetchPatientEncounters(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientImmunizations(
  patientId: string,
): LoadState<ClinicalRowsByKind['immunizations']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.immunizations(await fetchPatientImmunizations(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientVitals(patientId: string): LoadState<ClinicalRowsByKind['vitals']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.vitals(await fetchPatientVitals(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientLabs(patientId: string): LoadState<ClinicalRowsByKind['labs']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.labs(await fetchPatientLabs(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientProcedures(patientId: string): LoadState<ClinicalRowsByKind['procedures']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.procedures(await fetchPatientProcedures(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientDocuments(patientId: string): LoadState<ClinicalRowsByKind['documents']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.documents(await fetchPatientDocuments(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientCoverage(patientId: string): LoadState<ClinicalRowsByKind['coverage']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.coverage(await fetchPatientCoverage(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientDiagnosticReports(
  patientId: string,
): LoadState<ClinicalRowsByKind['diagnosticReports']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () =>
      normalizeClinicalBundle.diagnosticReports(await fetchPatientDiagnosticReports(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientGoals(patientId: string): LoadState<ClinicalRowsByKind['goals']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.goals(await fetchPatientGoals(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientCarePlans(patientId: string): LoadState<ClinicalRowsByKind['carePlans']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.carePlans(await fetchPatientCarePlans(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientSocialHistory(
  patientId: string,
): LoadState<ClinicalRowsByKind['socialHistory']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.socialHistory(await fetchPatientSocialHistory(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientFamilyHistory(
  patientId: string,
): LoadState<ClinicalRowsByKind['familyHistory']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.familyHistory(await fetchPatientFamilyHistory(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientAppointments(patientId: string): LoadState<ClinicalRowsByKind['appointments']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.appointments(await fetchPatientAppointments(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientDevices(patientId: string): LoadState<ClinicalRowsByKind['devices']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.devices(await fetchPatientDevices(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientServiceRequests(
  patientId: string,
): LoadState<ClinicalRowsByKind['serviceRequests']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () =>
      normalizeClinicalBundle.serviceRequests(await fetchPatientServiceRequests(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

function usePatientRelatedPersons(
  patientId: string,
): LoadState<ClinicalRowsByKind['relatedPersons']> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.relatedPersons(await fetchPatientRelatedPersons(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

export function useEncounterDetail(
  patientId: string,
  encounterId: string,
): LoadState<EncounterRow | null> {
  const enabled = Boolean(patientId.trim()) && Boolean(encounterId.trim());
  return useAsyncPatientState(
    async () => {
      const { normalizeEncounter } = await import('./normalizers');
      const data = await fetchEncounterDetail(patientId, encounterId);
      return normalizeEncounter(data);
    },
    (encounter) => encounter === null,
    [patientId, encounterId],
    enabled,
  );
}

export function useEncounterObservations(
  patientId: string,
  encounterId: string,
): LoadState<VitalRow[]> {
  const enabled = Boolean(patientId.trim()) && Boolean(encounterId.trim());
  return useAsyncPatientState(
    async () =>
      normalizeClinicalBundle.encounterObservations(
        await fetchEncounterObservations(patientId, encounterId),
      ),
    (rows) => rows.length === 0,
    [patientId, encounterId],
    enabled,
  );
}

export function usePractitionerResolver() {
  const cache = useRef<Map<string, string>>(new Map());
  const specialtyCache = useRef<Map<string, string>>(new Map());
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [specialties, setSpecialties] = useState<Map<string, string>>(new Map());

  const resolve = useCallback((references: string[]) => {
    const idsToFetch = references
      .map((ref) => ref.replace(/^Practitioner\//, ''))
      .filter((id) => !cache.current.has(id));

    if (idsToFetch.length === 0) return;

    for (const id of idsToFetch) {
      cache.current.set(id, '');
      specialtyCache.current.set(id, '');

      void fetchPractitioner(id)
        .then((data) => {
          const name = normalizePractitionerName(data);
          if (name) {
            cache.current.set(id, name);
            setNames(new Map(cache.current));
          }
        })
        .catch(() => {});

      void fetchPractitionerRoles(id)
        .then((data) => {
          const specialty = normalizePractitionerSpecialty(data);
          if (specialty) {
            specialtyCache.current.set(id, specialty);
            setSpecialties(new Map(specialtyCache.current));
          }
        })
        .catch(() => {});
    }
  }, []);

  const getName = useCallback(
    (reference: string): string | undefined => {
      const id = reference.replace(/^Practitioner\//, '');
      return names.get(id) || undefined;
    },
    [names],
  );

  const getSpecialty = useCallback(
    (reference: string): string | undefined => {
      const id = reference.replace(/^Practitioner\//, '');
      return specialties.get(id) || undefined;
    },
    [specialties],
  );

  return { resolve, getName, getSpecialty };
}

export type MutationState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; error: PatientFeatureError };

function useMutation<TArgs extends unknown[]>(
  mutateFn: (...args: TArgs) => Promise<unknown>,
): { mutate: (...args: TArgs) => void; state: MutationState; reset: () => void } {
  const [state, setState] = useState<MutationState>({ status: 'idle' });

  const mutate = useCallback(
    (...args: TArgs) => {
      setState({ status: 'submitting' });
      void mutateFn(...args)
        .then(() => setState({ status: 'success' }))
        .catch((error: unknown) => setState({ status: 'error', error: toFeatureError(error) }));
    },
    [mutateFn],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { mutate, state, reset };
}

export function useCreateAllergy(patientId: string) {
  const mutateFn = useCallback((body: unknown) => createAllergy(patientId, body), [patientId]);
  return useMutation(mutateFn);
}

export function useCreateProblem(patientId: string) {
  const mutateFn = useCallback((body: unknown) => createProblem(patientId, body), [patientId]);
  return useMutation(mutateFn);
}

export function useCreateAppointment(patientId: string) {
  const mutateFn = useCallback((body: unknown) => createAppointment(patientId, body), [patientId]);
  return useMutation(mutateFn);
}

export function usePatientProvenance(patientId: string): LoadState<ProvenanceRecord[]> {
  const enabled = Boolean(patientId.trim());
  return useAsyncPatientState(
    async () => normalizeProvenanceBundle(await fetchPatientProvenance(patientId)),
    (rows) => rows.length === 0,
    [patientId],
    enabled,
  );
}

export function usePatientDashboard(patientId: string) {
  return {
    patient: usePatient(patientId),
    allergies: usePatientAllergies(patientId),
    problems: usePatientProblems(patientId),
    medications: usePatientMedications(patientId),
    prescriptions: usePatientPrescriptions(patientId),
    careTeam: usePatientCareTeam(patientId),
    encounters: usePatientEncounters(patientId),
    immunizations: usePatientImmunizations(patientId),
    vitals: usePatientVitals(patientId),
    labs: usePatientLabs(patientId),
    procedures: usePatientProcedures(patientId),
    documents: usePatientDocuments(patientId),
    coverage: usePatientCoverage(patientId),
    diagnosticReports: usePatientDiagnosticReports(patientId),
    goals: usePatientGoals(patientId),
    carePlans: usePatientCarePlans(patientId),
    socialHistory: usePatientSocialHistory(patientId),
    familyHistory: usePatientFamilyHistory(patientId),
    appointments: usePatientAppointments(patientId),
    devices: usePatientDevices(patientId),
    serviceRequests: usePatientServiceRequests(patientId),
    relatedPersons: usePatientRelatedPersons(patientId),
    provenance: usePatientProvenance(patientId),
  };
}
