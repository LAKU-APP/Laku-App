// ─── Demo Mode API ─────────────────────────────────────────────────────────
// Backend belum tersedia, semua auth berjalan secara lokal (demo mode).
// Ketika backend sudah siap, ganti fungsi di bawah dengan real API calls.
//
// Catatan keamanan: akun terdaftar (email+password) disimpan apa adanya di
// localStorage HANYA untuk demo lokal. Pada produksi, validasi & hashing
// password dilakukan di backend (lihat docs/API.md), bukan di sini.

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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

// ─── Demo accounts (selalu tersedia, mis. tombol "Masuk Demo") ──────────────

const DEMO_ACCOUNTS = [
  { email: 'admin@laku.id', phone: '628123456789', password: 'admin123', name: 'Admin LAKU' },
  { email: 'demo@laku.id', phone: '628987654321', password: 'demo123', name: 'Warung Demo' },
];

// ─── Akun terdaftar (demo, tersimpan lokal) ─────────────────────────────────

const ACCOUNTS_KEY = 'registeredAccounts';
interface StoredAccount { email: string; phone: string; password: string; name: string; onboardingCompleted?: boolean }

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAccounts(list: StoredAccount[]) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); } catch { /* localStorage tidak tersedia — abaikan */ }
}

/** Cari akun berdasarkan email ATAU nomor HP. */
function findAccount(identifier: string): StoredAccount | undefined {
  const id = identifier.trim();
  if (!id) return undefined; // jangan cocokkan string kosong (akun tanpa email)
  if (isPhoneNumber(id)) {
    const norm = normalizePhone(id);
    return readAccounts().find(a => a.phone === norm);
  }
  const key = id.toLowerCase();
  return readAccounts().find(a => a.email === key);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  // `onboardingCompleted` menentukan apakah user perlu melewati langkah
  // pengenalan setelah login. Backend yang jadi sumber kebenaran field ini;
  // selama demo statusnya dicatat lokal (lihat helper onboarding di bawah).
  user: { id: string; name: string; email: string; phone?: string; onboardingCompleted: boolean };
}

export async function apiLogin(identifier: string, password: string): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  const usingPhone = isPhoneNumber(identifier);
  const label = usingPhone ? 'Nomor HP' : 'Email';

  // 1) Akun demo bawaan — cek via email atau nomor HP.
  let demoAccount;
  if (usingPhone) {
    const norm = normalizePhone(identifier);
    demoAccount = DEMO_ACCOUNTS.find(a => a.phone === norm);
  } else {
    const key = identifier.trim().toLowerCase();
    demoAccount = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === key);
  }
  if (demoAccount) {
    if (demoAccount.password !== password) throw new Error(`${label} atau password salah`);
    return {
      token: `demo-token-${generateId()}`,
      user: { id: generateId(), name: demoAccount.name, email: demoAccount.email, phone: demoAccount.phone, onboardingCompleted: isEmailOnboarded(demoAccount.email) },
    };
  }

  // 2) Akun terdaftar — cocokkan via email ATAU nomor HP.
  const account = findAccount(identifier);
  if (!account) throw new Error(`${label} belum terdaftar. Silakan buat akun dulu.`);
  if (account.password !== password) throw new Error(`${label} atau password salah`);

  return {
    token: `demo-token-${generateId()}`,
    user: { id: generateId(), name: account.name, email: account.email, phone: account.phone, onboardingCompleted: account.onboardingCompleted ?? false },
  };
}

