import { ClinicalCard } from './ClinicalCard';
import { ClinicalField } from './ClinicalField';
import { StatusLabel } from './StatusLabel';
import type { LoadState, ProblemRow } from '../types';

interface ProblemListCardProps {
  state: LoadState<ProblemRow[]>;
}

export function ProblemListCard({ state }: ProblemListCardProps) {
  return (
    <ClinicalCard
      title='Problem List'
      description='Active and historical conditions from FHIR.'
      state={state}
      emptyMessage='No problems recorded.'
      renderRow={(problem) => (
        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <h3 className='font-medium'>{problem.name}</h3>
            <StatusLabel
              label={
                problem.isActive ? `Active: ${problem.clinicalStatus}` : problem.clinicalStatus
              }
              tone={problem.isActive ? 'active' : 'inactive'}
            />
          </div>
          <dl className='grid gap-3 sm:grid-cols-2'>
            <ClinicalField label='Verification' value={problem.verificationStatus} />
            <ClinicalField label='Date' value={problem.dateLabel} />
            <ClinicalField label='Category' value={problem.category} />
          </dl>
        </div>
      )}
    />
  );
}
