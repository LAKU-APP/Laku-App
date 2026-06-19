// ─── Demo Mode API ─────────────────────────────────────────────────────────
// Backend belum tersedia, semua auth berjalan secara lokal (demo mode).
// Ketika backend sudah siap, ganti fungsi di bawah dengan real API calls.

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ─── Demo accounts ─────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { email: 'admin@laku.id', password: 'admin123', name: 'Admin LAKU' },
  { email: 'demo@laku.id', password: 'demo123', name: 'Warung Demo' },
];

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  // `onboardingCompleted` menentukan apakah user perlu melewati langkah
  // pengenalan setelah login. Backend yang jadi sumber kebenaran field ini;
  // selama demo statusnya dicatat lokal (lihat helper onboarding di bawah).
  user: { id: string; name: string; email: string; onboardingCompleted: boolean };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Check demo accounts first
  const demoAccount = DEMO_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );

  if (demoAccount) {
    return {
      token: `demo-token-${generateId()}`,
      user: { id: generateId(), name: demoAccount.name, email: demoAccount.email, onboardingCompleted: isEmailOnboarded(demoAccount.email) },
    };
  }

  // For any other credentials, allow login in demo mode
  return {
    token: `demo-token-${generateId()}`,
    user: { id: generateId(), name: email.split('@')[0], email, onboardingCompleted: isEmailOnboarded(email) },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function apiRegister(name: string, email: string, _password: string): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Akun baru selalu belum onboarding. Catatan: token sengaja tidak dipakai
  // untuk auto-login di sisi UI — user diarahkan login dulu setelah daftar.
  return {
    token: `demo-token-${generateId()}`,
    user: { id: generateId(), name, email, onboardingCompleted: false },
  };
}

// ─── Onboarding status (demo) ──────────────────────────────────────────────
// Backend akan menyimpan status ini per-user. Selama demo, email yang sudah
// menyelesaikan langkah pengenalan dicatat di localStorage supaya:
//   • user baru  → setelah login melewati langkah pengenalan dulu;
//   • user lama  → langsung masuk aplikasi.
const ONBOARDED_KEY = 'onboardedEmails';

function readOnboardedEmails(): string[] {
  try {
    const raw = localStorage.getItem(ONBOARDED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function isEmailOnboarded(email: string): boolean {
  return readOnboardedEmails().includes(email.trim().toLowerCase());
}

// Tandai user (email) sudah menyelesaikan onboarding.
// Backend: ganti dengan PATCH `/auth/onboarding`.
export async function apiCompleteOnboarding(email: string): Promise<void> {
  const key = email.trim().toLowerCase();
  const list = readOnboardedEmails();
  if (!list.includes(key)) {
    list.push(key);
    try { localStorage.setItem(ONBOARDED_KEY, JSON.stringify(list)); } catch { /* localStorage tidak tersedia — abaikan */ }
  }
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  try { localStorage.setItem('token', token); } catch { /* localStorage tidak tersedia — abaikan */ }
}

export function clearToken() {
  try { localStorage.removeItem('token'); } catch { /* localStorage tidak tersedia — abaikan */ }
}
