import { Link, Navigate, useParams } from 'react-router-dom';

import { ClinicalTable, type ColumnDef } from '@/features/patients/components/ClinicalTable';
import { renderLoadState } from '@/features/patients/components/renderLoadState';
import { useEncounterDetail, useEncounterObservations } from '@/features/patients/hooks';
import type { EncounterRow, VitalRow } from '@/features/patients/types';

const observationColumns: ColumnDef<VitalRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Value', accessor: (r) => r.value },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
];

function EncounterHeader({ encounter }: { encounter: EncounterRow }) {
  return (
    <div className='border-border rounded border p-4'>
      <h2 className='text-foreground mb-2 text-base font-semibold'>{encounter.type}</h2>
      <dl className='grid grid-cols-2 gap-x-6 gap-y-1 text-xs md:grid-cols-3'>
        <div>
          <dt className='text-muted-foreground font-medium'>Class</dt>
          <dd>{encounter.classLabel}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground font-medium'>Status</dt>
          <dd>{encounter.status}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground font-medium'>Start</dt>
          <dd>{encounter.start}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground font-medium'>End</dt>
          <dd>{encounter.end}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground font-medium'>Location</dt>
          <dd>{encounter.location}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground font-medium'>Participant</dt>
          <dd>{encounter.participant}</dd>
        </div>
      </dl>
    </div>
  );
}

export function EncounterDetailPage() {
  const { patientId, encounterId } = useParams();
  const safePatientId = patientId?.trim() ?? '';
  const safeEncounterId = encounterId?.trim() ?? '';
  const encounter = useEncounterDetail(safePatientId, safeEncounterId);
  const observations = useEncounterObservations(safePatientId, safeEncounterId);

  if (!safePatientId || !safeEncounterId) {
    return <Navigate to='/patients' replace />;
  }

  const encounterFallback = renderLoadState(
    encounter,
    'Encounter not found.',
    (data) => data === null,
  );

  return (
    <div className='space-y-4'>
      <Link to={`/patients/${patientId}`} className='text-primary text-xs hover:underline'>
        &larr; Back to Dashboard
      </Link>

      {encounterFallback ??
        (encounter.status === 'success' && encounter.data ? (
          <EncounterHeader encounter={encounter.data} />
        ) : null)}

      <ClinicalTable
        title='Observations'
        state={observations}
        emptyMessage='No observations recorded for this encounter.'
        columns={observationColumns}
      />
    </div>
  );
}
