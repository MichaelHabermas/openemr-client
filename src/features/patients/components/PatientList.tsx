import { PatientListItem } from './PatientListItem';
import type { PatientSummary } from '../types';

interface PatientListProps {
  patients: PatientSummary[];
}

export function PatientList({ patients }: PatientListProps) {
  return (
    <ul className='divide-y rounded-lg border'>
      {patients.map((patient) => (
        <PatientListItem key={patient.id} patient={patient} />
      ))}
    </ul>
  );
}
