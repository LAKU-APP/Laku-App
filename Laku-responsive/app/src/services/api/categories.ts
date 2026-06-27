// Kategori produk ke backend nyata (lihat docs/API.md §3).
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export async function fetchCategories(): Promise<string[]> {
  const res = await apiClient<{ data: string[] }>(ENDPOINTS.categories);
  return res.data;
}

export async function createCategory(name: string): Promise<string[]> {
  const res = await apiClient<{ data: string[] }>(ENDPOINTS.categories, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return res.data;
}

export async function deleteCategory(name: string): Promise<void> {
  await apiClient<{ message: string }>(`${ENDPOINTS.categories}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
}
