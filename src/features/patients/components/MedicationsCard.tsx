import { memo, type ReactNode } from 'react';
import { ClinicalSection } from './ClinicalSection';
import type { QueryResult, MedicationRow } from '../types';

interface MedicationsCardProps {
  state: QueryResult<MedicationRow[]>;
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
