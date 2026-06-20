// Pembungkus fetch tipis untuk komunikasi dengan backend.
// Dipakai saat endpoint nyata sudah tersedia (lihat docs/API.md).
import { API_BASE_URL } from './endpoints';
import { withAuthHeaders, parseResponse } from './interceptor';

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: withAuthHeaders(options.headers),
  });
  return parseResponse<T>(res);
}
