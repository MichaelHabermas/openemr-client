import { ClinicalTable, type ColumnDef } from '@/features/patients/components/ClinicalTable';
import type { LoadState } from '@/features/patients/types';
import type { OrganizationRow } from '../types';

const columns: ColumnDef<OrganizationRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Active', accessor: (r) => r.active },
  { header: 'Phone', accessor: (r) => r.phone },
  { header: 'Address', accessor: (r) => r.address },
];

interface OrganizationsTableProps {
  state: LoadState<OrganizationRow[]>;
}

export function OrganizationsTable({ state }: OrganizationsTableProps) {
  return (
    <ClinicalTable
      title='Organizations'
      state={state}
      emptyMessage='No organizations found.'
      columns={columns}
    />
  );
}
