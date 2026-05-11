import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, VitalRow } from '../types';

interface VitalsCardProps {
  state: LoadState<VitalRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<VitalRow>[] = [
  { header: 'Vital Sign', accessor: (r) => r.name },
  { header: 'Value', accessor: (r) => r.value },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
];

export function VitalsCard({ state, provenanceBadge }: VitalsCardProps) {
  return (
    <ClinicalTable
      title='Vitals'
      state={state}
      emptyMessage='No vitals recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
