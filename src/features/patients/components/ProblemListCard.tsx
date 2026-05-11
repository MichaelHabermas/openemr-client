import { memo, useState, type ReactNode } from 'react';
import { ClinicalSection } from './ClinicalSection';
import { CreateProblemForm } from './CreateProblemForm';
import type { QueryResult, ProblemRow } from '../types';

interface ProblemListCardProps {
  state: QueryResult<ProblemRow[]>;
  patientId?: string;
  provenanceBadge?: ReactNode;
}

export const ProblemListCard = memo(function ProblemListCard({
  state,
  patientId,
  provenanceBadge,
}: ProblemListCardProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <ClinicalSection
        title='Medical Problems'
        state={state}
        emptyMessage='No problems recorded.'
        onAdd={patientId ? () => setShowForm(true) : undefined}
        provenanceBadge={provenanceBadge}
        renderRow={(problem) => <span className='text-xs'>{problem.name}</span>}
      />
      {showForm && patientId ? (
        <CreateProblemForm
          patientId={patientId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      ) : null}
    </>
  );
});
