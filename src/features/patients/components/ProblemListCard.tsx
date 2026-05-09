import { ClinicalSection } from './ClinicalSection';
import type { LoadState, ProblemRow } from '../types';

interface ProblemListCardProps {
  state: LoadState<ProblemRow[]>;
}

export function ProblemListCard({ state }: ProblemListCardProps) {
  return (
    <ClinicalSection
      title='Medical Problems'
      state={state}
      emptyMessage='No problems recorded.'
      renderRow={(problem) => <span className='text-xs'>{problem.name}</span>}
    />
  );
}
