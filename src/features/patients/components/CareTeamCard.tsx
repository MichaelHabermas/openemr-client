import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { CareTeamRow, LoadState } from '../types';

interface CareTeamCardProps {
  state: LoadState<CareTeamRow[]>;
}

const columns: ColumnDef<CareTeamRow>[] = [
  { header: 'Type', accessor: () => '—' },
  { header: 'Member', accessor: (m) => m.name },
  { header: 'Role', accessor: (m) => m.role },
  { header: 'Facility', accessor: () => '—' },
  { header: 'Since', accessor: () => '—' },
  { header: 'Status', accessor: (m) => m.status },
  { header: 'Note', accessor: () => '—' },
  { header: 'Remove', accessor: () => '—' },
];

export function CareTeamCard({ state }: CareTeamCardProps) {
  return (
    <ClinicalTable
      title='Care Team'
      state={state}
      emptyMessage='No care team recorded.'
      columns={columns}
    />
  );
}
