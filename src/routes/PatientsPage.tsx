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
        <div>
          <p className='text-primary text-xs font-semibold tracking-wide uppercase'>
            OpenEMR patient index
          </p>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>Patients</h1>
        </div>
        <Button variant='outline' onClick={() => void handleLogout()}>
          Log out
        </Button>
      </div>

      <Card className='rounded-lg'>
        <CardHeader>
          <CardTitle>Find a patient</CardTitle>
          <CardDescription>
            Search names, identifiers, demographics, and active status from the OpenEMR FHIR{' '}
            <code>Patient</code> endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientPicker state={patientsState} />
        </CardContent>
      </Card>
    </div>
  );
}
