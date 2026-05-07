import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';

import {
  fetchPatient,
  fetchPatientAllergies,
  fetchPatientCareTeam,
  fetchPatientEncounters,
  fetchPatientMedications,
  fetchPatientPrescriptions,
  fetchPatientProblems,
  fetchPatients,
  PatientFeatureApiError,
} from './api';
import {
  normalizeClinicalBundle,
  normalizePatientHeader,
  normalizePatientSummaries,
} from './normalizers';
import type {
  AllergyRow,
  CareTeamRow,
  EncounterRow,
  LoadState,
  MedicationRow,
  PatientFeatureError,
  PatientHeaderModel,
  PatientSummary,
  PrescriptionRow,
  ProblemRow,
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
): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
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
  return useAsyncPatientState(
    async () => normalizePatientHeader(await fetchPatient(patientId)),
    (patient) => patient === null,
    [patientId],
  );
}

type ClinicalRowsByKind = {
  allergies: AllergyRow[];
  problems: ProblemRow[];
  medications: MedicationRow[];
  prescriptions: PrescriptionRow[];
  careTeam: CareTeamRow[];
  encounters: EncounterRow[];
};

function usePatientAllergies(patientId: string): LoadState<ClinicalRowsByKind['allergies']> {
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.allergies(await fetchPatientAllergies(patientId)),
    (rows) => rows.length === 0,
    [patientId],
  );
}

function usePatientProblems(patientId: string): LoadState<ClinicalRowsByKind['problems']> {
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.problems(await fetchPatientProblems(patientId)),
    (rows) => rows.length === 0,
    [patientId],
  );
}

function usePatientMedications(patientId: string): LoadState<ClinicalRowsByKind['medications']> {
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.medications(await fetchPatientMedications(patientId)),
    (rows) => rows.length === 0,
    [patientId],
  );
}

function usePatientPrescriptions(
  patientId: string,
): LoadState<ClinicalRowsByKind['prescriptions']> {
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.prescriptions(await fetchPatientPrescriptions(patientId)),
    (rows) => rows.length === 0,
    [patientId],
  );
}

function usePatientCareTeam(patientId: string): LoadState<ClinicalRowsByKind['careTeam']> {
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.careTeam(await fetchPatientCareTeam(patientId)),
    (rows) => rows.length === 0,
    [patientId],
  );
}

function usePatientEncounters(patientId: string): LoadState<ClinicalRowsByKind['encounters']> {
  return useAsyncPatientState(
    async () => normalizeClinicalBundle.encounters(await fetchPatientEncounters(patientId)),
    (rows) => rows.length === 0,
    [patientId],
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
  };
}
