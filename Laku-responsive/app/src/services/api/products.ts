// CRUD produk + adjust stock ke backend nyata (lihat docs/API.md §2).
import type { Product, Transaction } from '@/types';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface ProductInput {
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  category?: string;
  image?: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await apiClient<{ data: Product[] }>(ENDPOINTS.products);
  return res.data;
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  const res = await apiClient<{ data: Product }>(ENDPOINTS.products, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateProduct(id: string, payload: Partial<ProductInput>): Promise<Product> {
  const res = await apiClient<{ data: Product }>(`${ENDPOINTS.products}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient<{ message: string }>(`${ENDPOINTS.products}/${id}`, { method: 'DELETE' });
}

export async function adjustStock(
  id: string,
  qty: number,
  type: 'IN' | 'OUT',
  note?: string,
): Promise<{ product: Product; transaction: Transaction }> {
  const res = await apiClient<{ data: { product: Product; transaction: Transaction } }>(
    `${ENDPOINTS.products}/${id}/stock`,
    { method: 'PATCH', body: JSON.stringify({ qty, type, note }) },
  );
  return res.data;
}
