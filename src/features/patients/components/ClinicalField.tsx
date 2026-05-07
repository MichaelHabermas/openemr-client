interface ClinicalFieldProps {
  label: string;
  value: string;
}

export function ClinicalField({ label, value }: ClinicalFieldProps) {
  return (
    <div className='min-w-0'>
      <dt className='text-muted-foreground text-xs font-medium'>{label}</dt>
      <dd className='mt-1 break-words text-sm'>{value}</dd>
    </div>
  );
}
