// Util string ringan.

/** Kapitalkan huruf pertama. */
export function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Inisial dari nama (maks 2 huruf), mis. "Warung Bu Sri" → "WB". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Potong teks dengan elipsis bila melebihi panjang maksimum. */
export function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
