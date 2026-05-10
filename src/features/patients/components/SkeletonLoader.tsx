interface SkeletonLoaderProps {
  lines?: number;
  variant?: 'list' | 'table';
}

function SkeletonBar({ width }: { width: string }) {
  return (
    <div
      className='bg-muted animate-pulse rounded'
      style={{ width, height: '0.75rem' }}
      aria-hidden='true'
    />
  );
}

export function SkeletonLoader({ lines = 3, variant = 'list' }: SkeletonLoaderProps) {
  const widths =
    variant === 'table' ? ['100%', '100%', '100%'] : ['75%', '60%', '85%', '50%', '70%'];

  return (
    <div className='space-y-2' role='status' aria-label='Loading'>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBar key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}
