// Formatter angka generik. Untuk uang Rupiah pakai `formatRupiah` di currency.ts.

/** Format angka dengan pemisah ribuan gaya Indonesia, mis. 15000 → "15.000". */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('id-ID');
}

/** Format persen, mis. 0.215 (atau 21.5) → "21,5%". `alreadyPercent` bila input sudah 0–100. */
export function formatPercent(value: number, alreadyPercent = false): string {
  const pct = alreadyPercent ? value : value * 100;
  return `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;
}

/** Singkat angka besar, mis. 1500000 → "1,5 jt", 12000 → "12 rb". */
export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`;
  return formatNumber(value);
}
