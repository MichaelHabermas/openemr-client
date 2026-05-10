import { useParams } from 'react-router-dom';

import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { EncounterRow, LoadState } from '../types';

interface EncountersCardProps {
  state: LoadState<EncounterRow[]>;
}

const columns: ColumnDef<EncounterRow>[] = [
  { header: 'Type', accessor: (e) => e.type },
  { header: 'Class', accessor: (e) => e.classLabel },
  { header: 'Start', accessor: (e) => e.start },
  { header: 'End', accessor: (e) => e.end },
  { header: 'Location', accessor: (e) => e.location },
  { header: 'Participant', accessor: (e) => e.participant },
  { header: 'Status', accessor: (e) => e.status },
];

export function EncountersCard({ state }: EncountersCardProps) {
  const { patientId } = useParams();

  return (
    <ClinicalTable
      title='Encounter History'
      state={state}
      emptyMessage='No encounters recorded.'
      columns={columns}
      rowHref={patientId ? (row) => `/patients/${patientId}/encounters/${row.id}` : undefined}
    />
  );
}
