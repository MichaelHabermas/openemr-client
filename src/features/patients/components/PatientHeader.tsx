import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import { StatusLabel } from './StatusLabel';
import type { LoadState, PatientHeaderModel } from '../types';

interface PatientHeaderProps {
  state: LoadState<PatientHeaderModel | null>;
}

export function PatientHeader({ state }: PatientHeaderProps) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <Card className='rounded-lg' aria-busy='true'>
        <CardContent>
          <p className='text-muted-foreground text-sm' aria-live='polite'>
            Loading patient identity...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state.status === 'error') {
    const notFound = state.error.status === 404;
    return (
      <Card className='rounded-lg'>
        <CardContent className='space-y-3'>
          <p className='text-destructive text-sm' role='alert'>
            {notFound
              ? 'Patient was not found.'
              : `Patient header could not be loaded. ${state.error.message}`}
          </p>
          <Link className='text-sm font-medium underline underline-offset-4' to='/patients'>
            Back to patients
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state.isEmpty || !state.data) {
    return (
      <Card className='rounded-lg'>
        <CardContent className='space-y-3'>
          <p className='text-muted-foreground text-sm'>Patient record could not be displayed.</p>
          <Link className='text-sm font-medium underline underline-offset-4' to='/patients'>
            Back to patients
          </Link>
        </CardContent>
      </Card>
    );
  }

  const patient = state.data;
  const statusTone =
    patient.isActive === true ? 'active' : patient.isActive === false ? 'inactive' : 'neutral';

  return (
    <section aria-labelledby='patient-header-title'>
      <Card className='rounded-lg border-primary/20 shadow-sm'>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <p className='text-primary text-xs font-semibold tracking-wide uppercase'>
                Patient dashboard
              </p>
              <h1 id='patient-header-title' className='mt-1 text-2xl font-semibold tracking-tight'>
                {patient.displayName}
              </h1>
            </div>
            <StatusLabel
              label={patient.activeStatusLabel}
              tone={statusTone}
              description={patient.activeStatusDescription}
            />
          </div>
          <dl className='grid gap-3 sm:grid-cols-3'>
            <PatientFact label='Date of birth' value={patient.birthDateLabel} />
            <PatientFact label='Sex' value={patient.sexLabel} />
            <PatientFact label='MRN' value={patient.mrnLabel} />
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}

function PatientFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='text-muted-foreground text-xs font-medium'>{label}</dt>
      <dd className='mt-1 text-sm font-medium'>{value}</dd>
    </div>
  );
}
