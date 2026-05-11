import type { ReactNode } from 'react';
import { ClinicalTable, type ColumnDef } from './ClinicalTable';
import type { GoalRow, QueryResult } from '../types';

interface GoalsCardProps {
  state: QueryResult<GoalRow[]>;
  provenanceBadge?: ReactNode;
}

const columns: ColumnDef<GoalRow>[] = [
  { header: 'Description', accessor: (r) => r.description },
  { header: 'Lifecycle Status', accessor: (r) => r.lifecycleStatus },
  { header: 'Achievement', accessor: (r) => r.achievementStatus },
  { header: 'Category', accessor: (r) => r.category },
  { header: 'Start Date', accessor: (r) => r.startDate },
  { header: 'Target Date', accessor: (r) => r.targetDate },
];

export function GoalsCard({ state, provenanceBadge }: GoalsCardProps) {
  return (
    <ClinicalTable
      title='Goals'
      state={state}
      emptyMessage='No goals recorded.'
      columns={columns}
      provenanceBadge={provenanceBadge}
    />
  );
}
