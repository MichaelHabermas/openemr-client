import type { ProvenanceRecord } from '../types';

interface ProvenanceBadgeProps {
  records: ProvenanceRecord[];
  resourceType: string;
}

export function ProvenanceBadge({ records, resourceType }: ProvenanceBadgeProps) {
  const match = records.find((r) => r.targetRef.includes(resourceType));
  if (!match) return null;

  return (
    <span className='text-muted-foreground text-[10px] font-normal'>
      {match.agent ? `${match.agent} · ` : ''}
      {match.recorded}
    </span>
  );
}
