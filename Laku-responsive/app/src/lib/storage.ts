// Pembungkus localStorage yang aman dipakai di mana saja.
//
// localStorage bisa melempar error (mode penyamaran browser, kuota penuh,
// atau konteks tanpa DOM saat server-side render). Semua akses dibungkus
// try/catch agar kegagalan penyimpanan tidak pernah membuat aplikasi crash —
// data cukup gagal disimpan/dibaca secara diam-diam dan kembali ke nilai default.

/** Baca & parse nilai JSON dari localStorage. Mengembalikan `fallback` bila gagal. */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Simpan nilai sebagai JSON ke localStorage. Diabaikan bila penyimpanan tidak tersedia. */
export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Penyimpanan tidak tersedia — abaikan.
  }
}

/** Hapus sebuah key dari localStorage. */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Penyimpanan tidak tersedia — abaikan.
  }
}
