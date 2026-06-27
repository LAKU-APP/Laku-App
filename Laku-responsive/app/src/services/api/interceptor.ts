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

/** Error dari backend — bawa status HTTP & `code` (lihat docs/API.md §10) agar pemanggil bisa membedakan kasus (mis. 401 → sesi habis). */
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Parse JSON; lempar ApiError dengan pesan dari backend bila status non-2xx. */
export async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? `Request gagal (${res.status})`;
    const code = (data as { code?: string })?.code;
    throw new ApiError(message, res.status, code);
  }
  return data as T;
}
