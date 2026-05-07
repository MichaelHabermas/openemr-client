import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePatients } from '@/features/patients/hooks';
import { logout } from '@/lib/api/patients';

export function PatientsPage() {
  const navigate = useNavigate();
  const patientsState = usePatients();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (
      patientsState.status === 'error' &&
      patientsState.error.authRequired &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      navigate('/');
    }
  }, [navigate, patientsState]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function renderPatientList() {
    if (patientsState.status === 'loading' || patientsState.status === 'idle') {
      return <p className='text-muted-foreground text-sm'>Loading…</p>;
    }

    if (patientsState.status === 'error') {
      return (
        <p className='text-destructive text-sm' role='alert'>
          {patientsState.error.message}
        </p>
      );
    }

    if (patientsState.isEmpty) {
      return <p className='text-muted-foreground text-sm'>No patients found.</p>;
    }

    return (
      <ul className='divide-y rounded-lg border'>
        {patientsState.data.map((patient) => (
          <li key={patient.id} className='px-4 py-3 text-sm'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <span className='font-medium'>{patient.displayName}</span>
              <span className='text-muted-foreground text-xs'>{patient.activeStatusLabel}</span>
            </div>
            <dl className='text-muted-foreground mt-2 grid gap-2 text-xs sm:grid-cols-3'>
              <div>
                <dt className='sr-only'>Date of birth</dt>
                <dd>DOB: {patient.birthDateLabel}</dd>
              </div>
              <div>
                <dt className='sr-only'>Sex</dt>
                <dd>Sex: {patient.sexLabel}</dd>
              </div>
              <div>
                <dt className='sr-only'>MRN</dt>
                <dd>MRN: {patient.mrnLabel}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight'>Patients</h1>
        <Button variant='outline' onClick={() => void handleLogout()}>
          Log out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FHIR Patient search</CardTitle>
          <CardDescription>
            Results from your OpenEMR FHIR <code>Patient</code> endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderPatientList()}</CardContent>
      </Card>
    </div>
  );
}
