// Pengaturan toko & target ke backend nyata (lihat docs/API.md §6).
import type { StoreSettings } from '@/types';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export type StoreSettingsWithTarget = StoreSettings & { dailyTarget: number };

export async function fetchSettings(): Promise<StoreSettingsWithTarget> {
  const res = await apiClient<{ data: StoreSettingsWithTarget }>(ENDPOINTS.settings);
  return res.data;
}

export async function updateSettings(payload: Partial<StoreSettings>): Promise<StoreSettingsWithTarget> {
  const res = await apiClient<{ data: StoreSettingsWithTarget }>(ENDPOINTS.settings, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateTarget(dailyTarget: number): Promise<StoreSettingsWithTarget> {
  const res = await apiClient<{ data: StoreSettingsWithTarget }>(`${ENDPOINTS.settings}/target`, {
    method: 'PATCH',
    body: JSON.stringify({ dailyTarget }),
  });
  return res.data;
}
