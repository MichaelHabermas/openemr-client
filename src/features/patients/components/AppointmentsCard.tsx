import { useState, type ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import { CreateAppointmentForm } from './CreateAppointmentForm';
import type { AppointmentRow, QueryResult } from '../types';

interface AppointmentsCardProps {
  state: QueryResult<AppointmentRow[]>;
  patientId?: string;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<AppointmentRow>[] = [
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Reason', accessor: (r) => r.reason },
  { header: 'Start', accessor: (r) => r.start },
  { header: 'End', accessor: (r) => r.end },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Participant', accessor: (r) => r.participant },
];

export function AppointmentsCard({ state, patientId, provenanceBadge }: AppointmentsCardProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <ClinicalTable
        title='Appointments'
        state={state}
        emptyMessage='No appointments recorded.'
        columns={columns}
        onAdd={patientId ? () => setShowForm(true) : undefined}
        provenanceBadge={provenanceBadge}
      />
      {showForm && patientId ? (
        <CreateAppointmentForm
          patientId={patientId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      ) : null}
    </>
  );
}
