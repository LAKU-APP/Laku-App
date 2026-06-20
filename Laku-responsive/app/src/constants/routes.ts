// Pemetaan rute. Saat ini app memakai navigasi berbasis tab (state di AppContext),
// belum URL routing. Konstanta ini jadi acuan path bila nanti migrasi ke router.
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  products: '/products',
  pos: '/pos',
  records: '/records',
  insights: '/insights',
  settings: '/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
