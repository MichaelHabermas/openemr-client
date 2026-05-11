import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { QueryResult, RelatedPersonRow } from '../types';

interface RelatedPersonsCardProps {
  state: QueryResult<RelatedPersonRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<RelatedPersonRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Relationship', accessor: (r) => r.relationship },
  { header: 'Phone', accessor: (r) => r.phone },
  { header: 'Address', accessor: (r) => r.address },
];

export function RelatedPersonsCard({ state, provenanceBadge }: RelatedPersonsCardProps) {
  return (
    <ClinicalTable
      title='Related Persons'
      state={state}
      emptyMessage='No related persons recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
