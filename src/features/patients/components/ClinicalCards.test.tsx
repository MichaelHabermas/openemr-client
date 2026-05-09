import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { AllergiesCard } from './AllergiesCard';
import { CareTeamCard } from './CareTeamCard';
import { ClinicalSection } from './ClinicalSection';
import { MedicationsCard } from './MedicationsCard';
import { PatientDashboardShell } from './PatientDashboardShell';
import { PatientListItem } from './PatientListItem';
import { PatientPicker } from './PatientPicker';
import { PrescriptionsCard } from './PrescriptionsCard';
import { ProblemListCard } from './ProblemListCard';
import type {
  AllergyRow,
  CareTeamRow,
  EncounterRow,
  LoadState,
  MedicationRow,
  PatientSummary,
  PrescriptionRow,
} from '../types';

interface TestRow {
  id: string;
  hasPartialData: boolean;
}

describe('ClinicalSection', () => {
  test('renders loading empty error and partial states', () => {
    expect(
      renderToStaticMarkup(
        <ClinicalSection<TestRow>
          title='Test'
          state={{ status: 'loading' }}
          emptyMessage='No rows.'
          renderRow={(row) => row.id}
        />,
      ),
    ).toContain('Loading');

    expect(
      renderToStaticMarkup(
        <ClinicalSection<TestRow>
          title='Test'
          state={{ status: 'success', data: [], isEmpty: true }}
          emptyMessage='No rows.'
          renderRow={(row) => row.id}
        />,
      ),
    ).toContain('No rows.');

    expect(
      renderToStaticMarkup(
        <ClinicalSection<TestRow>
          title='Test'
          state={{
            status: 'error',
            error: { status: 502, message: 'Could not load.', authRequired: false },
          }}
          emptyMessage='No rows.'
          renderRow={(row) => row.id}
        />,
      ),
    ).toContain('Could not load.');

    expect(
      renderToStaticMarkup(
        <ClinicalSection<TestRow>
          title='Test'
          state={{
            status: 'success',
            data: [{ id: 'row-1', hasPartialData: true }],
            isEmpty: false,
          }}
          emptyMessage='No rows.'
          renderRow={(row) => row.id}
        />,
      ),
    ).toContain('Partial data');
  });
});

describe('clinical section cards', () => {
  test('renders allergy fields', () => {
    const html = renderToStaticMarkup(
      <AllergiesCard
        state={{
          status: 'success',
          isEmpty: false,
          data: [
            {
              id: 'a1',
              substance: 'Penicillin',
              clinicalStatus: 'Active',
              verificationStatus: 'Confirmed',
              reaction: 'Rash',
              severity: 'Moderate',
              recordedDate: 'May 1, 2026',
              hasPartialData: false,
            },
          ],
        }}
      />,
    );

    expect(html).toContain('Penicillin');
    expect(html).toContain('Moderate');
  });

  test('renders problem fields', () => {
    const html = renderToStaticMarkup(
      <ProblemListCard
        state={{
          status: 'success',
          isEmpty: false,
          data: [
            {
              id: 'p1',
              name: 'Hypertension',
              clinicalStatus: 'Active',
              verificationStatus: 'Confirmed',
              dateLabel: 'May 1, 2026',
              category: 'Problem-list-item',
              isActive: true,
              hasPartialData: false,
            },
          ],
        }}
      />,
    );

    expect(html).toContain('Hypertension');
  });

  test('renders medication and prescription as distinct cards', () => {
    const medicationHtml = renderToStaticMarkup(
      <MedicationsCard
        state={{
          status: 'success',
          isEmpty: false,
          data: [
            {
              id: 'm1',
              name: 'Atorvastatin',
              status: 'Active',
              dosage: 'Take daily',
              dateLabel: 'May 1, 2026',
              prescriber: 'Dr. Clinician',
              hasPartialData: false,
            },
          ],
        }}
      />,
    );
    const prescriptionHtml = renderToStaticMarkup(
      <PrescriptionsCard
        state={{
          status: 'success',
          isEmpty: false,
          data: [
            {
              id: 'rx1',
              name: 'Atorvastatin',
              status: 'Active',
              intent: 'Order',
              authoredDate: 'May 1, 2026',
              dosage: 'Take daily',
              prescriber: 'Dr. Clinician',
              hasPartialData: false,
            },
          ],
        }}
      />,
    );

    expect(medicationHtml).toContain('Medications');
    expect(medicationHtml).not.toContain('Intent');
    expect(prescriptionHtml).toContain('Prescriptions');
    expect(prescriptionHtml).toContain('Filled');
  });

  test('renders care team fields', () => {
    const html = renderToStaticMarkup(
      <CareTeamCard
        state={{
          status: 'success',
          isEmpty: false,
          data: [
            {
              id: 'ct1',
              name: 'Dr. Clinician',
              role: 'Primary care provider',
              status: 'Active',
              reference: 'Practitioner/1',
              hasPartialData: false,
            },
          ],
        }}
      />,
    );

    expect(html).toContain('Dr. Clinician');
    expect(html).toContain('Primary care provider');
    expect(html).toContain('Member');
  });
});

