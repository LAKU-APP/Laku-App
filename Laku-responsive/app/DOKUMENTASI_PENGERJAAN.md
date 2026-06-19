# Dokumentasi Pengerjaan Web LAKU

LAKU adalah aplikasi web manajemen toko/warung untuk UMKM: kelola produk & stok,
kasir (POS), catatan transaksi, dan insight bisnis. Dirancang responsif penuh dari
layar HP kecil (mis. iPhone SE) sampai desktop/iPad besar.

Dokumen ini menjelaskan kondisi project **saat ini** berdasarkan source code aktual.
Untuk kontrak endpoint backend, lihat `API.md`.

---

## 1. Ringkasan Fitur

- **Auth**: login, register, dan mode **Demo (Admin)**.
- **Onboarding** bertahap untuk akun baru (langkah pengenalan + setup awal toko/target).
- **Dashboard**: laba hari ini, kas di tangan, omzet, biaya, progres target harian, transaksi terbaru.
- **Produk/Stok**: CRUD produk, harga modal (HPP), kategori, foto, atur stok, status stok, cari/urut/filter.
- **Kasir/POS**: keranjang, validasi stok, metode pembayaran, diskon, uang diterima & kembalian, cetak/simpan struk.
- **Catatan**: riwayat transaksi dengan filter waktu dan ringkasan.
- **Insight**: ringkasan SKU/terlaris/transaksi/stok rendah, **grafik omzet interaktif (7/30 hari)** dengan rincian per hari, prediksi restock & prediksi omzet (AI Prediction).
- **Pengaturan**: profil toko, operasional (kas awal, ambang stok), notifikasi, kategori, backup/restore data, reset data, logout — disusun rapi sebagai dropdown per-kategori.
- **Persistensi**: seluruh data inti disimpan otomatis ke `localStorage`.
- **Splash screen** "laku..." saat aplikasi dibuka, dan **Error Boundary** global.

---

## 2. Tech Stack

- **React 19** + **TypeScript** untuk UI dan type safety.
- **Vite 7** sebagai dev server & bundler.
- **Tailwind CSS 3** untuk styling (memakai warna hex langsung untuk identitas LAKU).
- **lucide-react** untuk ikon.
- **jsPDF / html2canvas** untuk ekspor PDF (struk/laporan) dan **CSV** untuk laporan.
- Radix UI / komponen shadcn-style tersedia di `src/components/ui` (sebagian dipakai).
- **`localStorage`** sebagai penyimpanan utama (belum ada backend).

Navigasi **tidak** memakai URL routing — halaman dipilih lewat `state.activeTab`
(state-based) di `AppContext`.

Script `package.json`:
```bash
npm run dev      # dev server (port 3000)
npm run build    # tsc -b && vite build
npm run lint
npm run preview
npm run deploy   # gh-pages -d dist
```

Konfigurasi deploy (GitHub Pages):
- `homepage`: `https://laku-app.github.io/Laku-App/`
- Vite `base`: `/Laku-App/`

---

## 3. Struktur Folder

```txt
app/
  API.md                     # kontrak backend
  DOKUMENTASI_PENGERJAAN.md  # dokumen ini
  vite.config.ts             # base '/Laku-App/', port 3000
  src/
    main.tsx                 # entry: ErrorBoundary > AppProvider > App
    App.tsx                  # splash, gating login/onboarding, layout mobile vs desktop
    index.css                # base style, animasi, util (.scrollbar-hide, dst.)
    context/
      AppContext.tsx         # state global (useReducer) + persistensi localStorage
    pages/
      Login.tsx  Dashboard.tsx  Products.tsx  POS.tsx
      Records.tsx  Insights.tsx  Settings.tsx
    components/
      Onboarding.tsx  Splash.tsx  LakuLogo.tsx  ErrorBoundary.tsx
      TopNav.tsx  SideNav.tsx  BottomNav.tsx  ModalSheet.tsx  Toast.tsx
      ui/                    # komponen generic shadcn-style
    hooks/
      use-mobile.ts          # useIsMobile / useIsTablet / useIsDesktop
    lib/
      api.ts                 # auth demo + helper token + status onboarding
      finance.ts             # SATU sumber kebenaran perhitungan uang
      storage.ts             # wrapper aman localStorage
      utils.ts               # cn(), generateId()
    types/
      index.ts               # semua tipe data
```

---

## 4. Entry Point & Arsitektur

`src/main.tsx` me-render `#root` dengan urutan pembungkus:
`ErrorBoundary` → `AppProvider` → `App`.

