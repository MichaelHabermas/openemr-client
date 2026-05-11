import { useCallback } from 'react';
import {
  useQuery,
  useQueryClient,
  useMutation as useTanstackMutation,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  createAllergy,
  createAppointment,
  createProblem,
  fetchEncounterDetail,
  fetchEncounterObservations,
  fetchPatient,
  fetchPatientClinicalSummary,
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
  ClinicalSummary,
  EncounterRow,
  PatientHeaderModel,
  PatientSummary,
  ProvenanceRecord,
  QueryResult,
  VitalRow,
} from './types';

export type { UseQueryResult };
export type PatientQuery<T> = UseQueryResult<T, PatientFeatureApiError>;

// ── Query key factory ──────────────────────────────────────────────

export const patientKeys = {
  all: ['patients'] as const,
  list: () => [...patientKeys.all, 'list'] as const,
  detail: (id: string) => [...patientKeys.all, id] as const,
  clinical: (id: string, resource: string) => [...patientKeys.detail(id), resource] as const,
  encounter: (patientId: string, encounterId: string) =>
    [...patientKeys.detail(patientId), 'encounters', encounterId] as const,
  encounterObservations: (patientId: string, encounterId: string) =>
    [...patientKeys.encounter(patientId, encounterId), 'observations'] as const,
  clinicalSummary: (id: string) => [...patientKeys.detail(id), 'clinical-summary'] as const,
  provenance: (id: string) => [...patientKeys.detail(id), 'provenance'] as const,
  practitioner: (id: string) => ['practitioners', id] as const,
  practitionerRoles: (id: string) => ['practitioners', id, 'roles'] as const,
};

// ── Patient list & header ──────────────────────────────────────────

export function usePatients(): PatientQuery<PatientSummary[]> {
  return useQuery({
    queryKey: patientKeys.list(),
    queryFn: async () => normalizePatientSummaries(await fetchPatients()),
  });
}

export function usePatient(patientId: string): PatientQuery<PatientHeaderModel | null> {
  const enabled = Boolean(patientId.trim());
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: async () => normalizePatientHeader(await fetchPatient(patientId)),
    enabled,
  });
}

// ── Clinical summary (single batch fetch) ─────────────────────────

function normalizeClinicalSummary(raw: unknown): ClinicalSummary {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    allergies: normalizeClinicalBundle.allergies(data.allergies),
    problems: normalizeClinicalBundle.problems(data.problems),
    medications: normalizeClinicalBundle.medications(data.medications),
    prescriptions: normalizeClinicalBundle.prescriptions(data.prescriptions),
    careTeam: normalizeClinicalBundle.careTeam(data.careTeam),
    encounters: normalizeClinicalBundle.encounters(data.encounters),
    immunizations: normalizeClinicalBundle.immunizations(data.immunizations),
    vitals: normalizeClinicalBundle.vitals(data.vitals),
    labs: normalizeClinicalBundle.labs(data.labs),
    procedures: normalizeClinicalBundle.procedures(data.procedures),
    documents: normalizeClinicalBundle.documents(data.documents),
    coverage: normalizeClinicalBundle.coverage(data.coverage),
    diagnosticReports: normalizeClinicalBundle.diagnosticReports(data.diagnosticReports),
    goals: normalizeClinicalBundle.goals(data.goals),
    carePlans: normalizeClinicalBundle.carePlans(data.carePlans),
    socialHistory: normalizeClinicalBundle.socialHistory(data.socialHistory),
    familyHistory: normalizeClinicalBundle.familyHistory(data.familyHistory),
    appointments: normalizeClinicalBundle.appointments(data.appointments),
    devices: normalizeClinicalBundle.devices(data.devices),
    serviceRequests: normalizeClinicalBundle.serviceRequests(data.serviceRequests),
    relatedPersons: normalizeClinicalBundle.relatedPersons(data.relatedPersons),
    medicationDispenses: normalizeClinicalBundle.medicationDispenses(data.medicationDispenses),
    questionnaireResponses: normalizeClinicalBundle.questionnaireResponses(
      data.questionnaireResponses,
    ),
  };
}

function usePatientClinicalSummary(patientId: string): PatientQuery<ClinicalSummary> {
  return useQuery({
    queryKey: patientKeys.clinicalSummary(patientId),
    queryFn: async () => normalizeClinicalSummary(await fetchPatientClinicalSummary(patientId)),
    enabled: Boolean(patientId.trim()),
  });
}

function projectSummary<T>(
  summary: PatientQuery<ClinicalSummary>,
  select: (s: ClinicalSummary) => T,
): QueryResult<T> {
  return {
    status: summary.status,
    data: summary.data ? select(summary.data) : undefined,
    error: summary.error,
  };
}

// ── Encounter detail ───────────────────────────────────────────────

export function useEncounterDetail(
  patientId: string,
  encounterId: string,
): PatientQuery<EncounterRow | null> {
  return useQuery({
    queryKey: patientKeys.encounter(patientId, encounterId),
    queryFn: async () => {
      const { normalizeEncounter } = await import('./normalizers');
      return normalizeEncounter(await fetchEncounterDetail(patientId, encounterId));
    },
    enabled: Boolean(patientId.trim()) && Boolean(encounterId.trim()),
  });
}

export function useEncounterObservations(
  patientId: string,
  encounterId: string,
): PatientQuery<VitalRow[]> {
  return useQuery({
    queryKey: patientKeys.encounterObservations(patientId, encounterId),
    queryFn: async () =>
      normalizeClinicalBundle.encounterObservations(
        await fetchEncounterObservations(patientId, encounterId),
      ),
    enabled: Boolean(patientId.trim()) && Boolean(encounterId.trim()),
  });
}

