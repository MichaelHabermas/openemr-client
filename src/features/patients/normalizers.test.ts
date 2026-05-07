import { describe, expect, test } from 'bun:test';

import {
  bundleEntriesOf,
  displayCodeableConcept,
  displayReference,
  normalizeClinicalBundle,
  normalizeEncounter,
  normalizePatientHeader,
  normalizePatientSummaries,
  normalizePatientSummary,
} from './normalizers';

describe('FHIR bundle guards', () => {
  test('bundleEntriesOf safely ignores invalid bundles and wrong resources', () => {
    expect(bundleEntriesOf(null, 'Patient')).toEqual([]);
    expect(bundleEntriesOf({ resourceType: 'Patient' }, 'Patient')).toEqual([]);
    expect(bundleEntriesOf({ resourceType: 'Bundle' }, 'Patient')).toEqual([]);
    expect(
      bundleEntriesOf(
        {
          resourceType: 'Bundle',
          entry: [
            {},
            { resource: { resourceType: 'Condition', id: 'problem-1' } },
            { resource: { resourceType: 'Patient', id: 'patient-1' } },
          ],
        },
        'Patient',
      ),
    ).toEqual([{ resourceType: 'Patient', id: 'patient-1' } as { resourceType: string }]);
  });

  test('normalizePatientSummaries returns render-ready summaries from unknown input', () => {
    expect(
      normalizePatientSummaries({
        resourceType: 'Bundle',
        entry: [{ resource: { resourceType: 'Patient', id: 'patient-1', active: true } }],
      }),
    ).toEqual([
      {
        id: 'patient-1',
        displayName: 'patient-1',
        birthDateLabel: 'Not recorded',
        sexLabel: 'Not recorded',
        mrnLabel: 'No MRN',
        activeStatusLabel: 'Active',
        isActive: true,
        searchText: 'patient-1 not recorded no mrn active',
      },
    ]);
  });
});