`App.tsx`:
1. Menampilkan **Splash** singkat (~1.1 dtk) saat boot.
2. Jika `state.user` kosong → tampilkan **Login**.
3. Jika sudah login tapi `!state.hasSeenOnboarding` → tampilkan **Onboarding**.
4. Selain itu → tampilkan layout utama + halaman sesuai `state.activeTab`:
   `dashboard | products | pos | records | insights | settings`.

Layout dibedakan responsif:
- **Mobile (<768px)**: `TopNav` + konten + `BottomNav`. `<main>` sendiri yang scroll.
- **Tablet/Desktop (≥768px)**: `SideNav` + `TopNav` + konten. Tinggi root **tetap**
  (`h-dvh`), `<main>` `overflow-hidden`, dan **halaman** yang scroll internal.

---

## 5. State Management

State global di `src/context/AppContext.tsx`, dikelola `useReducer`.

Data utama: `products`, `transactions`, `cart`, `activeTab`, `toast`, `user`,
`dailyTarget`, `notifications`, `hasSeenOnboarding`, `receipts`, `storeSettings`,
`categories`.

Action penting:
- Produk: `ADD_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`, `ADJUST_STOCK`.
- Transaksi/kasir: `ADD_TRANSACTION`, `ADD_TO_CART`, `UPDATE_CART_QTY`, `CLEAR_CART`, `ADD_RECEIPT`.
- Auth/profil: `SET_USER`, `UPDATE_USER`, `LOGOUT`.
- Onboarding: `SET_ONBOARDING_COMPLETE`, `RESET_ONBOARDING`.
- Pengaturan & data: `UPDATE_STORE_SETTINGS`, `ADD_CATEGORY`, `REMOVE_CATEGORY`,
  `SET_DAILY_TARGET`, `RESET_DATA` (`'demo' | 'empty'`), `IMPORT_DATA`.
- Notifikasi: `ADD_NOTIFICATION`, `MARK_NOTIFICATION_READ`, `CLEAR_NOTIFICATIONS`.
- UI: `SET_TAB`, `SHOW_TOAST`, `HIDE_TOAST`.

**Persistensi**: setiap slice (`products`, `transactions`, `receipts`, `cart`,
`categories`, dan `user`, `dailyTarget`, `hasSeenOnboarding`, `storeSettings`)
disimpan otomatis ke `localStorage` lewat `src/lib/storage.ts`
(`readStorage` / `writeStorage` / `removeStorage`). Saat boot, state dipulihkan
dari `localStorage`; data contoh hanya muncul saat pertama kali dibuka.

---

## 6. Model Data (`src/types/index.ts`)

### Product
`id, name, price (harga jual), costPrice? (harga modal/HPP), stock, category?,
image?, emoji, createdAt`.

### Transaction
`id, productId, productName, type ('IN'|'OUT'), qty, totalPrice,
paymentMethod? ('cash'|'transfer'|'qris'), discount?, note?, createdAt`.
- `OUT` = penjualan, `IN` = pembelian/restock (disimpan dengan `totalPrice` negatif
  untuk membedakannya).

### CartItem
`productId, productName, price, qty`.

### ReceiptSnapshot
`id, storeName, createdAt, items[], total, discount?, paymentMethod?, cashPaid?, change?`.

### StoreSettings
`storeName, storeAddress, storePhone, receiptNote, initialCash, lowStockThreshold,
notifLowStock, notifTarget, currency, darkMode`.

### Notification
`id, title, message, type ('info'|'success'|'warning'|'error'), read, createdAt`.

---

## 7. Perhitungan Uang (`src/lib/finance.ts`)

Semua perhitungan uang dipusatkan di sini supaya konsisten di Dashboard, Records,
dan Insights (menghilangkan "angka ajaib" lama seperti `laba = omzet × 0,2`).

- `calcRevenue(tx)` — omzet = Σ penjualan (`OUT`).
- `calcExpense(tx)` — pengeluaran = Σ |pembelian (`IN`)|.
- `transactionProfit(t, products)` / `calcGrossProfit(tx, products)` — laba kotor =
  Σ (`harga jual` − `harga modal` × qty) untuk penjualan. Pembelian stok **tidak**
  memotong laba (itu pembelian aset, bukan biaya hari itu). Jika produk tak punya
  `costPrice`, modal dianggap 0.
- `calcCashOnHand(initialCash, tx)` — kas = saldo awal + omzet − pengeluaran.
- `formatRupiah(amount)` — mis. `15000 → "Rp 15.000"`.

> Akurasi laba bergantung pada pengisian **harga modal** di form produk.

---

## 8. Autentikasi & Onboarding

### Alur (penting)
```
User baru : Buat Akun → kembali ke Login → Login → Langkah pengenalan → Masuk aplikasi
User lama : Login → Masuk aplikasi (onboarding dilewati)
```

