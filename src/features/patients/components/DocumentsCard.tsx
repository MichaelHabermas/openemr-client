import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { DocumentRow, LoadState } from '../types';

interface DocumentsCardProps {
  state: LoadState<DocumentRow[]>;
}

const columns: ColumnDef<DocumentRow>[] = [
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Author', accessor: (r) => r.author },
  { header: 'Description', accessor: (r) => r.description },
  { header: 'Status', accessor: (r) => r.status },
];

export function DocumentsCard({ state }: DocumentsCardProps) {
  return (
    <ClinicalTable
      title='Documents'
      state={state}
      emptyMessage='No documents recorded.'
      columns={columns}
    />
  );
}
