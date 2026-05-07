export const apiErrorCodes = {
  badFhirRequest: 'bad_fhir_request',
  fhirUnavailable: 'fhir_unavailable',
  forbidden: 'forbidden',
  notFound: 'not_found',
  notAuthenticated: 'not_authenticated',
  upstreamAuthFailed: 'upstream_auth_failed',
} as const;

export type ApiErrorCode = (typeof apiErrorCodes)[keyof typeof apiErrorCodes];

export interface ApiErrorBody {
  error: ApiErrorCode;
}

export interface ApiErrorResponse {
  status: number;
  body: ApiErrorBody;
}

export function createApiErrorResponse(status: number, code: ApiErrorCode): ApiErrorResponse {
  return {
    status,
    body: { error: code },
  };
}
