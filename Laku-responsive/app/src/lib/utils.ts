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
