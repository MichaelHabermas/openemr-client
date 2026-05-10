import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, RelatedPersonRow } from '../types';

interface RelatedPersonsCardProps {
  state: LoadState<RelatedPersonRow[]>;
}

const columns: ColumnDef<RelatedPersonRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Relationship', accessor: (r) => r.relationship },
  { header: 'Phone', accessor: (r) => r.phone },
  { header: 'Address', accessor: (r) => r.address },
];

export function RelatedPersonsCard({ state }: RelatedPersonsCardProps) {
  return (
    <ClinicalTable
      title='Related Persons'
      state={state}
      emptyMessage='No related persons recorded.'
      columns={columns}
    />
  );
}
