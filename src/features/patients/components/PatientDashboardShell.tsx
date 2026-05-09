import { AllergiesCard } from './AllergiesCard';
import { CareTeamCard } from './CareTeamCard';
import { EncountersCard } from './EncountersCard';
import { MedicationsCard } from './MedicationsCard';
import { PatientHeader } from './PatientHeader';
import { PrescriptionsCard } from './PrescriptionsCard';
import { ProblemListCard } from './ProblemListCard';
import type {
  AllergyRow,
  CareTeamRow,
  EncounterRow,
  LoadState,
  MedicationRow,
  PatientHeaderModel,
  PrescriptionRow,
  ProblemRow,
} from '../types';

const TAB_LABELS = [
  'Dashboard',
  'History',
  'Assessments',
  'Report',
  'Documents',
  'Transactions',
  'Issues',
  'Ledger',
  'External Data',
] as const;

interface PatientDashboardShellProps {
  patient: LoadState<PatientHeaderModel | null>;
  allergies: LoadState<AllergyRow[]>;
  problems: LoadState<ProblemRow[]>;
  medications: LoadState<MedicationRow[]>;
  prescriptions: LoadState<PrescriptionRow[]>;
  careTeam: LoadState<CareTeamRow[]>;
  encounters: LoadState<EncounterRow[]>;
}

export function PatientDashboardShell({
  patient,
  allergies,
  problems,
  medications,
  prescriptions,
  careTeam,
  encounters,
}: PatientDashboardShellProps) {
  const patientName =
    patient.status === 'success' && patient.data ? patient.data.displayName : null;

  return (
    <div className='space-y-4'>
      <PatientHeader state={patient} />

      <div>
        <h2 className='text-foreground text-base font-semibold'>
          Medical Record Dashboard{patientName ? ` - ${patientName}` : ''}
        </h2>
        <nav aria-label='Dashboard tabs' className='border-border mt-1 border-b'>
          <ul className='flex text-xs'>
            {TAB_LABELS.map((label) => (
              <li key={label}>
                <span
                  className={
                    label === 'Dashboard'
                      ? 'border-primary text-primary inline-block border-b-2 px-3 py-1 font-semibold'
                      : 'text-muted-foreground inline-block px-3 py-1'
                  }
                  aria-current={label === 'Dashboard' ? 'page' : undefined}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className='grid grid-cols-1 gap-x-6 md:grid-cols-3'>
        <AllergiesCard state={allergies} />
        <ProblemListCard state={problems} />
        <MedicationsCard state={medications} />
      </div>

      <PrescriptionsCard state={prescriptions} />
      <CareTeamCard state={careTeam} />
      <EncountersCard state={encounters} />
    </div>
  );
}
