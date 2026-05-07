import { AllergiesCard } from './AllergiesCard';
import { CareTeamCard } from './CareTeamCard';
import { ClinicalCard } from './ClinicalCard';
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
  return (
    <div className='space-y-6'>
      <div className='bg-background/95 sticky top-16 z-10 pb-2 backdrop-blur'>
        <PatientHeader state={patient} />
      </div>
      <section aria-labelledby='clinical-overview-title' className='space-y-3'>
        <div>
          <h2 id='clinical-overview-title' className='text-lg font-semibold tracking-tight'>
            Clinical overview
          </h2>
          <p className='text-muted-foreground text-sm'>
            Core chart sections load independently from OpenEMR-backed FHIR resources.
          </p>
        </div>
        <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
          <AllergiesCard state={allergies} />
          <ProblemListCard state={problems} />
          <MedicationsCard state={medications} />
          <PrescriptionsCard state={prescriptions} />
          <CareTeamCard state={careTeam} />
        </div>
      </section>
      <section aria-labelledby='encounter-history-title'>
        <ClinicalCard
          title='Encounter History'
          titleId='encounter-history-title'
          description='Recent encounters from FHIR.'
          state={encounters}
          emptyMessage='No encounters recorded.'
          renderRow={(encounter) => (
            <div className='space-y-2'>
              <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                <h3 className='font-medium'>{encounter.type}</h3>
                <span className='text-muted-foreground text-sm'>{encounter.status}</span>
              </div>
              <dl className='text-muted-foreground grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3'>
                <EncounterFact label='Class' value={encounter.classLabel} />
                <EncounterFact label='Start' value={encounter.start} />
                <EncounterFact label='End' value={encounter.end} />
                <EncounterFact label='Location' value={encounter.location} />
                <EncounterFact label='Participant' value={encounter.participant} />
              </dl>
            </div>
          )}
        />
      </section>
    </div>
  );
}

function EncounterFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='font-medium text-foreground'>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
