import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

import type { LoadState } from '../types';
import { renderLoadState } from './renderLoadState';

interface PartialRow {
  id: string;
  hasPartialData: boolean;
}

interface ClinicalSectionProps<TRow extends PartialRow> {
  title: string;
  titleId?: string;
  state: LoadState<TRow[]>;
  emptyMessage: string;
  renderRow: (row: TRow) => ReactNode;
}

export function ClinicalSection<TRow extends PartialRow>({
  title,
  titleId,
  state,
  emptyMessage,
  renderRow,
}: ClinicalSectionProps<TRow>) {
  const count = state.status === 'success' ? state.data.length : null;
  const fallback = renderLoadState(state, emptyMessage);

  return (
    <section aria-labelledby={titleId}>
      <h3
        id={titleId}
        className='text-primary border-border mb-2 flex items-center justify-between border-b pb-1 text-sm font-semibold'>
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
            <ul className='space-y-0.5'>
              {state.data.map((row) => (
                <li key={row.id}>
                  {row.hasPartialData ? (
                    <span className='text-muted-foreground text-xs italic'>Partial data — </span>
                  ) : null}
                  {renderRow(row)}
                </li>
              ))}
            </ul>
          );
        })()}
    </section>
  );
}