describe('patient normalization', () => {
  test('patient identity uses explicit FHIR fields and MRN identifier', () => {
    const patient = normalizePatientHeader({
      resourceType: 'Patient',
      id: 'patient-1',
      active: false,
      birthDate: '1980-04-05',
      gender: 'female',
      identifier: [
        { system: 'other', value: 'ALT-1' },
        { system: 'urn:openemr:mrn', value: 'MRN-123' },
      ],
      name: [{ given: ['Ada'], family: 'Lovelace' }],
    });

    expect(patient).toMatchObject({
      id: 'patient-1',
      displayName: 'Ada Lovelace',
      sexLabel: 'Female',
      birthDateLabel: '4/5/1980',
      mrnLabel: 'MRN-123',
      activeStatusLabel: 'Inactive',
      activeStatusDescription: 'Inactive patient record',
      isActive: false,
    });
  });

  test('patient name fallback order uses text, given/family, id, then Patient', () => {
    expect(
      normalizePatientSummary({
        resourceType: 'Patient',
        id: 'patient-1',
        name: [{ text: 'Legal Patient Name', given: ['Ignored'], family: 'Ignored' }],
      })?.displayName,
    ).toBe('Legal Patient Name');
    expect(
      normalizePatientSummary({
        resourceType: 'Patient',
        id: 'patient-2',
        name: [{ given: ['Grace'], family: 'Hopper' }],
      })?.displayName,
    ).toBe('Grace Hopper');
    expect(normalizePatientSummary({ resourceType: 'Patient', id: 'patient-3' })?.displayName).toBe(
      'patient-3',
    );
    expect(normalizePatientSummary({ resourceType: 'Patient' })?.displayName).toBe('Patient');
  });

  test('malformed patient optional fields do not throw and render fallbacks', () => {
    expect(() =>
      normalizePatientSummary({
        resourceType: 'Patient',
        name: [{ given: [123], family: false }],
        identifier: [{ value: 7 }],
      }),
    ).not.toThrow();
    expect(
      normalizePatientSummary({
        resourceType: 'Patient',
        name: [{ given: [123], family: false }],
        identifier: [{ value: 7 }],
      }),
    ).toMatchObject({
      displayName: 'Patient',
      birthDateLabel: 'Not recorded',
      sexLabel: 'Not recorded',
      mrnLabel: 'No MRN',
      activeStatusLabel: 'Unknown',
    });
  });

  test('patient search text includes hidden names and all identifiers', () => {
    const summary = normalizePatientSummary({
      resourceType: 'Patient',
      id: 'patient-4',
      active: true,
      birthDate: '1970-01-02',
      gender: 'male',
      identifier: [
        { system: 'urn:openemr:mrn', value: 'MRN-444' },
        { system: 'urn:openemr:account', value: 'ALT-888' },
      ],
      name: [{ text: 'Display Name', given: ['Hidden'], family: 'Family' }],
    });

    expect(summary?.searchText).toContain('patient-4');
    expect(summary?.searchText).toContain('display name');
    expect(summary?.searchText).toContain('hidden');
    expect(summary?.searchText).toContain('family');
    expect(summary?.searchText).toContain('1970-01-02');
    expect(summary?.searchText).toContain('male');
    expect(summary?.searchText).toContain('mrn-444');
    expect(summary?.searchText).toContain('alt-888');
    expect(summary?.searchText).toContain('active');
  });

  test('normalizePatientHeader returns null for non-patient input', () => {
    expect(normalizePatientHeader(null)).toBeNull();
    expect(normalizePatientHeader({ resourceType: 'Condition' })).toBeNull();
  });

  test('patient active status descriptions cover true false and unknown', () => {
    expect(
      normalizePatientHeader({ resourceType: 'Patient', id: 'active', active: true }),
    ).toMatchObject({
      activeStatusLabel: 'Active',
      activeStatusDescription: 'Active patient record',
    });
    expect(
      normalizePatientHeader({ resourceType: 'Patient', id: 'inactive', active: false }),
    ).toMatchObject({
      activeStatusLabel: 'Inactive',
      activeStatusDescription: 'Inactive patient record',
    });
    expect(normalizePatientHeader({ resourceType: 'Patient', id: 'unknown' })).toMatchObject({
      activeStatusLabel: 'Unknown',
      activeStatusDescription: 'Active status not recorded',
    });
  });
});

