import { memo, type ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { CareTeamRow, LoadState } from '../types';

interface CareTeamCardProps {
  state: LoadState<CareTeamRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<CareTeamRow>[] = [
  { header: 'Type', accessor: () => '—' },
  { header: 'Member', accessor: (m) => m.name },
  { header: 'Role', accessor: (m) => m.role },
  { header: 'Specialty', accessor: (m) => m.specialty ?? '—' },
  { header: 'Facility', accessor: (m) => m.facility },
  { header: 'Since', accessor: (m) => m.since },
  { header: 'Status', accessor: (m) => m.status },
  { header: 'Note', accessor: () => '—' },
  { header: 'Remove', accessor: () => '—' },
];

export const CareTeamCard = memo(function CareTeamCard({
  state,
  provenanceBadge,
}: CareTeamCardProps) {
  return (
    <ClinicalTable
      title='Care Team'
      state={state}
      emptyMessage='No care team recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
});
