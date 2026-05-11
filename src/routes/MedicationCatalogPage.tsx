import { MedicationsCatalogTable } from '@/features/medications/components/MedicationsCatalogTable';
import { useMedicationsCatalog } from '@/features/medications/hooks';

export function MedicationCatalogPage() {
  const catalogState = useMedicationsCatalog();

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-primary text-xs font-semibold tracking-wide uppercase'>
          OpenEMR medication index
        </p>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight'>Medication Catalog</h1>
      </div>

      <MedicationsCatalogTable state={catalogState} />
    </div>
  );
}
