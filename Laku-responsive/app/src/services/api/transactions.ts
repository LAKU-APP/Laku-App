// Riwayat transaksi & checkout POS ke backend nyata (lihat docs/API.md §4).
import type { ReceiptSnapshot, Transaction } from '@/types';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface CheckoutPayload {
  items: { productId: string; qty: number }[];
  paymentMethod?: 'cash' | 'transfer' | 'qris';
  discount?: number;
  cashPaid?: number;
  note?: string;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await apiClient<{ data: Transaction[]; total: number }>(ENDPOINTS.transactions);
  return res.data;
}

export async function checkout(payload: CheckoutPayload): Promise<{ transactions: Transaction[]; receipt: ReceiptSnapshot }> {
  const res = await apiClient<{ data: { transactions: Transaction[]; receipt: ReceiptSnapshot } }>(
    ENDPOINTS.transactions,
    { method: 'POST', body: JSON.stringify(payload) },
  );
  return res.data;
}
