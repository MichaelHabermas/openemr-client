interface PatientSearchFieldProps {
  value: string;
  resultCountId: string;
  onChange: (value: string) => void;
}

export function PatientSearchField({ value, resultCountId, onChange }: PatientSearchFieldProps) {
  return (
    <div className='space-y-2'>
      <label htmlFor='patient-search' className='text-sm font-medium'>
        Search patients
      </label>
      <input
        id='patient-search'
        type='search'
        value={value}
        autoComplete='off'
        aria-describedby={resultCountId}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder='Name, DOB, MRN, sex, or status'
        className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
      />
    </div>
  );
}
