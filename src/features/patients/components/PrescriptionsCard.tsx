import { memo, type ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, PrescriptionRow } from '../types';

interface PrescriptionsCardProps {
  state: LoadState<PrescriptionRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<PrescriptionRow>[] = [
  { header: 'Drug', accessor: (rx) => rx.name },
  { header: 'Details', accessor: (rx) => rx.dosage },
  { header: 'Qty', accessor: (rx) => rx.quantity },
  { header: 'Refills', accessor: (rx) => rx.refills },
  { header: 'Filled', accessor: (rx) => rx.authoredDate },
];

export const PrescriptionsCard = memo(function PrescriptionsCard({
  state,
  provenanceBadge,
}: PrescriptionsCardProps) {
  return (
    <ClinicalTable
      title='Prescriptions'
      state={state}
      emptyMessage='No prescriptions recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
});
