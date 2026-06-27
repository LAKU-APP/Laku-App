// Riwayat struk ke backend nyata (lihat docs/API.md §5).
import type { ReceiptSnapshot } from '@/types';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export async function fetchReceipts(): Promise<ReceiptSnapshot[]> {
  const res = await apiClient<{ data: ReceiptSnapshot[] }>(ENDPOINTS.receipts);
  return res.data;
}
