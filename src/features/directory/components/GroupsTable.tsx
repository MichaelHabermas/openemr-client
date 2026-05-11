import { ClinicalTable, type ColumnDef } from '@/features/patients/components/ClinicalTable';
import type { QueryResult } from '@/features/patients/types';
import type { GroupRow } from '../types';

const columns: ColumnDef<GroupRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Members', accessor: (r) => r.memberCount },
  { header: 'Managing Entity', accessor: (r) => r.managingEntity },
  { header: 'Active', accessor: (r) => r.active },
];

interface GroupsTableProps {
  state: QueryResult<GroupRow[]>;
}

export function GroupsTable({ state }: GroupsTableProps) {
  return (
    <ClinicalTable title='Groups' state={state} emptyMessage='No groups found.' columns={columns} />
  );
}
