const jsonHeaders = { Accept: 'application/json' } as const;

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: { ...jsonHeaders, ...init?.headers },
  });
}
