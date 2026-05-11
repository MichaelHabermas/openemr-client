import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { CarePlanRow, QueryResult } from '../types';

interface CarePlansCardProps {
  state: QueryResult<CarePlanRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<CarePlanRow>[] = [
  { header: 'Title', accessor: (r) => r.title },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Intent', accessor: (r) => r.intent },
  { header: 'Category', accessor: (r) => r.category },
  { header: 'Period', accessor: (r) => r.period },
  { header: 'Description', accessor: (r) => r.description },
];

export function CarePlansCard({ state, provenanceBadge }: CarePlansCardProps) {
  return (
    <ClinicalTable
      title='Care Plans'
      state={state}
      emptyMessage='No care plans recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
