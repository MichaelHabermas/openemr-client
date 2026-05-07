import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { LoadState } from '../types';

interface PartialRow {
  id: string;
  hasPartialData: boolean;
}

interface ClinicalCardProps<TRow extends PartialRow> {
  title: string;
  titleId?: string;
  description: string;
  state: LoadState<TRow[]>;
  emptyMessage: string;
  renderRow: (row: TRow) => ReactNode;
}

export function ClinicalCard<TRow extends PartialRow>({
  title,
  titleId,
  description,
  state,
  emptyMessage,
  renderRow,
}: ClinicalCardProps<TRow>) {
  return (
    <Card className='min-h-full rounded-lg shadow-xs'>
      <CardHeader>
        <CardTitle id={titleId}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{renderContent(state, emptyMessage, renderRow)}</CardContent>
    </Card>
  );
}

function renderContent<TRow extends PartialRow>(
  state: LoadState<TRow[]>,
  emptyMessage: string,
  renderRow: (row: TRow) => ReactNode,
) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <p className='text-muted-foreground text-sm' aria-live='polite'>
        Loading...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <p className='text-destructive text-sm' role='alert'>
        {state.error.message}
      </p>
    );
  }

  if (state.isEmpty) {
    return <p className='text-muted-foreground text-sm'>{emptyMessage}</p>;
  }

  return (
    <ul className='space-y-3'>
      {state.data.map((row) => (
        <li key={row.id} className='bg-background/60 rounded-md border p-3'>
          {row.hasPartialData ? (
            <p className='mb-3 text-xs font-medium text-amber-800'>Partial data</p>
          ) : null}
          {renderRow(row)}
        </li>
      ))}
    </ul>
  );
}
