import { useState } from 'react';
import { AllergiesCard } from './AllergiesCard';
import { ProvenanceBadge } from './ProvenanceBadge';
import { AppointmentsCard } from './AppointmentsCard';
import { CarePlansCard } from './CarePlansCard';
import { CareTeamCard } from './CareTeamCard';
import { DevicesCard } from './DevicesCard';
import { DiagnosticReportsCard } from './DiagnosticReportsCard';
import { DocumentsCard } from './DocumentsCard';
import { EncountersCard } from './EncountersCard';
import { FamilyHistoryCard } from './FamilyHistoryCard';
import { GoalsCard } from './GoalsCard';
import { ImmunizationsCard } from './ImmunizationsCard';
import { InsuranceCard } from './InsuranceCard';
import { LabResultsCard } from './LabResultsCard';
import { MedicationsCard } from './MedicationsCard';
import { PatientHeader } from './PatientHeader';
import { PrescriptionsCard } from './PrescriptionsCard';
import { ProblemListCard } from './ProblemListCard';
import { ProceduresCard } from './ProceduresCard';
import { RelatedPersonsCard } from './RelatedPersonsCard';
import { ServiceRequestsCard } from './ServiceRequestsCard';
import { SocialHistoryCard } from './SocialHistoryCard';
import { VitalsCard } from './VitalsCard';
import type {
  AllergyRow,
  AppointmentRow,
  CarePlanRow,
  CareTeamRow,
  CoverageRow,
  DeviceRow,
  DiagnosticReportRow,
  DocumentRow,
  EncounterRow,
  FamilyHistoryRow,
  GoalRow,
  ImmunizationRow,
  LabRow,
  LoadState,
  MedicationRow,
  PatientHeaderModel,
  PrescriptionRow,
  ProblemRow,
  ProcedureRow,
  ProvenanceRecord,
  RelatedPersonRow,
  ServiceRequestRow,
  SocialHistoryRow,
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
  labs: LoadState<LabRow[]>;
  procedures: LoadState<ProcedureRow[]>;
  documents: LoadState<DocumentRow[]>;
  coverage: LoadState<CoverageRow[]>;
  diagnosticReports: LoadState<DiagnosticReportRow[]>;
  goals: LoadState<GoalRow[]>;
  carePlans: LoadState<CarePlanRow[]>;
  socialHistory: LoadState<SocialHistoryRow[]>;
  familyHistory: LoadState<FamilyHistoryRow[]>;
  appointments: LoadState<AppointmentRow[]>;
  devices: LoadState<DeviceRow[]>;
  serviceRequests: LoadState<ServiceRequestRow[]>;
  relatedPersons: LoadState<RelatedPersonRow[]>;
  provenance: LoadState<ProvenanceRecord[]>;
  patientId?: string;
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
  labs,
  procedures,
  documents,
  coverage,
  diagnosticReports,
  goals,
  carePlans,
  socialHistory,
  familyHistory,
  appointments,
  devices,
  serviceRequests,
  relatedPersons,
  provenance,
  patientId,
}: PatientDashboardShellProps) {
  const provenanceRecords = provenance.status === 'success' ? provenance.data : [];
  const badge = (resourceType: string) =>
    provenanceRecords.length > 0 ? (
      <ProvenanceBadge records={provenanceRecords} resourceType={resourceType} />
    ) : undefined;
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
            <AllergiesCard
              state={allergies}
              patientId={patientId}
              provenanceBadge={badge('AllergyIntolerance')}
            />
            <ProblemListCard
              state={problems}
              patientId={patientId}
              provenanceBadge={badge('Condition')}
            />
            <MedicationsCard state={medications} provenanceBadge={badge('MedicationRequest')} />
          </div>

          <PrescriptionsCard state={prescriptions} provenanceBadge={badge('MedicationRequest')} />
          <VitalsCard state={vitals} provenanceBadge={badge('Observation')} />
          <LabResultsCard state={labs} provenanceBadge={badge('Observation')} />
          <ImmunizationsCard state={immunizations} provenanceBadge={badge('Immunization')} />
          <InsuranceCard state={coverage} provenanceBadge={badge('Coverage')} />
          <CareTeamCard state={careTeam} provenanceBadge={badge('CareTeam')} />
          <EncountersCard state={encounters} provenanceBadge={badge('Encounter')} />
          <GoalsCard state={goals} provenanceBadge={badge('Goal')} />
          <CarePlansCard state={carePlans} provenanceBadge={badge('CarePlan')} />
          <AppointmentsCard
            state={appointments}
            patientId={patientId}
            provenanceBadge={badge('Appointment')}
          />
          <SocialHistoryCard state={socialHistory} provenanceBadge={badge('Observation')} />
          <FamilyHistoryCard state={familyHistory} provenanceBadge={badge('FamilyMemberHistory')} />
          <DevicesCard state={devices} provenanceBadge={badge('Device')} />
          <ServiceRequestsCard state={serviceRequests} provenanceBadge={badge('ServiceRequest')} />
          <RelatedPersonsCard state={relatedPersons} provenanceBadge={badge('RelatedPerson')} />
        </>
      ) : activeTab === 'History' ? (
        <ProceduresCard state={procedures} provenanceBadge={badge('Procedure')} />
      ) : activeTab === 'Assessments' ? (
        <DiagnosticReportsCard
          state={diagnosticReports}
          provenanceBadge={badge('DiagnosticReport')}
        />
      ) : activeTab === 'Report' ? (
        <DiagnosticReportsCard
          state={diagnosticReports}
          provenanceBadge={badge('DiagnosticReport')}
        />
      ) : activeTab === 'Documents' ? (
        <DocumentsCard state={documents} provenanceBadge={badge('DocumentReference')} />
      ) : activeTab === 'Transactions' ? (
        <EncountersCard state={encounters} provenanceBadge={badge('Encounter')} />
      ) : activeTab === 'Issues' ? (
        <ProblemListCard state={problems} provenanceBadge={badge('Condition')} />
      ) : activeTab === 'Ledger' ? (
        <InsuranceCard state={coverage} provenanceBadge={badge('Coverage')} />
      ) : activeTab === 'External Data' ? (
        <DocumentsCard state={documents} provenanceBadge={badge('DocumentReference')} />
      ) : null}
    </div>
  );
}
