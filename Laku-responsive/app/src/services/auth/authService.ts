// ─── Auth API ────────────────────────────────────────────────────────────────
// Semua fungsi di bawah memanggil backend nyata (lihat docs/API.md §1) lewat
// services/api/client.
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

// ─── Helpers deteksi & normalisasi nomor HP ─────────────────────────────────

/** Cek apakah input adalah nomor telepon (mulai dengan 0, +62, atau 62). */
export function isPhoneNumber(input: string): boolean {
  const cleaned = input.replace(/[\s\-()]/g, '');
  return /^(\+62|62|0)\d{8,13}$/.test(cleaned);
}

/** Normalisasi nomor HP ke format 62xxx (tanpa +). */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+62')) cleaned = '62' + cleaned.slice(3);
  else if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  return cleaned;
}

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

// Perbarui email/nomor HP akun (dipanggil dari Pengaturan → Akun) lewat
// PATCH /auth/profile. Validasi keunikan (EMAIL_TAKEN/PHONE_TAKEN) dilakukan backend.
export async function apiUpdateContact(
  _current: { email?: string; phone?: string },
  next: { email?: string; phone?: string },
): Promise<{ email: string; phone: string }> {
  const nextEmail = (next.email ?? '').trim().toLowerCase();
  const nextPhone = next.phone ? normalizePhone(next.phone) : '';

  if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) throw new Error('Format email tidak valid');
  if (nextPhone && !/^62\d{8,13}$/.test(nextPhone)) throw new Error('Format nomor HP tidak valid (mis. 0812xxxxxxx)');

  const res = await apiClient<{ user: { email: string; phone?: string } }>(ENDPOINTS.profile, {
    method: 'PATCH',
    body: JSON.stringify({ email: nextEmail || undefined, phone: nextPhone || null }),
  });
  return { email: res.user.email, phone: res.user.phone ?? '' };
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  try { localStorage.setItem('token', token); } catch { /* localStorage tidak tersedia — abaikan */ }
}

export function clearToken() {
  try { localStorage.removeItem('token'); } catch { /* localStorage tidak tersedia — abaikan */ }
}
