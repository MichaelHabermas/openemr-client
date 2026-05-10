import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { AppointmentRow, LoadState } from '../types';

interface AppointmentsCardProps {
  state: LoadState<AppointmentRow[]>;
}

const columns: ColumnDef<AppointmentRow>[] = [
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Reason', accessor: (r) => r.reason },
  { header: 'Start', accessor: (r) => r.start },
  { header: 'End', accessor: (r) => r.end },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Participant', accessor: (r) => r.participant },
];

export function AppointmentsCard({ state }: AppointmentsCardProps) {
  return (
    <ClinicalTable
      title='Appointments'
      state={state}
      emptyMessage='No appointments recorded.'
      columns={columns}
    />
  );
}
