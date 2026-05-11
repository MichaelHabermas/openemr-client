import { ClinicalTable, type ColumnDef } from '@/features/patients/components/ClinicalTable';
import type { QueryResult } from '@/features/patients/types';
import type { MedicationCatalogRow } from '../types';

const columns: ColumnDef<MedicationCatalogRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Form', accessor: (r) => r.form },
  { header: 'Manufacturer', accessor: (r) => r.manufacturer },
];

interface MedicationsCatalogTableProps {
  state: QueryResult<MedicationCatalogRow[]>;
}

export function MedicationsCatalogTable({ state }: MedicationsCatalogTableProps) {
  return (
    <ClinicalTable
      title='Medication Catalog'
      state={state}
      emptyMessage='No medications found.'
      columns={columns}
    />
  );
}
