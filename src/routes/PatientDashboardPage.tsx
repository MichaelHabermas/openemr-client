import { useEffect, useMemo, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PatientDashboardShell } from '@/features/patients/components/PatientDashboardShell';
import { usePatientDashboard, usePractitionerResolver } from '@/features/patients/hooks';
import type { CareTeamRow, EncounterRow, QueryResult } from '@/features/patients/types';

function useResolvedCareTeam(
  query: QueryResult<CareTeamRow[]>,
  getName: (ref: string) => string | undefined,
  getSpecialty: (ref: string) => string | undefined,
  resolve: (refs: string[]) => void,
): QueryResult<CareTeamRow[]> {
  useEffect(() => {
    if (query.status !== 'success' || !query.data) return;
    const refs = query.data.map((row) => row.practitionerRef).filter((ref): ref is string => !!ref);
    if (refs.length > 0) resolve(refs);
  }, [query, resolve]);

  const data = useMemo(() => {
    if (query.status !== 'success' || !query.data) return query.data;
    return query.data.map((row) => {
      if (!row.practitionerRef) return row;
      const resolved = getName(row.practitionerRef);
      const specialty = getSpecialty(row.practitionerRef);
      return {
        ...row,
        ...(resolved ? { name: resolved, hasPartialData: false } : {}),
        ...(specialty ? { specialty } : {}),
      };
    });
  }, [query, getName, getSpecialty]);

  return { ...query, data };
}

function useResolvedEncounters(
  query: QueryResult<EncounterRow[]>,
  getName: (ref: string) => string | undefined,
  resolve: (refs: string[]) => void,
): QueryResult<EncounterRow[]> {
  useEffect(() => {
    if (query.status !== 'success' || !query.data) return;
    const refs = query.data.flatMap((row) => row.participantRefs ?? []);
    if (refs.length > 0) resolve(refs);
  }, [query, resolve]);

  const data = useMemo(() => {
    if (query.status !== 'success' || !query.data) return query.data;
    return query.data.map((row) => {
      if (!row.participantRefs?.length) return row;
      const resolved = row.participantRefs
        .map((ref) => getName(ref))
        .filter((name): name is string => !!name);
      if (resolved.length === 0) return row;
      return { ...row, participant: resolved.join(', ') };
    });
  }, [query, getName]);

  return { ...query, data };
}

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const dashboard = usePatientDashboard(patientId ?? '');
  const hasRedirected = useRef(false);
  const { resolve, getName, getSpecialty } = usePractitionerResolver();

  const careTeam = useResolvedCareTeam(dashboard.careTeam, getName, getSpecialty, resolve);
  const encounters = useResolvedEncounters(dashboard.encounters, getName, resolve);

  useEffect(() => {
    if (
      dashboard.patient.status === 'error' &&
      dashboard.patient.error?.authRequired &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      navigate('/');
    }
  }, [dashboard.patient, navigate]);

  if (!patientId?.trim()) {
    return <Navigate to='/patients' replace />;
  }

  return (
    <PatientDashboardShell
      {...dashboard}
      careTeam={careTeam}
      encounters={encounters}
      patientId={patientId}
    />
  );
}
