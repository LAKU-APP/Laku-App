// Barrel tipe data. Impor cukup dari `@/types`.
import type { ReactNode } from 'react';

export * from './auth';
export * from './user';
export * from './product';
export * from './transaction';

export type TabType = 'dashboard' | 'products' | 'pos' | 'records' | 'insights' | 'settings';

export interface ToastState {
  visible: boolean;
  message: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ModalState {
  open: boolean;
  title: string;
  content: ReactNode;
}

export interface DashboardStats {
  todayProfit: number;
  cashOnHand: number;
  todayRevenue: number;
  todayExpense: number;
  targetProfit: number;
}
