import { useId } from 'react';
import { Pencil } from 'lucide-react';

import type { LoadState } from '../types';
import { renderLoadState } from './renderLoadState';

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
  const generatedId = useId();
  const resolvedTitleId = titleId ?? generatedId;
  const count = state.status === 'success' ? state.data.length : null;
  const fallback = renderLoadState(state, emptyMessage);

  return (
    <section aria-labelledby={resolvedTitleId}>
      <h3
        id={resolvedTitleId}
        className='text-primary border-border mb-1 flex items-center justify-between border-b pb-1 text-sm font-semibold'>
        <span>
          {title}
          {count != null ? ` [${count}]` : ''}
        </span>
        <Pencil className='text-muted-foreground h-3.5 w-3.5 opacity-50' aria-hidden='true' />
      </h3>
      {fallback ??
        (() => {
          if (state.status !== 'success') return null;
          return (
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
          );
        })()}
    </section>
  );
}
