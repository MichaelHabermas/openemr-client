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
  ClinicalResourceKind,
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

const clinicalLoaders = {
  allergies: fetchPatientAllergies,
  problems: fetchPatientProblems,
  medications: fetchPatientMedications,
  prescriptions: fetchPatientPrescriptions,
  careTeam: fetchPatientCareTeam,
  encounters: fetchPatientEncounters,
} as const;

export function usePatientClinicalResource<TKind extends ClinicalResourceKind>(
  patientId: string,
  kind: TKind,
): LoadState<ClinicalRowsByKind[TKind]> {
  return useAsyncPatientState(
    async () =>
      normalizeClinicalBundle[kind](
        await clinicalLoaders[kind](patientId),
      ) as ClinicalRowsByKind[TKind],
    (rows) => rows.length === 0,
    [patientId, kind],
  );
}

export function usePatientDashboard(patientId: string) {
  return {
    patient: usePatient(patientId),
    allergies: usePatientClinicalResource(patientId, 'allergies'),
    problems: usePatientClinicalResource(patientId, 'problems'),
    medications: usePatientClinicalResource(patientId, 'medications'),
    prescriptions: usePatientClinicalResource(patientId, 'prescriptions'),
    careTeam: usePatientClinicalResource(patientId, 'careTeam'),
    encounters: usePatientClinicalResource(patientId, 'encounters'),
  };
}
