import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { PatientHeader } from './PatientHeader';
import type { LoadState, PatientHeaderModel } from '../types';

const patient: PatientHeaderModel = {
  id: 'patient-1',
  displayName: 'Ada Lovelace',
  birthDateLabel: 'April 5, 1980',
  sexLabel: 'Female',
  mrnLabel: 'MRN-123',
  activeStatusLabel: 'Active',
  activeStatusDescription: 'Active patient record',
  isActive: true,
  searchText: 'ada lovelace',
};

function render(state: LoadState<PatientHeaderModel | null>) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <PatientHeader state={state} />
    </MemoryRouter>,
  );
}

describe('PatientHeader', () => {
  test('renders core patient identity fields', () => {
    const html = render({ status: 'success', data: patient, isEmpty: false });

    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('April 5, 1980');
    expect(html).toContain('Female');
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
});