- **Register tidak auto-login.** Setelah `apiRegister` sukses, UI kembali ke mode
  **Login** dengan email terisi otomatis dan menampilkan toast "Akun berhasil
  dibuat! Silakan login...". (`src/pages/Login.tsx`)
- Saat login, response auth membawa `user.onboardingCompleted`:
  - `false` → `restartOnboarding()` (tampilkan langkah pengenalan).
  - `true`  → `completeOnboarding()` (langsung masuk).
- Saat onboarding selesai, `completeOnboarding()` menyimpan `hasSeenOnboarding=true`
  dan memanggil `apiCompleteOnboarding(email)` agar login berikutnya tidak mengulang.
- **Mode Demo (Admin)** selalu memutar ulang onboarding (`restartOnboarding()`),
  jadi tombol demo masuk lewat langkah pengenalan dulu, bukan langsung ke aplikasi.

### Demo Mode (`src/lib/api.ts`)
Karena backend belum ada, auth berjalan lokal: `apiLogin` menerima kredensial apa
pun (atau akun demo `admin@laku.id` / `admin123`). Status onboarding per-email
dicatat di `localStorage` (key `onboardedEmails`) untuk mensimulasikan "user lama"
vs "user baru". Token disimpan di key `token`. Saat backend siap, fungsi-fungsi ini
diganti `fetch` sesuai `API.md`.

---

## 9. Halaman

### 9.1 Login (`pages/Login.tsx`)
Form login/register dengan validasi, show/hide password, loading & error state,
tombol Demo (Admin) memakai ikon (bukan emoji). Mobile: background gradient + card.
Desktop: split branding kiri + form kanan.

### 9.2 Dashboard (`pages/Dashboard.tsx`)
Menampilkan laba hari ini, kas di tangan, omzet, biaya, progres target, transaksi
terbaru, edit target harian, dan modal detail. Semua angka dari `finance.ts`
(kas pakai `initialCash` dari Pengaturan, laba pakai HPP — bukan rumus lama).

### 9.3 Produk/Stok (`pages/Products.tsx`)
CRUD produk + harga modal + kategori + foto (base64, maks 2MB), cari, urut
(Terbaru/Nama/Harga/Stok), filter kategori, atur stok (IN/OUT), status stok
(Habis/Hampir Habis/Tersedia), estimasi laba per unit saat mengisi harga.
Desktop = tabel, Mobile = grid kartu + FAB. Konfirmasi sebelum hapus.

### 9.4 POS/Kasir (`pages/POS.tsx`)
Pilih produk → keranjang → atur qty (validasi stok) → checkout dengan metode
pembayaran, diskon, uang diterima & kembalian → buat transaksi `OUT` per item,
kurangi stok, simpan **struk** (bisa dicetak/diunduh).

### 9.5 Catatan (`pages/Records.tsx`)
Riwayat transaksi dengan filter (Hari ini/Kemarin/7/30 hari), ringkasan omzet,
biaya, laba (via `finance.ts`), jumlah transaksi, dikelompokkan per tanggal,
label `JUAL`/`BELI`.

### 9.6 Insight (`pages/Insights.tsx`)
- Kartu ringkasan: Total SKU, Terlaris, Transaksi, Stok Rendah.
- **Grafik omzet interaktif** (komponen `SalesChart`): toggle **7 Hari / 30 Hari**,
  batang bisa **diketuk** untuk melihat rincian **Pemasukan / Pengeluaran / Laba**
  hari itu + daftar transaksinya. Mode 30 hari bisa di-scroll horizontal.
- **AI Prediction**: kartu prediksi omzet minggu depan (heuristik dari rata-rata
  omzet 7 hari + momentum, dengan confidence) dan **Prediksi Belanja** (rekomendasi
  restock per produk dari kecepatan penjualan). Tampil **di mobile maupun desktop**.

### 9.7 Pengaturan (`pages/Settings.tsx`)
Disusun sebagai **accordion per-kategori** (buka satu-satu agar tidak perlu scroll
panjang): Profil Toko, Operasional, Notifikasi, Kategori, Data (backup/restore JSON,
reset demo/kosong), Akun (logout). Tombol **Simpan** berada di paling bawah.

---

## 10. Komponen Pendukung

- **Onboarding** (`components/Onboarding.tsx`): langkah pengenalan untuk akun baru,
  termasuk setup toko & target. Tiap slide memakai **tinggi tetap** (`min(64vh,500px)`)
  + scroll internal sehingga tombol navigasi tidak "lompat-lompat" antar slide.
