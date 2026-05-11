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

export class MedicationCatalogApiError extends Error {
  readonly authRequired: boolean;
  readonly code?: string;

  constructor(
    message: string,
    readonly status: number,
    code?: string,
  ) {
    super(message);
    this.name = 'MedicationCatalogApiError';
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
        : 'Medication catalog could not be loaded.';
    throw new MedicationCatalogApiError(message, res.status, code);
  }
  return res.json() as Promise<unknown>;
}

export function fetchMedicationsCatalog(): Promise<unknown> {
  return getJson('/api/medications-catalog');
}
