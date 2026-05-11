import { afterEach, describe, expect, test } from 'bun:test';
import { loadConfig } from './config';

const ENV_KEYS = [
  'OPENEMR_URL',
  'OAUTH_CLIENT_ID',
  'OAUTH_CLIENT_SECRET',
  'REDIRECT_URI',
  'PORT',
  'APP_ORIGIN',
  'OAUTH_SCOPE',
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]])) as Record<
  (typeof ENV_KEYS)[number],
  string | undefined
>;

function resetEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function clearEnv() {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

function setRequiredEnv() {
  process.env.OPENEMR_URL = 'https://openemr.example';
  process.env.OAUTH_CLIENT_ID = 'client-id';
  process.env.OAUTH_CLIENT_SECRET = 'client-secret';
  process.env.REDIRECT_URI = 'http://localhost:5173/callback';
  process.env.APP_ORIGIN = 'http://localhost:5173';
}

afterEach(() => {
  resetEnv();
});

describe('loadConfig', () => {
  test('throws when a required env var is missing', () => {
    clearEnv();
    setRequiredEnv();
    delete process.env.OAUTH_CLIENT_SECRET;

    expect(() => loadConfig()).toThrow(
      'Missing required environment variable: OAUTH_CLIENT_SECRET',
    );
  });

  test('trims one trailing slash from URL values', () => {
    clearEnv();
    setRequiredEnv();
    process.env.OPENEMR_URL = 'https://openemr.example/';
    process.env.APP_ORIGIN = 'http://localhost:5173/';

    const config = loadConfig();

    expect(config.openemrUrl).toBe('https://openemr.example');
    expect(config.appOrigin).toBe('http://localhost:5173');
  });

  test('defaults PORT to 3000', () => {
    clearEnv();
    setRequiredEnv();

    expect(loadConfig().port).toBe(3000);
  });

  test('uses the read-only dashboard OAuth scope by default', () => {
    clearEnv();
    setRequiredEnv();

    expect(loadConfig().oauthScope).toBe(
      'openid api:fhir api:oemr user/Patient.rs user/AllergyIntolerance.rs user/Condition.rs user/MedicationRequest.rs user/CareTeam.rs user/Encounter.rs user/Immunization.rs user/Observation.rs user/Practitioner.rs user/Procedure.rs user/DocumentReference.rs user/Coverage.rs user/DiagnosticReport.rs user/Goal.rs user/CarePlan.rs user/Organization.rs user/PractitionerRole.rs user/Provenance.rs user/Device.rs user/ServiceRequest.rs user/RelatedPerson.rs user/MedicationDispense.rs user/QuestionnaireResponse.rs user/Location.read user/Medication.read user/Appointment.read user/Binary.read user/Person.read user/Group.read',
    );
  });

  test('uses an explicit OAuth scope', () => {
    clearEnv();
    setRequiredEnv();
    process.env.OAUTH_SCOPE = 'openid user/Patient.read';

    expect(loadConfig().oauthScope).toBe('openid user/Patient.read');
  });
});