export async function apiRegister(name: string, email: string, password: string, phone: string): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  const emailKey = email.trim().toLowerCase();
  const phoneKey = phone ? normalizePhone(phone) : '';

  // Tolak bila email sudah dipakai (hanya bila email memang diisi).
  if (emailKey) {
    const isEmailDemo = DEMO_ACCOUNTS.some(a => a.email.toLowerCase() === emailKey);
    if (isEmailDemo || findAccount(emailKey)) throw new Error('Email sudah terdaftar');
  }

  // Tolak bila nomor HP sudah dipakai.
  if (phoneKey) {
    const isPhoneDemo = DEMO_ACCOUNTS.some(a => a.phone === phoneKey);
    const phoneExists = readAccounts().some(a => a.phone === phoneKey);
    if (isPhoneDemo || phoneExists) throw new Error('Nomor HP sudah terdaftar');
  }

  const accounts = readAccounts();
  accounts.push({ email: emailKey, phone: phoneKey, password, name: name.trim(), onboardingCompleted: false });
  writeAccounts(accounts);

  // Akun baru selalu belum onboarding. Catatan: token sengaja tidak dipakai
  // untuk auto-login di sisi UI — user diarahkan login dulu setelah daftar.
  return {
    token: `demo-token-${generateId()}`,
    user: { id: generateId(), name: name.trim(), email: emailKey, phone: phoneKey, onboardingCompleted: false },
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

// Tandai user (lewat email ATAU nomor HP) sudah menyelesaikan onboarding.
// Status disimpan PADA akun terdaftar agar tetap valid walau email/HP diubah.
// Untuk akun demo (tidak tersimpan lokal) fallback ke set `onboardedEmails`.
// Backend: ganti dengan PATCH `/auth/onboarding`.
export async function apiCompleteOnboarding(identifier: string): Promise<void> {
  const id = identifier.trim();
  if (!id) return;
  const accounts = readAccounts();
  const usingPhone = isPhoneNumber(id);
  const idx = accounts.findIndex(a => usingPhone ? a.phone === normalizePhone(id) : a.email === id.toLowerCase());
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], onboardingCompleted: true };
    writeAccounts(accounts);
    return;
  }
  // Fallback (mis. akun demo yang tidak tersimpan di registeredAccounts).
  const key = id.toLowerCase();
  const list = readOnboardedEmails();
  if (!list.includes(key)) {
    list.push(key);
    try { localStorage.setItem(ONBOARDED_KEY, JSON.stringify(list)); } catch { /* localStorage tidak tersedia — abaikan */ }
  }
}

// Perbarui email/nomor HP akun terdaftar (dipanggil dari Pengaturan → Akun).
// Mengembalikan nilai ternormalisasi. Akun demo (tak tersimpan) hanya dinormalkan.
export async function apiUpdateContact(
  current: { email?: string; phone?: string },
  next: { email?: string; phone?: string },
): Promise<{ email: string; phone: string }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const nextEmail = (next.email ?? '').trim().toLowerCase();
  const nextPhone = next.phone ? normalizePhone(next.phone) : '';

  if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) throw new Error('Format email tidak valid');
  if (nextPhone && !/^62\d{8,13}$/.test(nextPhone)) throw new Error('Format nomor HP tidak valid (mis. 0812xxxxxxx)');

  const accounts = readAccounts();
  const curEmail = (current.email ?? '').trim().toLowerCase();
  const curPhone = current.phone ? normalizePhone(current.phone) : '';
  const idx = accounts.findIndex(a => (curEmail && a.email === curEmail) || (curPhone && a.phone === curPhone));

  // Pastikan email/HP baru tidak dipakai akun lain (atau akun demo).
  const emailTaken = nextEmail && (
    DEMO_ACCOUNTS.some(a => a.email.toLowerCase() === nextEmail) ||
    accounts.some((a, i) => i !== idx && a.email === nextEmail));
  if (emailTaken) throw new Error('Email sudah dipakai akun lain');
  const phoneTaken = nextPhone && (
    DEMO_ACCOUNTS.some(a => a.phone === nextPhone) ||
    accounts.some((a, i) => i !== idx && a.phone === nextPhone));
  if (phoneTaken) throw new Error('Nomor HP sudah dipakai akun lain');

  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], email: nextEmail, phone: nextPhone };
    writeAccounts(accounts);
  }
  return { email: nextEmail, phone: nextPhone };
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  try { localStorage.setItem('token', token); } catch { /* localStorage tidak tersedia — abaikan */ }
}

export function clearToken() {
  try { localStorage.removeItem('token'); } catch { /* localStorage tidak tersedia — abaikan */ }
}
