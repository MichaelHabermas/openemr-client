import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { DiagnosticReportRow, QueryResult } from '../types';

interface DiagnosticReportsCardProps {
  state: QueryResult<DiagnosticReportRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<DiagnosticReportRow>[] = [
  { header: 'Report', accessor: (r) => r.name },
  { header: 'Category', accessor: (r) => r.category },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Performer', accessor: (r) => r.performer },
  { header: 'Conclusion', accessor: (r) => r.conclusion },
];

export function DiagnosticReportsCard({ state, provenanceBadge }: DiagnosticReportsCardProps) {
  return (
    <ClinicalTable
      title='Diagnostic Reports'
      state={state}
      emptyMessage='No diagnostic reports recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
