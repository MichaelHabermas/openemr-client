import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';

import type { LoadState } from '../types';
import { renderLoadState } from './renderLoadState';

interface ClinicalSectionWrapperProps {
  title: string;
  titleId?: string;
  state: LoadState<{ length: number }>;
  emptyMessage: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function ClinicalSectionWrapper({
  title,
  titleId,
  state,
  emptyMessage,
  children,
  defaultCollapsed = false,
}: ClinicalSectionWrapperProps) {
  const generatedId = useId();
  const resolvedTitleId = titleId ?? generatedId;
  const contentId = `${resolvedTitleId}-content`;
  const count = state.status === 'success' ? state.data.length : null;
  const fallback = renderLoadState(state, emptyMessage);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const CollapseIcon = collapsed ? ChevronRight : ChevronDown;

  return (
    <section aria-labelledby={resolvedTitleId}>
      <h3
        id={resolvedTitleId}
        className='text-primary border-border mb-2 flex items-center justify-between border-b pb-1 text-sm font-semibold'>
        <button
          type='button'
          onClick={() => setCollapsed((prev) => !prev)}
          className='flex items-center gap-1'
          aria-expanded={!collapsed}
          aria-controls={contentId}>
          <CollapseIcon className='h-3.5 w-3.5' aria-hidden='true' />
          <span>
            {title}
            {count != null ? ` [${count}]` : ''}
          </span>
        </button>
        <Pencil
          className='text-muted-foreground h-3.5 w-3.5 opacity-25'
          aria-hidden='true'
        />
      </h3>
      <div id={contentId} hidden={collapsed}>
        {fallback ?? children}
      </div>
    </section>
  );
}
