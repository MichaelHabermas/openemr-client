import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { QueryResult, ProcedureRow } from '../types';

interface ProceduresCardProps {
  state: QueryResult<ProcedureRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<ProcedureRow>[] = [
  { header: 'Procedure', accessor: (r) => r.name },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Performer', accessor: (r) => r.performer },
  { header: 'Reason', accessor: (r) => r.reason },
];

export function ProceduresCard({ state, provenanceBadge }: ProceduresCardProps) {
  return (
    <ClinicalTable
      title='Procedures'
      state={state}
      emptyMessage='No procedures recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
