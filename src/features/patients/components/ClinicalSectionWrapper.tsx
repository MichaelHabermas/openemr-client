import { useId, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';

import type { LoadState } from '../types';
import { renderLoadState } from './renderLoadState';

interface ClinicalSectionWrapperProps {
  title: string;
  titleId?: string;
  state: LoadState<{ length: number }>;
  emptyMessage: string;
  children: ReactNode;
}

export function ClinicalSectionWrapper({
  title,
  titleId,
  state,
  emptyMessage,
  children,
}: ClinicalSectionWrapperProps) {
  const generatedId = useId();
  const resolvedTitleId = titleId ?? generatedId;
  const count = state.status === 'success' ? state.data.length : null;
  const fallback = renderLoadState(state, emptyMessage);

  return (
    <section aria-labelledby={resolvedTitleId}>
      <h3
        id={resolvedTitleId}
        className='text-primary border-border mb-2 flex items-center justify-between border-b pb-1 text-sm font-semibold'>
        <span>
          {title}
          {count != null ? ` [${count}]` : ''}
        </span>
        <Pencil className='text-muted-foreground h-3.5 w-3.5 opacity-50' aria-hidden='true' />
      </h3>
      {fallback ?? children}
    </section>
  );
}
