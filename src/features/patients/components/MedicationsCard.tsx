import { memo, type ReactNode } from 'react';
import { ClinicalSection } from './ClinicalSection';
import type { LoadState, MedicationRow } from '../types';

interface MedicationsCardProps {
  state: LoadState<MedicationRow[]>;
  provenanceBadge?: ReactNode;
}

export const MedicationsCard = memo(function MedicationsCard({
  state,
  provenanceBadge,
}: MedicationsCardProps) {
  return (
    <ClinicalSection
      title='Medications'
      state={state}
      emptyMessage='Nothing Recorded'
      provenanceBadge={provenanceBadge}
      renderRow={(medication) => {
        const text =
          medication.dosage !== 'Not recorded'
            ? `${medication.name} ${medication.dosage}`
            : medication.name;
        return <span className='text-xs'>{text}</span>;
      }}
    />
  );
});
