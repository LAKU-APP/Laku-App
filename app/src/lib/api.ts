// Base URL — ganti dengan URL backend production kamu
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  try { return localStorage.getItem('token'); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }

  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function apiGetProducts() {
  return request<{ data: unknown[] }>('/products');
}

export async function apiCreateProduct(payload: unknown) {
  return request('/products', { method: 'POST', body: JSON.stringify(payload) });
}

export async function apiUpdateProduct(id: string, payload: unknown) {
  return request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function apiDeleteProduct(id: string) {
  return request(`/products/${id}`, { method: 'DELETE' });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function apiGetTransactions() {
  return request<{ data: unknown[] }>('/transactions');
}

export async function apiCreateTransaction(payload: unknown) {
  return request('/transactions', { method: 'POST', body: JSON.stringify(payload) });
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  try { localStorage.setItem('token', token); } catch {}
}

export function clearToken() {
  try { localStorage.removeItem('token'); } catch {}
}
