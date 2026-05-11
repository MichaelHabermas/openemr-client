import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import { DocumentViewButton } from './DocumentViewButton';
import type { DocumentRow, QueryResult } from '../types';

interface DocumentsCardProps {
  state: QueryResult<DocumentRow[]>;
  provenanceBadge?: ReactNode;
}

export function DocumentsCard({ state, provenanceBadge }: DocumentsCardProps) {
  const { patientId } = useParams();

  const columns: ColumnDef<DocumentRow>[] = [
    { header: 'Type', accessor: (r) => r.type },
    { header: 'Date', accessor: (r) => r.date },
    { header: 'Author', accessor: (r) => r.author },
    { header: 'Description', accessor: (r) => r.description },
    { header: 'Status', accessor: (r) => r.status },
    ...(patientId
      ? [
          {
            header: '',
            accessor: (r: DocumentRow) => (
              <DocumentViewButton patientId={patientId} documentId={r.id} />
            ),
          },
        ]
      : []),
  ];

  return (
    <ClinicalTable
      title='Documents'
      state={state}
      emptyMessage='No documents recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
