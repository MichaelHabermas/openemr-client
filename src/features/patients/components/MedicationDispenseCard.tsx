import { memo, type ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { QueryResult, MedicationDispenseRow } from '../types';

interface MedicationDispenseCardProps {
  state: QueryResult<MedicationDispenseRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<MedicationDispenseRow>[] = [
  { header: 'Medication', accessor: (r) => r.medication },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Quantity', accessor: (r) => r.quantity },
  { header: 'Days Supply', accessor: (r) => r.daysSupply },
  { header: 'Dispensed', accessor: (r) => r.whenHandedOver },
  { header: 'Dosage', accessor: (r) => r.dosage },
  { header: 'Performer', accessor: (r) => r.performer },
];

export const MedicationDispenseCard = memo(function MedicationDispenseCard({
  state,
  provenanceBadge,
}: MedicationDispenseCardProps) {
  return (
    <ClinicalTable
      title='Medication Dispenses'
      state={state}
      emptyMessage='No medication dispense records found.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
});