// ── Practitioner resolver ──────────────────────────────────────────

export function usePractitionerResolver() {
  const queryClient = useQueryClient();

  const resolve = useCallback(
    (references: string[]) => {
      for (const ref of references) {
        const id = ref.replace(/^Practitioner\//, '');
        if (!id) continue;
        void queryClient.prefetchQuery({
          queryKey: patientKeys.practitioner(id),
          queryFn: () => fetchPractitioner(id).then(normalizePractitionerName),
          staleTime: Infinity,
        });
        void queryClient.prefetchQuery({
          queryKey: patientKeys.practitionerRoles(id),
          queryFn: () => fetchPractitionerRoles(id).then(normalizePractitionerSpecialty),
          staleTime: Infinity,
        });
      }
    },
    [queryClient],
  );

  const getName = useCallback(
    (reference: string): string | undefined => {
      const id = reference.replace(/^Practitioner\//, '');
      return queryClient.getQueryData<string | null>(patientKeys.practitioner(id)) ?? undefined;
    },
    [queryClient],
  );

  const getSpecialty = useCallback(
    (reference: string): string | undefined => {
      const id = reference.replace(/^Practitioner\//, '');
      return (
        queryClient.getQueryData<string | null>(patientKeys.practitionerRoles(id)) ?? undefined
      );
    },
    [queryClient],
  );

  return { resolve, getName, getSpecialty };
}

// ── Mutations ──────────────────────────────────────────────────────

export type MutationState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; error: PatientFeatureApiError };

export function useCreateAllergy(patientId: string) {
  const queryClient = useQueryClient();
  const mutation = useTanstackMutation({
    mutationFn: (body: unknown) => createAllergy(patientId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: patientKeys.clinicalSummary(patientId),
      });
    },
  });

  const state: MutationState = mutation.isIdle
    ? { status: 'idle' }
    : mutation.isPending
      ? { status: 'submitting' }
      : mutation.isSuccess
        ? { status: 'success' }
        : { status: 'error', error: mutation.error as PatientFeatureApiError };

  return {
    mutate: mutation.mutate,
    state,
    reset: mutation.reset,
  };
}

export function useCreateProblem(patientId: string) {
  const queryClient = useQueryClient();
  const mutation = useTanstackMutation({
    mutationFn: (body: unknown) => createProblem(patientId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: patientKeys.clinicalSummary(patientId),
      });
    },
  });

  const state: MutationState = mutation.isIdle
    ? { status: 'idle' }
    : mutation.isPending
      ? { status: 'submitting' }
      : mutation.isSuccess
        ? { status: 'success' }
        : { status: 'error', error: mutation.error as PatientFeatureApiError };

  return {
    mutate: mutation.mutate,
    state,
    reset: mutation.reset,
  };
}

export function useCreateAppointment(patientId: string) {
  const queryClient = useQueryClient();
  const mutation = useTanstackMutation({
    mutationFn: (body: unknown) => createAppointment(patientId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: patientKeys.clinicalSummary(patientId),
      });
    },
  });

  const state: MutationState = mutation.isIdle
    ? { status: 'idle' }
    : mutation.isPending
      ? { status: 'submitting' }
      : mutation.isSuccess
        ? { status: 'success' }
        : { status: 'error', error: mutation.error as PatientFeatureApiError };

  return {
    mutate: mutation.mutate,
    state,
    reset: mutation.reset,
  };
}

// ── Provenance ─────────────────────────────────────────────────────

export function usePatientProvenance(patientId: string): PatientQuery<ProvenanceRecord[]> {
  return useQuery({
    queryKey: patientKeys.provenance(patientId),
    queryFn: async () => normalizeProvenanceBundle(await fetchPatientProvenance(patientId)),
    enabled: Boolean(patientId.trim()),
  });
}

// ── Dashboard aggregate ────────────────────────────────────────────

export function usePatientDashboard(patientId: string) {
  const summary = usePatientClinicalSummary(patientId);
  return {
    patient: usePatient(patientId),
    allergies: projectSummary(summary, (s) => s.allergies),
    problems: projectSummary(summary, (s) => s.problems),
    medications: projectSummary(summary, (s) => s.medications),
    prescriptions: projectSummary(summary, (s) => s.prescriptions),
    careTeam: projectSummary(summary, (s) => s.careTeam),
    encounters: projectSummary(summary, (s) => s.encounters),
    immunizations: projectSummary(summary, (s) => s.immunizations),
    vitals: projectSummary(summary, (s) => s.vitals),
    labs: projectSummary(summary, (s) => s.labs),
    procedures: projectSummary(summary, (s) => s.procedures),
    documents: projectSummary(summary, (s) => s.documents),
    coverage: projectSummary(summary, (s) => s.coverage),
    diagnosticReports: projectSummary(summary, (s) => s.diagnosticReports),
    goals: projectSummary(summary, (s) => s.goals),
    carePlans: projectSummary(summary, (s) => s.carePlans),
    socialHistory: projectSummary(summary, (s) => s.socialHistory),
    familyHistory: projectSummary(summary, (s) => s.familyHistory),
    appointments: projectSummary(summary, (s) => s.appointments),
    devices: projectSummary(summary, (s) => s.devices),
    serviceRequests: projectSummary(summary, (s) => s.serviceRequests),
    relatedPersons: projectSummary(summary, (s) => s.relatedPersons),
    medicationDispenses: projectSummary(summary, (s) => s.medicationDispenses),
    questionnaireResponses: projectSummary(summary, (s) => s.questionnaireResponses),
    provenance: usePatientProvenance(patientId),
  };
}
