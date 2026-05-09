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
  subtitle?: string;
  state: LoadState<TRow[]>;
  emptyMessage: string;
  columns: ColumnDef<TRow>[];
}

export function ClinicalTable<TRow extends PartialRow>({
  title,
  titleId,
  subtitle,
  state,
  emptyMessage,
  columns,
}: ClinicalTableProps<TRow>) {
  const fallback = renderLoadState(state, emptyMessage);

  return (
    <section aria-labelledby={titleId}>
      <h3
        id={titleId}
        className='text-primary border-border mb-1 border-b pb-1 text-sm font-semibold'>
        {title}
      </h3>
      {subtitle ? <p className='text-muted-foreground mb-2 text-xs'>{subtitle}</p> : null}
      {fallback ?? (
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
              {(state as { data: TRow[] }).data.map((row) => (
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
      )}
    </section>
  );
}
