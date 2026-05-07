import { ClinicalCard } from './ClinicalCard';
import { ClinicalField } from './ClinicalField';
import { StatusLabel } from './StatusLabel';
import type { LoadState, MedicationRow } from '../types';

interface MedicationsCardProps {
  state: LoadState<MedicationRow[]>;
}

export function MedicationsCard({ state }: MedicationsCardProps) {
  return (
    <ClinicalCard
      title='Medications'
      description='Medication context from FHIR MedicationRequest.'
      state={state}
      emptyMessage='No medications recorded.'
      renderRow={(medication) => (
        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <h3 className='font-medium'>{medication.name}</h3>
            <StatusLabel label={medication.status} />
          </div>
          <dl className='grid gap-3 sm:grid-cols-2'>
            <ClinicalField label='Dosage' value={medication.dosage} />
            <ClinicalField label='Date' value={medication.dateLabel} />
            <ClinicalField label='Prescriber' value={medication.prescriber} />
          </dl>
        </div>
      )}
    />
  );
}
