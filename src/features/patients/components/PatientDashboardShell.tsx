import { useState } from 'react';
import { AllergiesCard } from './AllergiesCard';
import { CareTeamCard } from './CareTeamCard';
import { EncountersCard } from './EncountersCard';
import { ImmunizationsCard } from './ImmunizationsCard';
import { MedicationsCard } from './MedicationsCard';
import { PatientHeader } from './PatientHeader';
import { PrescriptionsCard } from './PrescriptionsCard';
import { ProblemListCard } from './ProblemListCard';
import { VitalsCard } from './VitalsCard';
import type {
  AllergyRow,
  CareTeamRow,
  EncounterRow,
  ImmunizationRow,
  LoadState,
  MedicationRow,
  PatientHeaderModel,
  PrescriptionRow,
  ProblemRow,
  VitalRow,
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

type TabLabel = (typeof TAB_LABELS)[number];

const IMPLEMENTED_TABS: ReadonlySet<TabLabel> = new Set(['Dashboard']);

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className='py-8 text-center'>
      <h3 className='text-foreground text-sm font-semibold'>{label}</h3>
      <p className='text-muted-foreground mt-1 text-xs'>Coming soon</p>
    </div>
  );
}

interface PatientDashboardShellProps {
  patient: LoadState<PatientHeaderModel | null>;
  allergies: LoadState<AllergyRow[]>;
  problems: LoadState<ProblemRow[]>;
  medications: LoadState<MedicationRow[]>;
  prescriptions: LoadState<PrescriptionRow[]>;
  careTeam: LoadState<CareTeamRow[]>;
  encounters: LoadState<EncounterRow[]>;
  immunizations: LoadState<ImmunizationRow[]>;
  vitals: LoadState<VitalRow[]>;
}

export function PatientDashboardShell({
  patient,
  allergies,
  problems,
  medications,
  prescriptions,
  careTeam,
  encounters,
  immunizations,
  vitals,
}: PatientDashboardShellProps) {
  const patientName =
    patient.status === 'success' && patient.data ? patient.data.displayName : null;

  const encounterCount = encounters.status === 'success' ? encounters.data.length : null;
  const [activeTab, setActiveTab] = useState<TabLabel>('Dashboard');

  return (
    <div className='space-y-4'>
      <PatientHeader state={patient} encounterCount={encounterCount} />

      <div>
        <h2 className='text-foreground text-base font-semibold'>
          Medical Record Dashboard{patientName ? ` - ${patientName}` : ''}
        </h2>
        <nav aria-label='Dashboard tabs' className='border-border mt-1 border-b'>
          <ul className='flex text-xs'>
            {TAB_LABELS.map((label) => (
              <li key={label}>
                <button
                  type='button'
                  onClick={() => setActiveTab(label)}
                  className={
                    label === activeTab
                      ? 'border-primary text-primary inline-block border-b-2 px-3 py-1 font-semibold'
                      : 'text-muted-foreground inline-block px-3 py-1 hover:text-foreground'
                  }
                  aria-current={label === activeTab ? 'page' : undefined}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {activeTab === 'Dashboard' ? (
        <>
          <div className='grid grid-cols-1 gap-x-6 md:grid-cols-3'>
            <AllergiesCard state={allergies} />
            <ProblemListCard state={problems} />
            <MedicationsCard state={medications} />
          </div>

          <PrescriptionsCard state={prescriptions} />
          <VitalsCard state={vitals} />
          <ImmunizationsCard state={immunizations} />
          <CareTeamCard state={careTeam} />
          <EncountersCard state={encounters} />
        </>
      ) : !IMPLEMENTED_TABS.has(activeTab) ? (
        <ComingSoonTab label={activeTab} />
      ) : null}
    </div>
  );
}
