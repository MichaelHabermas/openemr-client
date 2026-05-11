import type { ReactNode } from 'react';

import type { QueryResult } from '../types';
import { SkeletonLoader } from './SkeletonLoader';

export function renderLoadState<T>(
  query: QueryResult<T>,
  emptyMessage: string,
  isEmpty: (data: T) => boolean,
): ReactNode | null {
  if (query.status === 'pending') {
    return <SkeletonLoader />;
  }

  if (query.status === 'error') {
    return (
      <p className='text-destructive text-xs' role='alert'>
        {query.error?.message ?? 'An error occurred.'}
      </p>
    );
  }

  if (query.data != null && isEmpty(query.data)) {
    return <p className='text-muted-foreground text-xs'>{emptyMessage}</p>;
  }

  if (query.data == null) {
    return <p className='text-muted-foreground text-xs'>{emptyMessage}</p>;
  }

  return null;
}