- **Splash** (`components/Splash.tsx`): animasi loading "laku" + titik berdenyut.
- **LakuLogo** (`components/LakuLogo.tsx`): logo tas belanja + garis tren naik.
- **ErrorBoundary** (`components/ErrorBoundary.tsx`): menangkap error render global.
- **TopNav**: judul halaman, notifikasi (item bisa diklik & dibaca), popup profil
  ("Buka Pengaturan", tanpa tombol logout ganda).
- **SideNav**: navigasi tablet/desktop; baris profil bawah bersifat info (tidak diklik).
- **BottomNav**: navigasi mobile (Dashboard/Stok/Kasir/Catatan/Insight), tombol Kasir
  menonjol; tanpa garis indikator di atas ikon.
- **ModalSheet**: bottom sheet di mobile, dialog tengah di desktop; breakpoint reaktif,
  tutup via overlay/Escape.
- **Toast**: feedback singkat global.

---

## 11. Responsivitas

Breakpoint via `hooks/use-mobile.ts`: Mobile `<768`, Tablet `768–1023`, Desktop `≥1024`.

**Pola scroll (penting):** di desktop, root memakai tinggi tetap `h-dvh` dan `<main>`
`overflow-hidden`; **container scroll setiap halaman** memakai `flex-1 min-h-0
overflow-y-auto`. `min-h-0` wajib — tanpa itu, item flex memanjang setinggi kontennya
(`min-height:auto`), terpotong `<main>`, dan tidak bisa di-scroll (ini penyebab bug
"produk tidak bisa di-scroll" yang sudah diperbaiki). Di mobile, `<main>` sendiri yang
menjadi area scroll.

---

## 12. Penyimpanan (localStorage)

Key yang dipakai: `user`, `token`, `dailyTarget`, `hasSeenOnboarding`,
`storeSettings`, `categories`, `products`, `transactions`, `receipts`, `cart`,
serta `onboardedEmails` (status onboarding per-email untuk Demo Mode).

---

## 13. Cara Menjalankan

```bash
cd app
npm install
npm run dev      # buka http://localhost:3000/Laku-App/
```
Build & preview:
```bash
npm run build
npm run preview
```

> Catatan: setelah edit besar, jika perubahan tidak muncul di browser, restart
> dev server (`Ctrl+C` lalu `npm run dev`) dan hard reload (Ctrl+Shift+R) untuk
> membersihkan cache HMR.

---

## 14. Perubahan Terbaru (Changelog)

Iterasi terakhir yang sudah dikerjakan:

1. **Fondasi data**: modul `finance.ts` (sumber tunggal perhitungan uang, laba pakai
   HPP), `storage.ts` (wrapper localStorage), persistensi penuh semua slice data.
2. **Pengaturan** lengkap berbentuk accordion + tombol Simpan di bawah; backup/restore
   JSON; reset data demo/kosong; ambang stok & saldo kas awal dapat diatur.
3. **Onboarding** lebih kompleks untuk akun baru, dengan tinggi slide konsisten
   (anti layout-shift).
4. **UI/UX**: logo baru, login disempurnakan, splash "laku...", notifikasi bisa
   diklik & dibaca, profil web tidak lagi dobel-klik, bottom-nav dirapikan.
5. **Insight**: grafik omzet **interaktif** (7/30 hari + rincian harian) dan
   **AI Prediction tampil di mobile**.
6. **Perbaikan scroll desktop**: penambahan `min-h-0` pada container scroll halaman
   (mis. Produk yang tadinya tidak bisa di-scroll di web).
7. **Alur auth diperbarui**: register **tidak** lagi langsung masuk aplikasi —
   user baru diarahkan kembali ke Login (validasi) lalu melewati langkah pengenalan;
   user lama langsung masuk. Status onboarding dibawa via `user.onboardingCompleted`
   (lihat `API.md` §0).

---

## 15. Status & Pengembangan Lanjutan

**Sudah berjalan:** UI responsif penuh, auth + onboarding (flow baru), CRUD produk,
POS + struk, catatan, dashboard & insight dengan perhitungan konsisten, persistensi
localStorage, backup/restore, pengaturan lengkap.

**Masih lokal/simulasi:** belum ada backend (data di `localStorage`); prediksi
"AI" masih heuristik berbasis data transaksi (belum model ML); dark mode disiapkan
tapi belum diekspos di UI.

**Prioritas selanjutnya:**
1. Implementasi backend sesuai `API.md` dan ganti `src/lib/api.ts` dari demo ke `fetch`.
2. Sinkronisasi produk/transaksi/pengaturan ke server (saat ini per-device).
3. Pindahkan perhitungan berat (dashboard/insight) ke endpoint server.
4. Proteksi sesi (validasi token, auto-logout saat kedaluwarsa).
5. Test untuk reducer, checkout POS, filter & perhitungan finance.
```
