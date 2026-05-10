import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { PatientHeader } from './PatientHeader';
import type { LoadState, PatientHeaderModel } from '../types';

const patient: PatientHeaderModel = {
  id: 'patient-1',
  displayName: 'Ada Lovelace',
  birthDateLabel: 'April 5, 1980',
  ageLabel: '46',
  sexLabel: 'Female',
  mrnLabel: 'MRN-123',
  activeStatusLabel: 'Active',
  activeStatusDescription: 'Active patient record',
  isActive: true,
  searchText: 'ada lovelace',
};

function render(state: LoadState<PatientHeaderModel | null>, encounterCount?: number | null) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <PatientHeader state={state} encounterCount={encounterCount} />
    </MemoryRouter>,
  );
}

describe('PatientHeader', () => {
  test('renders core patient identity fields', () => {
    const html = render({ status: 'success', data: patient, isEmpty: false });

    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('DOB: April 5, 1980 Age: 46');
    expect(html).not.toContain('Female');
    expect(html).toContain('MRN-123');
    expect(html).toContain('Active');
  });

  test('renders inactive and unknown status text without relying on color', () => {
    expect(
      render({
        status: 'success',
        data: {
          ...patient,
          activeStatusLabel: 'Inactive',
          activeStatusDescription: 'Inactive patient record',
          isActive: false,
        },
        isEmpty: false,
      }),
    ).toContain('Inactive');
    expect(
      render({
        status: 'success',
        data: {
          ...patient,
          activeStatusLabel: 'Unknown',
          activeStatusDescription: 'Active status not recorded',
          isActive: null,
        },
        isEmpty: false,
      }),
    ).toContain('Unknown');
  });

  test('renders loading and error states', () => {
    expect(render({ status: 'loading' })).toContain('Loading patient identity...');
    expect(
      render({
        status: 'error',
        error: {
          status: 404,
          message: 'Patient data was not found.',
          authRequired: false,
        },
      }),
    ).toContain('Patient was not found.');
  });

  test('renders dismiss link back to patient list', () => {
    const html = render({ status: 'success', data: patient, isEmpty: false });
    expect(html).toContain('×');
    expect(html).toContain('/patients');
    expect(html).toContain('Close patient dashboard');
  });

  test('renders Select Encounter with count when encounterCount is provided', () => {
    const html = render({ status: 'success', data: patient, isEmpty: false }, 3);
    expect(html).toContain('Select Encounter (3)');
    expect(html).toContain('Open Encounter: None');
  });

  test('hides Select Encounter and shows dash when encounterCount is null', () => {
    const html = render({ status: 'success', data: patient, isEmpty: false }, null);
    expect(html).not.toContain('Select Encounter');
    expect(html).toContain('Open Encounter: —');
  });

  test('renders Select Encounter (0) when encounterCount is zero', () => {
    const html = render({ status: 'success', data: patient, isEmpty: false }, 0);
    expect(html).toContain('Select Encounter (0)');
    expect(html).toContain('Open Encounter: None');
  });
});
