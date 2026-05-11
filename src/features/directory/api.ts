import { apiFetch } from '@/lib/api/http';

type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
};

async function safeErrorBody(res: Response): Promise<ApiErrorBody> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return {};

  try {
    const body = (await res.json()) as unknown;
    return body && typeof body === 'object' ? (body as ApiErrorBody) : {};
  } catch {
    return {};
  }
}

export class DirectoryApiError extends Error {
  readonly authRequired: boolean;
  readonly code?: string;

  constructor(
    message: string,
    readonly status: number,
    code?: string,
  ) {
    super(message);
    this.name = 'DirectoryApiError';
    this.code = code;
    this.authRequired = status === 401;
  }
}

async function getJson(path: string): Promise<unknown> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const body = await safeErrorBody(res);
    const code = typeof body.error === 'string' ? body.error : undefined;
    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message
        : 'Directory data could not be loaded.';
    throw new DirectoryApiError(message, res.status, code);
  }
  return res.json() as Promise<unknown>;
}

export function fetchLocations(): Promise<unknown> {
  return getJson('/api/locations');
}

export function fetchOrganizations(): Promise<unknown> {
  return getJson('/api/organizations');
}
