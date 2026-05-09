import { ClinicalSection } from './ClinicalSection';
import type { LoadState, MedicationRow } from '../types';

interface MedicationsCardProps {
  state: LoadState<MedicationRow[]>;
}

export function MedicationsCard({ state }: MedicationsCardProps) {
  return (
    <ClinicalSection
      title='Medications'
      state={state}
      emptyMessage='Nothing Recorded'
      renderRow={(medication) => {
        const text =
          medication.dosage !== 'Not recorded'
            ? `${medication.name} ${medication.dosage}`
            : medication.name;
        return <span className='text-xs'>{text}</span>;
      }}
    />
  );
}
