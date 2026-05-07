import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { patientDisplayName } from '@/features/patients/patient-helpers';
import { fetchPatientBundle, logout, PatientsApiError } from '@/lib/api/patients';
import type { FhirPatient } from '@/types/fhir';

function extractPatients(bundle: unknown): FhirPatient[] {
  if (
    !bundle ||
    typeof bundle !== 'object' ||
    (bundle as { resourceType?: string }).resourceType !== 'Bundle'
  ) {
    return [];
  }
  const entries = (bundle as { entry?: unknown[] }).entry;
  if (!Array.isArray(entries)) return [];
  const out: FhirPatient[] = [];
  for (const e of entries) {
    const r =
      e && typeof e === 'object' && 'resource' in e ? (e as { resource: unknown }).resource : null;
    if (r && typeof r === 'object' && (r as FhirPatient).resourceType === 'Patient') {
      out.push(r as FhirPatient);
    }
  }
  return out;
}

export function PatientsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<FhirPatient[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const bundle = await fetchPatientBundle();
        if (cancelled) return;
        setPatients(extractPatients(bundle));
        setError(null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof PatientsApiError && e.status === 401) {
          navigate('/');
          return;
        }
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
          {loading ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : error ? (
            <p className='text-destructive text-sm' role='alert'>
              {error}
            </p>
          ) : patients.length === 0 ? (
            <p className='text-muted-foreground text-sm'>No patients found.</p>
          ) : (
            <ul className='divide-y rounded-lg border'>
              {patients.map((p, i) => (
                <li key={p.id ?? `${patientDisplayName(p)}-${i}`} className='px-4 py-3 text-sm'>
                  <span className='font-medium'>{patientDisplayName(p)}</span>
                  {p.id ? <span className='text-muted-foreground ml-2'>({p.id})</span> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
