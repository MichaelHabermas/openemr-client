import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { DeviceRow, LoadState } from '../types';

interface DevicesCardProps {
  state: LoadState<DeviceRow[]>;
}

const columns: ColumnDef<DeviceRow>[] = [
  { header: 'Device Name', accessor: (r) => r.deviceName },
  { header: 'Type', accessor: (r) => r.type },
  { header: 'Status', accessor: (r) => r.status },
  { header: 'Manufacturer', accessor: (r) => r.manufacturer },
  { header: 'Expiration', accessor: (r) => r.expirationDate },
];

export function DevicesCard({ state }: DevicesCardProps) {
  return (
    <ClinicalTable
      title='Devices'
      state={state}
      emptyMessage='No devices recorded.'
      columns={columns}
    />
  );
}
