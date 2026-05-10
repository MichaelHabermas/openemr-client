import { describe, expect, test } from 'bun:test';

import {
  bundleEntriesOf,
  displayCodeableConcept,
  displayCoding,
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
      birthDateLabel: '1980-04-05',
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
      entry: [{ resource: { resourceType: 'MedicationRequest', id: 'rx1', intent: 'order' } }],
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
      intent: 'Order',
      hasPartialData: true,
    });
    expect(careTeam[0]).toMatchObject({ name: 'Not recorded', hasPartialData: true });
  });

  test('medication and prescription models stay semantically separate', () => {
    const bundle = {
      resourceType: 'Bundle',
      entry: [
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'med-plan',
            status: 'active',
            intent: 'plan',
            medicationCodeableConcept: { text: 'Lisinopril 10 mg' },
            dosageInstruction: [{ text: 'Take once daily' }],
            requester: { display: 'Dr. PCP' },
          },
        },
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'med-order',
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

    const meds = normalizeClinicalBundle.medications(bundle);
    expect(meds).toHaveLength(1);
    expect(meds[0]).toMatchObject({ id: 'med-plan', name: 'Lisinopril 10 mg' });

    const rxs = normalizeClinicalBundle.prescriptions(bundle);
    expect(rxs).toHaveLength(1);
    expect(rxs[0]).toMatchObject({
      id: 'med-order',
      name: 'Atorvastatin 20 mg',
      intent: 'Order',
    });
  });

  test('medications fall back to all entries when intent is absent', () => {
    const bundle = {
      resourceType: 'Bundle',
      entry: [
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'med-no-intent',
            status: 'active',
            medicationCodeableConcept: { text: 'Aspirin 81 mg' },
          },
        },
      ],
    };

    expect(normalizeClinicalBundle.medications(bundle)).toHaveLength(1);
  });

  test('prescriptions returns empty array when no intent:order entries exist', () => {
    const bundle = {
      resourceType: 'Bundle',
      entry: [
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'med-no-intent',
            status: 'active',
            intent: 'plan',
            medicationCodeableConcept: { text: 'Aspirin 81 mg' },
          },
        },
      ],
    };

    expect(normalizeClinicalBundle.prescriptions(bundle)).toEqual([]);
  });

  test('medications excludes orders and prescriptions excludes non-orders when both exist', () => {
    const bundle = {
      resourceType: 'Bundle',
      entry: [
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'plan-1',
            status: 'active',
            intent: 'plan',
            medicationCodeableConcept: { text: 'Med A' },
          },
        },
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'order-1',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: { text: 'Med B' },
          },
        },
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'plan-2',
            status: 'active',
            intent: 'plan',
            medicationCodeableConcept: { text: 'Med C' },
          },
        },
      ],
    };

    const meds = normalizeClinicalBundle.medications(bundle);
    expect(meds.map((m) => m.id)).toEqual(['plan-1', 'plan-2']);

    const rxs = normalizeClinicalBundle.prescriptions(bundle);
    expect(rxs.map((r) => r.id)).toEqual(['order-1']);
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
      start: '2026-05-01',
    });
  });

  test('displayCoding returns display from a Coding object', () => {
    expect(displayCoding({ display: 'ambulatory', code: 'AMB' })).toBe('ambulatory');
  });

  test('displayCoding falls back to code', () => {
    expect(displayCoding({ code: 'AMB' })).toBe('AMB');
  });

  test('displayCoding falls back to code when display is empty string', () => {
    expect(displayCoding({ display: '', code: 'AMB' })).toBe('AMB');
    expect(displayCoding({ display: '   ', code: 'AMB' })).toBe('AMB');
  });

  test('displayCoding returns fallback for non-object', () => {
    expect(displayCoding(null)).toBe('Unknown');
  });

  test('normalizeEncounter formats datetime strings via toLocaleString', () => {
    const enc = normalizeEncounter({
      resourceType: 'Encounter',
      id: 'enc-dt',
      period: { start: '2024-06-15T14:30:00Z' },
    });
    expect(enc?.start).toBeDefined();
    expect(enc!.start).not.toBe('2024-06-15T14:30:00Z');
    expect(enc!.start).not.toBe('Unknown');
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
