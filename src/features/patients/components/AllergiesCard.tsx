import { ClinicalCard } from './ClinicalCard';
import { ClinicalField } from './ClinicalField';
import { StatusLabel } from './StatusLabel';
import type { AllergyRow, LoadState } from '../types';

interface AllergiesCardProps {
  state: LoadState<AllergyRow[]>;
}

export function AllergiesCard({ state }: AllergiesCardProps) {
  return (
    <ClinicalCard
      title='Allergies'
      description='Allergy and intolerance information from FHIR.'
      state={state}
      emptyMessage='No allergies recorded.'
      renderRow={(allergy) => (
        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <h3 className='font-medium'>{allergy.substance}</h3>
            <StatusLabel label={allergy.clinicalStatus} tone='warning' />
          </div>
          <dl className='grid gap-3 sm:grid-cols-2'>
            <ClinicalField label='Verification' value={allergy.verificationStatus} />
            <ClinicalField label='Reaction' value={allergy.reaction} />
            <ClinicalField label='Severity' value={allergy.severity} />
            <ClinicalField label='Recorded' value={allergy.recordedDate} />
          </dl>
        </div>
      )}
    />
  );
}
