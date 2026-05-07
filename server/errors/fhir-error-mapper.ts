import axios from 'axios';
import { apiErrorCodes, createApiErrorResponse, type ApiErrorResponse } from './api-errors';

function responseStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: unknown } }).response;
    return typeof response?.status === 'number' ? response.status : undefined;
  }

  return undefined;
}

export function mapFhirError(error: unknown): ApiErrorResponse {
  const status = responseStatus(error);

  if (status === 401) {
    return createApiErrorResponse(401, apiErrorCodes.upstreamAuthFailed);
  }

  if (status === 403) {
    return createApiErrorResponse(403, apiErrorCodes.forbidden);
  }

  if (status === 404) {
    return createApiErrorResponse(404, apiErrorCodes.notFound);
  }

  if (status === 400) {
    return createApiErrorResponse(400, apiErrorCodes.badFhirRequest);
  }

  if (status === 429 || status === undefined || status >= 500) {
    return createApiErrorResponse(502, apiErrorCodes.fhirUnavailable);
  }

  return createApiErrorResponse(502, apiErrorCodes.fhirUnavailable);
}
