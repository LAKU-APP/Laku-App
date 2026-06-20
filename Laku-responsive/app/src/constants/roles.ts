// Peran pengguna. RBAC belum diimplementasikan — ini scaffolding untuk multi-user.
export const ROLES = {
  owner: 'owner',
  cashier: 'cashier',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
