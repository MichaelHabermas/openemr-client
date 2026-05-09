import { Link } from 'react-router-dom';

import { StatusLabel } from './StatusLabel';
import type { LoadState, PatientHeaderModel } from '../types';

interface PatientHeaderProps {
  state: LoadState<PatientHeaderModel | null>;
}

export function PatientHeader({ state }: PatientHeaderProps) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div
        className='bg-patient-header-bg text-patient-header-fg rounded px-4 py-2'
        aria-busy='true'>
        <p className='text-sm opacity-80' aria-live='polite'>
          Loading patient identity...
        </p>
      </div>
    );
  }

  if (state.status === 'error') {
    const notFound = state.error.status === 404;
    return (
      <div className='bg-patient-header-bg text-patient-header-fg rounded px-4 py-2'>
        <p className='text-sm text-red-300' role='alert'>
          {notFound
            ? 'Patient was not found.'
            : `Patient header could not be loaded. ${state.error.message}`}
        </p>
        <Link className='text-sm text-blue-300 underline' to='/patients'>
          Back to patients
        </Link>
      </div>
    );
  }

  if (state.isEmpty || !state.data) {
    return (
      <div className='bg-patient-header-bg text-patient-header-fg rounded px-4 py-2'>
        <p className='text-sm opacity-80'>Patient record could not be displayed.</p>
        <Link className='text-sm text-blue-300 underline' to='/patients'>
          Back to patients
        </Link>
      </div>
    );
  }

  const patient = state.data;
  const statusTone =
    patient.isActive === true ? 'active' : patient.isActive === false ? 'inactive' : 'neutral';

  return (
    <section
      aria-labelledby='patient-header-title'
      className='bg-patient-header-bg text-patient-header-fg rounded px-4 py-2'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 id='patient-header-title' className='text-lg font-bold text-blue-300'>
            {patient.displayName} ({patient.mrnLabel})
          </h1>
          <p className='text-xs opacity-80'>
            DOB: {patient.birthDateLabel} | {patient.sexLabel}
          </p>
        </div>
        <div className='text-right'>
          <StatusLabel
            label={patient.activeStatusLabel}
            tone={statusTone}
            description={patient.activeStatusDescription}
          />
          <p className='mt-1 text-xs opacity-70'>Open Encounter: None</p>
        </div>
      </div>
    </section>
  );
}
