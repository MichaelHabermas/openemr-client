import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import type { LoadState } from '../types';
import { ClinicalSectionWrapper } from './ClinicalSectionWrapper';

interface PartialRow {
  id: string;
  hasPartialData: boolean;
}

export interface ColumnDef<TRow> {
  header: string;
  accessor: (row: TRow) => ReactNode;
}

interface ClinicalTableProps<TRow extends PartialRow> {
  title: string;
  titleId?: string;
  state: LoadState<TRow[]>;
  emptyMessage: string;
  columns: ColumnDef<TRow>[];
  rowHref?: (row: TRow) => string;
  provenanceBadge?: ReactNode;
  onAdd?: () => void;
}

export function ClinicalTable<TRow extends PartialRow>({
  title,
  titleId,
  state,
  emptyMessage,
  columns,
  rowHref,
  provenanceBadge,
  onAdd,
}: ClinicalTableProps<TRow>) {
  return (
    <ClinicalSectionWrapper
      title={title}
      titleId={titleId}
      state={state}
      emptyMessage={emptyMessage}
      provenanceBadge={provenanceBadge}
      onAdd={onAdd}>
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
                {rowHref ? <th className='py-1 pr-4 font-semibold' /> : null}
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
                  {rowHref ? (
                    <td className='py-1 pr-4'>
                      <Link to={rowHref(row)} className='text-primary hover:underline'>
                        View
                      </Link>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </ClinicalSectionWrapper>
  );
}
