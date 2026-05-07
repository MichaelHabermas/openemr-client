import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientPicker } from '@/features/patients/components/PatientPicker';
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
        <CardContent>
          <PatientPicker state={patientsState} />
        </CardContent>
      </Card>
    </div>
  );
}
