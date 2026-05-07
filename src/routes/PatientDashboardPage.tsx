import { useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PatientDashboardShell } from '@/features/patients/components/PatientDashboardShell';
import { usePatientDashboard } from '@/features/patients/hooks';

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const dashboard = usePatientDashboard(patientId ?? '');
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (
      dashboard.patient.status === 'error' &&
      dashboard.patient.error.authRequired &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      navigate('/');
    }
  }, [dashboard.patient, navigate]);

  if (!patientId?.trim()) {
    return <Navigate to='/patients' replace />;
  }

  return <PatientDashboardShell {...dashboard} />;
}
