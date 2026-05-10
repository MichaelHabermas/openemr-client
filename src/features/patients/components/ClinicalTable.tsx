import type { LoadState } from '../types';
import { ClinicalSectionWrapper } from './ClinicalSectionWrapper';

interface PartialRow {
  id: string;
  hasPartialData: boolean;
}

export interface ColumnDef<TRow> {
  header: string;
  accessor: (row: TRow) => string;
}

interface ClinicalTableProps<TRow extends PartialRow> {
  title: string;
  titleId?: string;
  state: LoadState<TRow[]>;
  emptyMessage: string;
  columns: ColumnDef<TRow>[];
}

export function ClinicalTable<TRow extends PartialRow>({
  title,
  titleId,
  state,
  emptyMessage,
  columns,
}: ClinicalTableProps<TRow>) {
  return (
    <ClinicalSectionWrapper
      title={title}
      titleId={titleId}
      state={state}
      emptyMessage={emptyMessage}>
      {state.status === 'success' ? (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-xs'>
            <thead>
              <tr className='border-border border-b text-left'>
                {columns.map((col) => (
                  <th key={col.header} className='py-1 pr-4 font-semibold'>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.data.map((row) => (
                <tr key={row.id} className='border-border border-b'>
                  {columns.map((col) => (
                    <td key={col.header} className='py-1 pr-4'>
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </ClinicalSectionWrapper>
  );
}
