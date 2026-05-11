import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { CoverageRow, QueryResult } from '../types';

interface InsuranceCardProps {
  state: QueryResult<CoverageRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<CoverageRow>[] = [
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Payor', accessor: (r) => r.payor },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Period', accessor: (r) => r.period },
  { header: 'Subscriber ID', accessor: (r) => r.subscriberId },
  { header: 'Relationship', accessor: (r) => r.relationship },
];

export function InsuranceCard({ state, provenanceBadge }: InsuranceCardProps) {
  return (
    <ClinicalTable
      title='Insurance'
      state={state}
      emptyMessage='No insurance information recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
