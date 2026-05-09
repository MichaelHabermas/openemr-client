import type { ReactNode } from 'react';

import type { LoadState } from '../types';

export function renderLoadState<T>(state: LoadState<T>, emptyMessage: string): ReactNode | null {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <p className='text-muted-foreground text-xs' aria-live='polite'>
        Loading...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <p className='text-destructive text-xs' role='alert'>
        {state.error.message}
      </p>
    );
  }

  if (state.isEmpty) {
    return <p className='text-muted-foreground text-xs'>{emptyMessage}</p>;
  }

  return null;
}
