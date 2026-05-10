import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, VitalRow } from '../types';

interface VitalsCardProps {
  state: LoadState<VitalRow[]>;
}

const columns: ColumnDef<VitalRow>[] = [
  { header: 'Vital Sign', accessor: (r) => r.name },
  { header: 'Value', accessor: (r) => r.value },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
];

export function VitalsCard({ state }: VitalsCardProps) {
  return (
    <ClinicalTable
      title='Vitals'
      state={state}
      emptyMessage='No vitals recorded.'
      columns={columns}
    />
  );
}
