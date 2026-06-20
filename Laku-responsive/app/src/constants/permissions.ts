// Izin per-peran. RBAC belum dipakai di UI — scaffolding untuk multi-user nanti.
import type { Role } from './roles';

export type Permission =
  | 'manage_products'
  | 'process_sales'
  | 'view_reports'
  | 'manage_settings';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['manage_products', 'process_sales', 'view_reports', 'manage_settings'],
  cashier: ['process_sales'],
};
