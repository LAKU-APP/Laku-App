// Util tanggal. App memakai ISO string (createdAt) sebagai format simpan.

/** Kembalikan bagian tanggal (YYYY-MM-DD) dari ISO string atau Date. */
export function toDateKey(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toISOString().split('T')[0];
}

/** ISO string untuk n hari yang lalu (jam diset agar stabil). */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

/** True bila tanggal sama dengan hari ini. */
export function isToday(value: string | Date): boolean {
  return toDateKey(value) === toDateKey(new Date());
}

/** Format panjang, mis. "Sabtu, 21 Juni". */
export function formatDateLong(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Format singkat, mis. "21 Jun 2026". */
export function formatDateShort(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
