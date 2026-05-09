import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, PrescriptionRow } from '../types';

interface PrescriptionsCardProps {
  state: LoadState<PrescriptionRow[]>;
}

const columns: ColumnDef<PrescriptionRow>[] = [
  { header: 'Drug', accessor: (rx) => rx.name },
  { header: 'Details', accessor: (rx) => rx.dosage },
  { header: 'Qty', accessor: () => '—' },
  { header: 'Refills', accessor: () => '—' },
  { header: 'Filled', accessor: (rx) => rx.authoredDate },
];

export function PrescriptionsCard({ state }: PrescriptionsCardProps) {
  return (
    <ClinicalTable
      title='Prescriptions'
      state={state}
      emptyMessage='No prescriptions recorded.'
      columns={columns}
    />
  );
}
