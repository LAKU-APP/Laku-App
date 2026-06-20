// Profil sesi user yang sedang login.
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

// Pengaturan toko milik user (dipakai di struk, kas, notifikasi).
export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string; // no. HP toko — tampil di struk
  receiptNote: string; // catatan/ucapan di kaki struk
  initialCash: number; // saldo awal kas
  lowStockThreshold: number; // batas stok dianggap "rendah"
  notifLowStock: boolean; // tampilkan notifikasi stok rendah/habis
  notifTarget: boolean; // tampilkan notifikasi target tercapai
  currency: string;
  darkMode: boolean;
}
