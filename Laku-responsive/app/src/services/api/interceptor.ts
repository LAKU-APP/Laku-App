// Helper request/response untuk apiClient: sisipkan token & normalisasi error.
import { STORAGE_KEYS } from '@/constants/storageKeys';

/** Gabungkan header default + Authorization (bila ada token tersimpan). */
export function withAuthHeaders(headers?: HeadersInit): HeadersInit {
  let token: string | null = null;
  try { token = localStorage.getItem(STORAGE_KEYS.token); } catch { token = null; }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

/** Parse JSON; lempar Error dengan pesan dari backend bila status non-2xx. */
export async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? `Request gagal (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}
