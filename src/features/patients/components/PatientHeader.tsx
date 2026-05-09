import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

import type { LoadState, PatientHeaderModel } from '../types';

interface PatientHeaderProps {
  state: LoadState<PatientHeaderModel | null>;
  encounterCount?: number | null;
}

export function PatientHeader({ state, encounterCount }: PatientHeaderProps) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div
        className='bg-patient-header-bg text-patient-header-fg rounded border px-4 py-2'
        aria-busy='true'>
        <p className='text-muted-foreground text-sm' aria-live='polite'>
          Loading patient identity...
        </p>
      </div>
    );
  }

  if (state.status === 'error') {
    const notFound = state.error.status === 404;
    return (
      <div className='bg-patient-header-bg text-patient-header-fg rounded border px-4 py-2'>
        <p className='text-destructive text-sm' role='alert'>
          {notFound
            ? 'Patient was not found.'
            : `Patient header could not be loaded. ${state.error.message}`}
        </p>
        <Link className='text-primary text-sm underline' to='/patients'>
          Back to patients
        </Link>
      </div>
    );
  }

  if (state.isEmpty || !state.data) {
    return (
      <div className='bg-patient-header-bg text-patient-header-fg rounded border px-4 py-2'>
        <p className='text-muted-foreground text-sm'>Patient record could not be displayed.</p>
        <Link className='text-primary text-sm underline' to='/patients'>
          Back to patients
        </Link>
      </div>
    );
  }

  const patient = state.data;
  const dobParts = [`DOB: ${patient.birthDateLabel}`];
  if (patient.ageLabel) dobParts.push(`Age: ${patient.ageLabel}`);
  dobParts.push(patient.sexLabel);

  return (
    <section
      aria-labelledby='patient-header-title'
      className='bg-patient-header-bg text-patient-header-fg rounded border px-4 py-2'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
            <User className='text-muted-foreground h-5 w-5' />
          </div>
          <div>
            <h1 id='patient-header-title' className='text-primary text-lg font-bold'>
              {patient.displayName}{' '}
              <span className='text-muted-foreground font-normal'>({patient.mrnLabel})</span>{' '}
              <Link
                to='/patients'
                aria-label='Close patient dashboard'
                className='text-muted-foreground hover:text-foreground text-base font-normal'>
                ×
              </Link>
            </h1>
            <p className='text-muted-foreground text-xs'>{dobParts.join(' | ')}</p>
          </div>
        </div>
        <div className='text-right'>
          {encounterCount != null && (
            <span className='border-border text-muted-foreground mr-1 inline-block rounded border px-2 py-0.5 text-xs'>
              Select Encounter ({encounterCount})
            </span>
          )}
          <span className='text-muted-foreground text-xs'>{patient.activeStatusLabel}</span>
          <p className='text-muted-foreground mt-1 text-xs'>
            Open Encounter: {encounterCount == null ? '—' : 'None'}
          </p>
        </div>
      </div>
    </section>
  );
}
