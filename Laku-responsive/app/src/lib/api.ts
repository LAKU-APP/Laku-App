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
  user: { id: string; name: string; email: string };
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
      user: { id: generateId(), name: demoAccount.name, email: demoAccount.email },
    };
  }

  // For any other credentials, allow login in demo mode
  return {
    token: `demo-token-${generateId()}`,
    user: { id: generateId(), name: email.split('@')[0], email },
  };
}

export async function apiRegister(name: string, email: string, _password: string): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    token: `demo-token-${generateId()}`,
    user: { id: generateId(), name, email },
  };
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  try { localStorage.setItem('token', token); } catch {}
}

export function clearToken() {
  try { localStorage.removeItem('token'); } catch {}
}
