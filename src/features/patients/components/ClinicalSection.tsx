import type { ReactNode } from 'react';

import type { QueryResult } from '../types';
import { ClinicalSectionWrapper } from './ClinicalSectionWrapper';

interface PartialRow {
  id: string;
  hasPartialData: boolean;
}

interface ClinicalSectionProps<TRow extends PartialRow> {
  title: string;
  titleId?: string;
  state: QueryResult<TRow[]>;
  emptyMessage: string;
  renderRow: (row: TRow) => ReactNode;
  provenanceBadge?: ReactNode;
  onAdd?: () => void;
}

export function ClinicalSection<TRow extends PartialRow>({
  title,
  titleId,
  state,
  emptyMessage,
  renderRow,
  provenanceBadge,
  onAdd,
}: ClinicalSectionProps<TRow>) {
  return (
    <ClinicalSectionWrapper
      title={title}
      titleId={titleId}
      state={state}
      emptyMessage={emptyMessage}
      provenanceBadge={provenanceBadge}
      onAdd={onAdd}>
      {state.status === 'success' && state.data ? (
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
      ) : null}
    </ClinicalSectionWrapper>
  );
}
