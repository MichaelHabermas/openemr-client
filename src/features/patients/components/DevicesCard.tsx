import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { DeviceRow, QueryResult } from '../types';

interface DevicesCardProps {
  state: QueryResult<DeviceRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<DeviceRow>[] = [
  { header: 'Device Name', accessor: (r) => r.deviceName },
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Manufacturer', accessor: (r) => r.manufacturer },
  { header: 'Expiration', accessor: (r) => r.expirationDate },
];

export function DevicesCard({ state, provenanceBadge }: DevicesCardProps) {
  return (
    <ClinicalTable
      title='Devices'
      state={state}
      emptyMessage='No devices recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
