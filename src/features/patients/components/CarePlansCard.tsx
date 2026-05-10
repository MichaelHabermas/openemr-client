import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { CarePlanRow, LoadState } from '../types';

interface CarePlansCardProps {
  state: LoadState<CarePlanRow[]>;
}

const columns: ColumnDef<CarePlanRow>[] = [
  { header: 'Title', accessor: (r) => r.title },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Intent', accessor: (r) => r.intent },
  { header: 'Category', accessor: (r) => r.category },
  { header: 'Period', accessor: (r) => r.period },
  { header: 'Description', accessor: (r) => r.description },
];

export function CarePlansCard({ state }: CarePlansCardProps) {
  return (
    <ClinicalTable
      title='Care Plans'
      state={state}
      emptyMessage='No care plans recorded.'
      columns={columns}
    />
  );
}
