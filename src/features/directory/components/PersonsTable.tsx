import { ClinicalTable, type ColumnDef } from '@/features/patients/components/ClinicalTable';
import type { QueryResult } from '@/features/patients/types';
import type { PersonRow } from '../types';

const columns: ColumnDef<PersonRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Gender', accessor: (r) => r.gender },
  { header: 'Birth Date', accessor: (r) => r.birthDate },
  { header: 'Phone', accessor: (r) => r.phone },
  { header: 'Address', accessor: (r) => r.address },
  { header: 'Active', accessor: (r) => r.active },
];

interface PersonsTableProps {
  state: QueryResult<PersonRow[]>;
}

export function PersonsTable({ state }: PersonsTableProps) {
  return (
    <ClinicalTable
      title='Persons'
      state={state}
      emptyMessage='No persons found.'
      columns={columns}
    />
  );
}
