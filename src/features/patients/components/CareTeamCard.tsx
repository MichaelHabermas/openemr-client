import { ClinicalCard } from './ClinicalCard';
import { ClinicalField } from './ClinicalField';
import { StatusLabel } from './StatusLabel';
import type { CareTeamRow, LoadState } from '../types';

interface CareTeamCardProps {
  state: LoadState<CareTeamRow[]>;
}

export function CareTeamCard({ state }: CareTeamCardProps) {
  return (
    <ClinicalCard
      title='Care Team'
      description='Care-team participants and roles from FHIR.'
      state={state}
      emptyMessage='No care team recorded.'
      renderRow={(member) => (
        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <h3 className='font-medium'>{member.name}</h3>
            <StatusLabel label={member.status} />
          </div>
          <dl className='grid gap-3 sm:grid-cols-2'>
            <ClinicalField label='Role' value={member.role} />
            <ClinicalField label='Reference' value={member.reference} />
          </dl>
        </div>
      )}
    />
  );
}