describe('clinical normalization', () => {
  test('coding and reference helpers use safe fallback chains', () => {
    expect(displayCodeableConcept({ text: 'Display text', coding: [{ display: 'Ignored' }] })).toBe(
      'Display text',
    );
    expect(displayCodeableConcept({ coding: [{ display: 'Coding display' }] })).toBe(
      'Coding display',
    );
    expect(displayCodeableConcept({ coding: [{ code: 'code-only' }] })).toBe('code-only');
    expect(displayCodeableConcept({})).toBe('Unknown');
    expect(displayReference({ display: 'Dr. Who', reference: 'Practitioner/1' })).toBe('Dr. Who');
    expect(displayReference({ reference: 'Practitioner/1' })).toBe('Practitioner/1');
  });

  test('normalizers tolerate sparse clinical resources', () => {
    const allergies = normalizeClinicalBundle.allergies({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'AllergyIntolerance', id: 'a1' } }],
    });
    const problems = normalizeClinicalBundle.problems({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Condition', id: 'c1' } }],
    });
    const medications = normalizeClinicalBundle.medications({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'MedicationRequest', id: 'm1' } }],
    });
    const prescriptions = normalizeClinicalBundle.prescriptions({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'MedicationRequest', id: 'rx1' } }],
    });
    const careTeam = normalizeClinicalBundle.careTeam({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'CareTeam', id: 'team1' } }],
    });

    expect(allergies[0]).toMatchObject({ substance: 'Unknown', hasPartialData: true });
    expect(problems[0]).toMatchObject({
      name: 'Unknown',
      clinicalStatus: 'Unknown',
      isActive: false,
      hasPartialData: true,
    });
    expect(medications[0]).toMatchObject({ name: 'Unknown', hasPartialData: true });
    expect(prescriptions[0]).toMatchObject({
      name: 'Unknown',
      intent: 'Unknown',
      hasPartialData: true,
    });
    expect(careTeam[0]).toMatchObject({ name: 'Not recorded', hasPartialData: true });
  });

  test('medication and prescription models stay semantically separate', () => {
    const medicationRequest = {
      resourceType: 'Bundle',
      entry: [
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'med-1',
            status: 'active',
            intent: 'order',
            authoredOn: '2026-05-01',
            medicationCodeableConcept: { text: 'Atorvastatin 20 mg' },
            dosageInstruction: [{ text: 'Take once daily' }],
            requester: { display: 'Dr. Clinician' },
          },
        },
      ],
    };

    expect(normalizeClinicalBundle.medications(medicationRequest)[0]).toMatchObject({
      id: 'med-1',
      name: 'Atorvastatin 20 mg',
      status: 'Active',
      dosage: 'Take once daily',
      prescriber: 'Dr. Clinician',
    });
    expect(normalizeClinicalBundle.prescriptions(medicationRequest)[0]).toMatchObject({
      id: 'med-1',
      name: 'Atorvastatin 20 mg',
      status: 'Active',
      intent: 'Order',
      dosage: 'Take once daily',
      prescriber: 'Dr. Clinician',
    });
  });

  test('encounters sort reverse chronologically when dates exist', () => {
    const rows = normalizeClinicalBundle.encounters({
      resourceType: 'Bundle',
      entry: [
        { resource: { resourceType: 'Encounter', id: 'older', period: { start: '2024-01-01' } } },
        { resource: { resourceType: 'Encounter', id: 'newer', period: { start: '2025-01-01' } } },
      ],
    });

    expect(rows.map((row) => row.id)).toEqual(['newer', 'older']);
  });

  test('problem active flag only applies to meaningful non-resolved statuses', () => {
    expect(
      normalizeClinicalBundle
        .problems({
          resourceType: 'Bundle',
          entry: [
            {
              resource: {
                resourceType: 'Condition',
                id: 'active',
                clinicalStatus: { text: 'active' },
              },
            },
            {
              resource: {
                resourceType: 'Condition',
                id: 'resolved',
                clinicalStatus: { text: 'resolved' },
              },
            },
            { resource: { resourceType: 'Condition', id: 'unknown' } },
          ],
        })
        .map((row) => ({ id: row.id, isActive: row.isActive })),
    ).toEqual([
      { id: 'active', isActive: true },
      { id: 'resolved', isActive: false },
      { id: 'unknown', isActive: false },
    ]);
  });

  test('encounter normalization preserves type and class separately', () => {
    expect(
      normalizeEncounter({
        resourceType: 'Encounter',
        id: 'enc-1',
        class: { code: 'AMB', display: 'Ambulatory' },
        type: [{ text: 'Office Visit' }],
        period: { start: '2026-05-01' },
      }),
    ).toMatchObject({
      type: 'Office Visit',
      classLabel: 'Ambulatory',
      start: '5/1/2026',
    });
  });

  test('normalizeEncounter handles malformed optional fields without throwing', () => {
    expect(() =>
      normalizeEncounter({
        resourceType: 'Encounter',
        id: 'enc-1',
        period: { start: 'not-a-date' },
        type: [{ coding: [{ code: 'AMB' }] }],
      }),
    ).not.toThrow();
    expect(
      normalizeEncounter({
        resourceType: 'Encounter',
        id: 'enc-1',
        period: { start: 'not-a-date' },
        type: [{ coding: [{ code: 'AMB' }] }],
      }),
    ).toMatchObject({
      id: 'enc-1',
      type: 'AMB',
      start: 'not-a-date',
    });
  });
});
