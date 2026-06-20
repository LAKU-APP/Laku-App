import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID acak yang cukup unik untuk data lokal (produk, transaksi, struk).
// Menggabungkan basis-36 dari angka acak dan timestamp agar tidak bentrok
// meski dibuat berurutan dalam satu milidetik.
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Parse string menjadi bilangan bulat non-negatif. Mengembalikan null bila
// input bukan angka yang valid (mis. mengandung huruf) sehingga form bisa
// menolaknya alih-alih menyimpan NaN.
export function parseNonNegativeInt(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return parseInt(trimmed, 10);
}
