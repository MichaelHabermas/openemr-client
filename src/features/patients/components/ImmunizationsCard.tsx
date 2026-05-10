import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { ImmunizationRow, LoadState } from '../types';

interface ImmunizationsCardProps {
  state: LoadState<ImmunizationRow[]>;
}

const columns: ColumnDef<ImmunizationRow>[] = [
  { header: 'Vaccine', accessor: (r) => r.vaccine },
  { header: 'Date', accessor: (r) => r.date },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Dose', accessor: (r) => r.dose },
  { header: 'Site', accessor: (r) => r.site },
  { header: 'Performer', accessor: (r) => r.performer },
];

export function ImmunizationsCard({ state }: ImmunizationsCardProps) {
  return (
    <ClinicalTable
      title='Immunizations'
      state={state}
      emptyMessage='No immunizations recorded.'
      columns={columns}
    />
  );
}
