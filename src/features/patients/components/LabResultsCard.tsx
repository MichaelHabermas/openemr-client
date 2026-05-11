import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LabRow, QueryResult } from '../types';

interface LabResultsCardProps {
  state: QueryResult<LabRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<LabRow>[] = [
  { header: 'Test', accessor: (r) => r.name },
  { header: 'Value', accessor: (r) => r.value },
  { header: 'Reference Range', accessor: (r) => r.referenceRange },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
];

export function LabResultsCard({ state, provenanceBadge }: LabResultsCardProps) {
  return (
    <ClinicalTable
      title='Lab Results'
      state={state}
      emptyMessage='No lab results recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
