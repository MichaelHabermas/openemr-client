import type { ReactNode } from 'react';

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
  const fallback = renderLoadState(state, emptyMessage);

  return (
    <section aria-labelledby={titleId}>
      <h3
        id={titleId}
        className='text-primary border-border mb-2 border-b pb-1 text-sm font-semibold'>
        {title}
      </h3>
      {fallback ?? (
        <ul className='space-y-0.5'>
          {(state as { data: TRow[] }).data.map((row) => (
            <li key={row.id}>
              {row.hasPartialData ? (
                <span className='text-muted-foreground text-xs italic'>Partial data — </span>
              ) : null}
              {renderRow(row)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
