import { cn } from '@/lib/utils';

interface StatusLabelProps {
  label: string;
  tone?: 'neutral' | 'active' | 'inactive' | 'warning';
  description?: string;
}

export function StatusLabel({ label, tone = 'neutral', description }: StatusLabelProps) {
  return (
    <span
      aria-label={description}
      className={cn(
        'inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium',
        tone === 'active' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
        tone === 'inactive' && 'border-zinc-200 bg-zinc-50 text-zinc-700',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-800',
        tone === 'neutral' && 'border-border bg-muted text-muted-foreground',
      )}>
      {label}
    </span>
  );
}
