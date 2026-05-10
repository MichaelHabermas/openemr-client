import { describe, expect, test } from 'bun:test';
import { mapFhirError } from './fhir-error-mapper';
import { apiErrorCodes } from './api-errors';

function axiosError(status: number) {
  const error = new Error('Request failed') as Error & {
    isAxiosError: boolean;
    response: { status: number };
  };
  error.isAxiosError = true;
  error.response = { status };
  return error;
}

describe('mapFhirError', () => {
  test('maps 401 to upstreamAuthFailed', () => {
    const result = mapFhirError(axiosError(401));
    expect(result.status).toBe(401);
    expect(result.body.error).toBe(apiErrorCodes.upstreamAuthFailed);
  });

  test('maps 403 to forbidden', () => {
    const result = mapFhirError(axiosError(403));
    expect(result.status).toBe(403);
    expect(result.body.error).toBe(apiErrorCodes.forbidden);
  });

  test('maps 404 to notFound', () => {
    const result = mapFhirError(axiosError(404));
    expect(result.status).toBe(404);
    expect(result.body.error).toBe(apiErrorCodes.notFound);
  });

  test('maps 400 to badFhirRequest', () => {
    const result = mapFhirError(axiosError(400));
    expect(result.status).toBe(400);
    expect(result.body.error).toBe(apiErrorCodes.badFhirRequest);
  });

  test('maps 429 to fhirUnavailable with 502', () => {
    const result = mapFhirError(axiosError(429));
    expect(result.status).toBe(502);
    expect(result.body.error).toBe(apiErrorCodes.fhirUnavailable);
  });

  test('maps 500+ to fhirUnavailable with 502', () => {
    const result = mapFhirError(axiosError(500));
    expect(result.status).toBe(502);
    expect(result.body.error).toBe(apiErrorCodes.fhirUnavailable);

    const result503 = mapFhirError(axiosError(503));
    expect(result503.status).toBe(502);
    expect(result503.body.error).toBe(apiErrorCodes.fhirUnavailable);
  });

  test('maps unknown error (no response) to fhirUnavailable', () => {
    const result = mapFhirError(new Error('Network error'));
    expect(result.status).toBe(502);
    expect(result.body.error).toBe(apiErrorCodes.fhirUnavailable);
  });

  test('maps non-standard status to fhirUnavailable', () => {
    const result = mapFhirError(axiosError(418));
    expect(result.status).toBe(502);
    expect(result.body.error).toBe(apiErrorCodes.fhirUnavailable);
  });
});
