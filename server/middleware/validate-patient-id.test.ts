import { describe, expect, it } from 'bun:test';
import type { Request, Response } from 'express';
import { validatePatientId } from './validate-patient-id';
import { apiErrorCodes } from '../errors/api-errors';

function run(patientId?: string) {
  const handler = validatePatientId();
  let nextCalled = false;
  let statusCode: number | undefined;
  let body: unknown;

  const req = { params: patientId !== undefined ? { patientId } : {} } as unknown as Request;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: unknown) {
      body = data;
    },
  } as unknown as Response;

  handler(req, res, () => {
    nextCalled = true;
  });
  return { nextCalled, statusCode, body };
}

describe('validatePatientId', () => {
  it('passes valid alphanumeric IDs', () => {
    const result = run('abc123');
    expect(result.nextCalled).toBe(true);
  });

  it('passes IDs with dots and dashes', () => {
    const result = run('patient-1.0');
    expect(result.nextCalled).toBe(true);
  });

  it('passes when no patientId param exists', () => {
    const result = run(undefined);
    expect(result.nextCalled).toBe(true);
  });

  it('rejects IDs with special characters', () => {
    const result = run('patient<script>');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual({ error: apiErrorCodes.badFhirRequest });
  });

  it('rejects IDs longer than 64 characters', () => {
    const result = run('a'.repeat(65));
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(400);
  });

  it('rejects empty string IDs', () => {
    const result = run('');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual({ error: apiErrorCodes.badFhirRequest });
  });

  it('rejects IDs with spaces', () => {
    const result = run('patient id');
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(400);
  });
});
