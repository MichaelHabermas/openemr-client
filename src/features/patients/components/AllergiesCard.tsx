import { memo, useState, type ReactNode } from 'react';
import { ClinicalSection } from './ClinicalSection';
import { CreateAllergyForm } from './CreateAllergyForm';
import type { AllergyRow, QueryResult } from '../types';

interface AllergiesCardProps {
  state: QueryResult<AllergyRow[]>;
  patientId?: string;
  provenanceBadge?: ReactNode;
}

export const AllergiesCard = memo(function AllergiesCard({
  state,
  patientId,
  provenanceBadge,
}: AllergiesCardProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <ClinicalSection
        title='Allergies'
        state={state}
        emptyMessage='No allergies recorded.'
        onAdd={patientId ? () => setShowForm(true) : undefined}
        provenanceBadge={provenanceBadge}
        renderRow={(allergy) => {
          const parts = [allergy.substance];
          if (allergy.severity !== 'Not recorded') parts.push(`(${allergy.severity})`);
          return <span className='text-xs'>{parts.join(' ')}</span>;
        }}
      />
      {showForm && patientId ? (
        <CreateAllergyForm
          patientId={patientId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      ) : null}
    </>
  );
});
