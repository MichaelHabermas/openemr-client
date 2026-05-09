import { ClinicalSection } from './ClinicalSection';
import type { AllergyRow, LoadState } from '../types';

interface AllergiesCardProps {
  state: LoadState<AllergyRow[]>;
}

export function AllergiesCard({ state }: AllergiesCardProps) {
  return (
    <ClinicalSection
      title='Allergies'
      state={state}
      emptyMessage='No allergies recorded.'
      renderRow={(allergy) => {
        const parts = [allergy.substance];
        if (allergy.severity !== 'Not recorded') parts.push(`(${allergy.severity})`);
        return <span className='text-xs'>{parts.join(' ')}</span>;
      }}
    />
  );
}
