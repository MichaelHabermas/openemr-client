import { describe, expect, test } from 'bun:test';

import { filterPatients } from './patient-search';
import type { PatientSummary } from './types';

const patients: PatientSummary[] = [
  {
    id: 'patient-1',
    displayName: 'Ada Lovelace',
    birthDateLabel: 'April 5, 1980',
    sexLabel: 'Female',
    mrnLabel: 'MRN-123',
    activeStatusLabel: 'Active',
    isActive: true,
    searchText: 'patient-1 ada lovelace 1980-04-05 april 5 1980 female mrn-123 alt-777 active',
  },
  {
    id: 'patient-2',
    displayName: 'Grace Hopper',
    birthDateLabel: 'Not recorded',
    sexLabel: 'Not recorded',
    mrnLabel: 'No MRN',
    activeStatusLabel: 'Inactive',
    isActive: false,
    searchText: 'patient-2 grace hopper not recorded no mrn inactive',
  },
];

describe('filterPatients', () => {
  test('empty query returns all patients', () => {
    expect(filterPatients(patients, '')).toEqual(patients);
    expect(filterPatients(patients, '   ')).toEqual(patients);
  });

  test('matches case-insensitive names', () => {
    expect(filterPatients(patients, 'ADA')).toEqual([patients[0]]);
  });

  test('matches multiple tokens across fields', () => {
    expect(filterPatients(patients, 'lovelace MRN-123')).toEqual([patients[0]]);
  });

  test('matches DOB, sex, patient id, active status, and identifiers', () => {
    expect(filterPatients(patients, '1980-04-05')).toEqual([patients[0]]);
    expect(filterPatients(patients, 'female')).toEqual([patients[0]]);
    expect(filterPatients(patients, 'patient-2')).toEqual([patients[1]]);
    expect(filterPatients(patients, 'inactive')).toEqual([patients[1]]);
    expect(filterPatients(patients, 'alt-777')).toEqual([patients[0]]);
  });

  test('no match returns an empty list', () => {
    expect(filterPatients(patients, 'missing')).toEqual([]);
  });
});
