import { ClinicalCard } from './ClinicalCard';
import { ClinicalField } from './ClinicalField';
import { StatusLabel } from './StatusLabel';
import type { LoadState, PrescriptionRow } from '../types';

interface PrescriptionsCardProps {
  state: LoadState<PrescriptionRow[]>;
}

export function PrescriptionsCard({ state }: PrescriptionsCardProps) {
  return (
    <ClinicalCard
      title='Prescriptions'
      description='Prescription and order details from FHIR MedicationRequest.'
      state={state}
      emptyMessage='No prescriptions recorded.'
      renderRow={(prescription) => (
        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <h3 className='font-medium'>{prescription.name}</h3>
            <StatusLabel label={prescription.status} />
          </div>
          <dl className='grid gap-3 sm:grid-cols-2'>
            <ClinicalField label='Intent' value={prescription.intent} />
            <ClinicalField label='Authored' value={prescription.authoredDate} />
            <ClinicalField label='Dosage' value={prescription.dosage} />
            <ClinicalField label='Prescriber' value={prescription.prescriber} />
          </dl>
        </div>
      )}
    />
  );
}
