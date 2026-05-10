import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, SocialHistoryRow } from '../types';

interface SocialHistoryCardProps {
  state: LoadState<SocialHistoryRow[]>;
}

const columns: ColumnDef<SocialHistoryRow>[] = [
  { header: 'Item', accessor: (r) => r.name },
  { header: 'Value', accessor: (r) => r.value },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
];

export function SocialHistoryCard({ state }: SocialHistoryCardProps) {
  return (
    <ClinicalTable
      title='Social History'
      state={state}
      emptyMessage='No social history recorded.'
      columns={columns}
    />
  );
}
