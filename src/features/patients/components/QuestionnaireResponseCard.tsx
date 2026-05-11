import { memo, type ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { QueryResult, QuestionnaireResponseRow } from '../types';

interface QuestionnaireResponseCardProps {
  state: QueryResult<QuestionnaireResponseRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<QuestionnaireResponseRow>[] = [
  { header: 'Questionnaire', accessor: (r) => r.questionnaire },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Authored', accessor: (r) => r.authored },
  { header: 'Author', accessor: (r) => r.author },
  { header: 'Items', accessor: (r) => r.itemCount },
];

export const QuestionnaireResponseCard = memo(function QuestionnaireResponseCard({
  state,
  provenanceBadge,
}: QuestionnaireResponseCardProps) {
  return (
    <ClinicalTable
      title='Questionnaire Responses'
      state={state}
      emptyMessage='No questionnaire responses found.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
});
