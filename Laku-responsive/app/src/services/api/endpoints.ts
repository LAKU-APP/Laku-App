// Base URL & path endpoint backend. Lihat kontrak lengkap di docs/API.md.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export const ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  onboarding: '/auth/onboarding',
  profile: '/auth/profile',
  products: '/products',
  transactions: '/transactions',
  categories: '/categories',
  receipts: '/receipts',
  settings: '/settings',
  dashboardStats: '/dashboard/stats',
  insightsSales: '/insights/sales',
  insightsPredictions: '/insights/predictions',
} as const;
