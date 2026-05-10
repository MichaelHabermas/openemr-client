import type { ReactNode } from 'react';

import type { LoadState } from '../types';
import { SkeletonLoader } from './SkeletonLoader';

export function renderLoadState<T>(state: LoadState<T>, emptyMessage: string): ReactNode | null {
  if (state.status === 'loading' || state.status === 'idle') {
    return <SkeletonLoader />;
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
