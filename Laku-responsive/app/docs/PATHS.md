# Dokumentasi Struktur Path — Laku-responsive (app)

Panduan singkat tentang folder dan file penting dalam folder `app`.

## Root (app/)
- `package.json` : dependensi dan skrip proyek.
- `vite.config.ts` : konfigurasi bundler Vite.
- `tailwind.config.js` : konfigurasi Tailwind CSS.
- `postcss.config.js` : konfigurasi PostCSS.
- `tsconfig.json`, `tsconfig.app.json` : konfigurasi TypeScript.
- `index.html` : titik masuk HTML untuk aplikasi.

## Sumber utama (app/src/)
- `main.tsx` : bootstrap aplikasi (mount React).
- `App.tsx` : root component aplikasi.
- `index.css`, `App.css` : gaya global dan style utama.

### Komponen (app/src/components/)
- `TopNav.tsx`, `BottomNav.tsx`, `SideNav.tsx`, `StatusBar.tsx`, `Toast.tsx`, `ModalSheet.tsx`
  - Komponen UI tingkat atas yang digunakan di halaman.

#### Komponen UI kecil (app/src/components/ui/)
- Banyak komponen UI kecil yang dapat dipakai ulang, mis. `button.tsx`, `card.tsx`, `dialog.tsx`, `avatar.tsx`, dll.
  - Gunakan folder ini untuk komponen presentasional / atomik.

### Halaman (app/src/pages/)
- `Dashboard.tsx` — halaman dashboard.
- `Products.tsx` — halaman produk / katalog.
- `POS.tsx` — halaman point-of-sale.
- `Records.tsx`, `Insights.tsx`, `Login.tsx` — halaman lain.

### Context (app/src/context/)
- `AppContext.tsx` : penyimpanan state global / context provider.

### Hooks (app/src/hooks/)
- `use-mobile.ts` : hook deteksi perangkat mobile.

### Library/Util (app/src/lib/)
- `utils.ts` : fungsi utilitas yang dipakai di beberapa modul.

### Tipe (app/src/types/)
- `index.ts` : definisi type / interface TypeScript proyek.

## Catatan dan saran singkat
- Jika ingin merapikan import paths, pertimbangkan menambahkan `paths` di `tsconfig.json` untuk alias seperti `@/components` => `src/components`.
- Untuk dokumentasi lebih lanjut, buat `docs/` atau `README` terpisah per fitur.

---
Dokumentasi ini dibuat otomatis — beri tahu saya bila mau saya tambahkan alias `tsconfig` atau commit file ini.