describe('patient picker rendering', () => {
  const patient: PatientSummary = {
    id: 'patient/id with spaces',
    displayName: 'Ada Lovelace',
    birthDateLabel: '4/5/1980',
    sexLabel: 'Female',
    mrnLabel: 'MRN-123',
    activeStatusLabel: 'Active',
    isActive: true,
    searchText: 'ada lovelace mrn-123 active',
  };

  test('renders search field, result count, and encoded patient link', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PatientPicker state={{ status: 'success', data: [patient], isEmpty: false }} />
      </MemoryRouter>,
    );

    expect(html).toContain('Search patients');
    expect(html).toContain('1 patient available.');
    expect(html).toContain('/patients/patient%2Fid%20with%20spaces');
    expect(html).toContain('Ada Lovelace');
  });

  test('patient row accessible label distinguishes patient identity', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PatientListItem patient={patient} />
      </MemoryRouter>,
    );

    expect(html).toContain('Open dashboard for Ada Lovelace');
    expect(html).toContain('DOB 4/5/1980');
    expect(html).toContain('MRN MRN-123');
  });
});

describe('PatientDashboardShell', () => {
  test('keeps successful cards visible when one card errors', () => {
    const html = renderToStaticMarkup(
      <PatientDashboardShell
        patient={success({
          id: 'patient-1',
          displayName: 'Ada Lovelace',
          birthDateLabel: '4/5/1980',
          sexLabel: 'Female',
          mrnLabel: 'MRN-123',
          activeStatusLabel: 'Active',
          activeStatusDescription: 'Active patient record',
          isActive: true,
          searchText: 'ada lovelace',
        })}
        allergies={success<AllergyRow[]>([
          {
            id: 'a1',
            substance: 'Penicillin',
            clinicalStatus: 'Active',
            verificationStatus: 'Confirmed',
            reaction: 'Rash',
            severity: 'Moderate',
            recordedDate: '5/1/2026',
            hasPartialData: false,
          },
        ])}
        problems={{
          status: 'error',
          error: { status: 502, message: 'Problems unavailable.', authRequired: false },
        }}
        medications={success<MedicationRow[]>([])}
        prescriptions={success<PrescriptionRow[]>([])}
        careTeam={success<CareTeamRow[]>([])}
        encounters={success<EncounterRow[]>([
          {
            id: 'e1',
            type: 'Office Visit',
            classLabel: 'Ambulatory',
            status: 'Finished',
            start: '5/1/2026',
            end: 'Not recorded',
            location: 'Clinic',
            participant: 'Dr. Clinician',
            sortTime: 1,
            hasPartialData: false,
          },
        ])}
      />,
    );

    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('Penicillin');
    expect(html).toContain('Problems unavailable.');
    expect(html).toContain('Office Visit');
    expect(html).toContain('Ambulatory');
  });
});

function success<T>(data: T): LoadState<T> {
  return { status: 'success', data, isEmpty: Array.isArray(data) && data.length === 0 };
}
