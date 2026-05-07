import { apiFetch } from './http';

export async function logout(): Promise<void> {
  await apiFetch('/api/logout', { method: 'POST' });
}
