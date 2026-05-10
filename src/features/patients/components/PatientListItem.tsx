import { memo } from 'react';
import { Link } from 'react-router-dom';

import { StatusLabel } from './StatusLabel';
import type { PatientSummary } from '../types';

interface PatientListItemProps {
  patient: PatientSummary;
}

export const PatientListItem = memo(function PatientListItem({ patient }: PatientListItemProps) {
  const statusTone =
    patient.isActive === true ? 'active' : patient.isActive === false ? 'inactive' : 'neutral';

  return (
    <li>
      <Link
        to={`/patients/${encodeURIComponent(patient.id)}`}
        aria-label={`Open dashboard for ${patient.displayName}, DOB ${patient.birthDateLabel}, MRN ${patient.mrnLabel}`}
        className='focus-visible:ring-ring block rounded-md px-4 py-3 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:outline-none'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <span className='font-medium'>{patient.displayName}</span>
          <StatusLabel label={patient.activeStatusLabel} tone={statusTone} />
        </div>
        <dl className='text-muted-foreground mt-3 grid gap-2 text-xs sm:grid-cols-3'>
          <div>
            <dt className='font-medium text-foreground'>DOB</dt>
            <dd>{patient.birthDateLabel}</dd>
          </div>
          <div>
            <dt className='font-medium text-foreground'>Sex</dt>
            <dd>{patient.sexLabel}</dd>
          </div>
          <div>
            <dt className='font-medium text-foreground'>MRN</dt>
            <dd>{patient.mrnLabel}</dd>
          </div>
        </dl>
      </Link>
    </li>
  );
});
