import { ClinicalTable, type ColumnDef } from '@/features/patients/components/ClinicalTable';
import type { QueryResult } from '@/features/patients/types';
import type { LocationRow } from '../types';

const columns: ColumnDef<LocationRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Phone', accessor: (r) => r.phone },
  { header: 'Address', accessor: (r) => r.address },
  { header: 'Organization', accessor: (r) => r.managingOrg },
];

interface LocationsTableProps {
  state: QueryResult<LocationRow[]>;
}

export function LocationsTable({ state }: LocationsTableProps) {
  return (
    <ClinicalTable
      title='Locations'
      state={state}
      emptyMessage='No locations found.'
      columns={columns}
    />
  );
}
