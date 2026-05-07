import { useId, useMemo, useState } from 'react';

import { filterPatients } from '../patient-search';
import type { LoadState, PatientSummary } from '../types';
import { PatientList } from './PatientList';
import { PatientSearchField } from './PatientSearchField';

interface PatientPickerProps {
  state: LoadState<PatientSummary[]>;
}

export function PatientPicker({ state }: PatientPickerProps) {
  const [query, setQuery] = useState('');
  const resultCountId = useId();
  const patients = useMemo(() => (state.status === 'success' ? state.data : []), [state]);
  const filteredPatients = useMemo(() => filterPatients(patients, query), [patients, query]);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className='text-muted-foreground text-sm'>Loading...</p>;
  }

  if (state.status === 'error') {
    return (
      <p className='text-destructive text-sm' role='alert'>
        {state.error.message}
      </p>
    );
  }

  return (
    <div className='space-y-4'>
      <PatientSearchField value={query} resultCountId={resultCountId} onChange={setQuery} />
      <p id={resultCountId} className='text-muted-foreground text-sm' aria-live='polite'>
        {resultText(query, filteredPatients.length, patients.length)}
      </p>
      {state.isEmpty ? (
        <p className='text-muted-foreground text-sm'>No patients found.</p>
      ) : filteredPatients.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No patients match "{query.trim()}".</p>
      ) : (
        <PatientList patients={filteredPatients} />
      )}
    </div>
  );
}

function resultText(query: string, resultCount: number, totalCount: number): string {
  if (totalCount === 0) return 'No patient records returned.';
  if (!query.trim()) return `${totalCount} patient${totalCount === 1 ? '' : 's'} available.`;
  return `${resultCount} of ${totalCount} patient${totalCount === 1 ? '' : 's'} match.`;
}
