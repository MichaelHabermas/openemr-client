import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { LoadState, ServiceRequestRow } from '../types';

interface ServiceRequestsCardProps {
  state: LoadState<ServiceRequestRow[]>;
}

const columns: ColumnDef<ServiceRequestRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Intent', accessor: (r) => r.intent },
  { header: 'Priority', accessor: (r) => r.priority },
  { header: 'Requester', accessor: (r) => r.requester },
  { header: 'Date', accessor: (r) => r.authoredOn },
];

export function ServiceRequestsCard({ state }: ServiceRequestsCardProps) {
  return (
    <ClinicalTable
      title='Service Requests'
      state={state}
      emptyMessage='No service requests recorded.'
      columns={columns}
    />
  );
}
