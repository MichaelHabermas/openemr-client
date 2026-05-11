import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { PatientFeatureApiError } from '../api';
import { PatientHeader } from './PatientHeader';
import type { PatientHeaderModel } from '../types';

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

type PatientHeaderState = Parameters<typeof PatientHeader>[0]['state'];

function render(state: PatientHeaderState, encounterCount?: number | null) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <PatientHeader state={state} encounterCount={encounterCount} />
    </MemoryRouter>,
  );
}

describe('PatientHeader', () => {
  test('renders core patient identity fields', () => {
    const html = render({ status: 'success', data: patient, error: null });

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
        error: null,
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
        error: null,
      }),
    ).toContain('Unknown');
  });

  test('renders loading and error states', () => {
    expect(render({ status: 'pending', data: undefined, error: null })).toContain(
      'Loading patient identity...',
    );
    expect(
      render({
        status: 'error',
        data: undefined,
        error: new PatientFeatureApiError('Patient data was not found.', 404),
      }),
    ).toContain('Patient was not found.');
  });

  test('renders dismiss link back to patient list', () => {
    const html = render({ status: 'success', data: patient, error: null });
    expect(html).toContain('×');
    expect(html).toContain('/patients');
    expect(html).toContain('Close patient dashboard');
  });

  test('renders Select Encounter with count when encounterCount is provided', () => {
    const html = render({ status: 'success', data: patient, error: null }, 3);
    expect(html).toContain('Select Encounter (3)');
    expect(html).toContain('Open Encounter: None');
  });

  test('hides Select Encounter and shows dash when encounterCount is null', () => {
    const html = render({ status: 'success', data: patient, error: null }, null);
    expect(html).not.toContain('Select Encounter');
    expect(html).toContain('Open Encounter: —');
  });

  test('renders Select Encounter (0) when encounterCount is zero', () => {
    const html = render({ status: 'success', data: patient, error: null }, 0);
    expect(html).toContain('Select Encounter (0)');
    expect(html).toContain('Open Encounter: None');
  });
});
