// ─── Auth API ────────────────────────────────────────────────────────────────
// Semua fungsi di bawah memanggil backend nyata (lihat docs/API.md §1) lewat
// services/api/client.
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string; phone?: string; image?: string; onboardingCompleted: boolean };
}

/** Login ke backend nyata. Identifier saat ini wajib berupa email (lihat docs/API.md §1). */
export async function apiLogin(identifier: string, password: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>(ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ email: identifier.trim(), password }),
  });
}

/** Daftar akun baru ke backend nyata. Backend (docs/API.md §1) baru menerima email, belum nomor HP. */
export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>(ENDPOINTS.register, {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
  });
}

/** Tandai onboarding selesai di backend. Auth lewat token (sudah disisipkan apiClient). */
export async function apiCompleteOnboarding(): Promise<void> {
  await apiClient<unknown>(ENDPOINTS.onboarding, { method: 'PATCH' });
}

// Perbarui email akun (dipanggil dari Pengaturan → Akun) lewat PATCH /auth/profile.
// Validasi keunikan (EMAIL_TAKEN) dilakukan backend.
export async function apiUpdateContact(email: string): Promise<{ email: string }> {
  const nextEmail = email.trim().toLowerCase();
  if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) throw new Error('Format email tidak valid');

  const res = await apiClient<{ user: { email: string } }>(ENDPOINTS.profile, {
    method: 'PATCH',
    body: JSON.stringify({ email: nextEmail || undefined }),
  });
  return { email: res.user.email };
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  try { localStorage.setItem('token', token); } catch { /* localStorage tidak tersedia — abaikan */ }
}

export function clearToken() {
  try { localStorage.removeItem('token'); } catch { /* localStorage tidak tersedia — abaikan */ }
}
