import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { FamilyHistoryRow, QueryResult } from '../types';

interface FamilyHistoryCardProps {
  state: QueryResult<FamilyHistoryRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<FamilyHistoryRow>[] = [
  { header: 'Relationship', accessor: (r) => r.relationship },
  { header: 'Condition', accessor: (r) => r.condition },
  { header: 'Outcome', accessor: (r) => r.outcome },
  { header: 'Onset', accessor: (r) => r.onset },
  { header: 'Status', accessor: (r) => r.status },
];

export function FamilyHistoryCard({ state, provenanceBadge }: FamilyHistoryCardProps) {
  return (
    <ClinicalTable
      title='Family History'
      state={state}
      emptyMessage='No family history recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
