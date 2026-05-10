import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { DiagnosticReportRow, LoadState } from '../types';

interface DiagnosticReportsCardProps {
  state: LoadState<DiagnosticReportRow[]>;
}

const columns: ColumnDef<DiagnosticReportRow>[] = [
  { header: 'Report', accessor: (r) => r.name },
  { header: 'Category', accessor: (r) => r.category },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Performer', accessor: (r) => r.performer },
  { header: 'Conclusion', accessor: (r) => r.conclusion },
];

export function DiagnosticReportsCard({ state }: DiagnosticReportsCardProps) {
  return (
    <ClinicalTable
      title='Diagnostic Reports'
      state={state}
      emptyMessage='No diagnostic reports recorded.'
      columns={columns}
    />
  );
}
