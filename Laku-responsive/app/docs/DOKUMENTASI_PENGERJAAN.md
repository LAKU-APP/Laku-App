# Dokumentasi Pengerjaan Web LAKU

LAKU adalah aplikasi web manajemen toko/warung untuk UMKM: kelola produk & stok,
kasir (POS), catatan transaksi, dan insight bisnis. Dirancang responsif penuh dari
layar HP kecil (mis. iPhone SE) sampai desktop/iPad besar.

Dokumen ini menjelaskan kondisi project **saat ini** berdasarkan source code aktual.
Untuk kontrak endpoint backend, lihat `API.md`. Untuk ringkasan cepat + class
diagram + use case + known issues (cocok untuk sesi AI/kontributor baru), lihat
[`CODEBASE_GUIDE.md`](./CODEBASE_GUIDE.md) — dokumen ini berisi detail
per-halaman/komponen yang lebih panjang.

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

> Peta lengkap & lebih detail ada di [`PATHS.md`](./PATHS.md). Ringkasan:

```txt
app/
  docs/                      # dokumentasi (API.md, CODEBASE_GUIDE.md, dst.)
  vite.config.ts             # base '/Laku-App/', port 3000
  src/
    main.tsx                 # entry: StrictMode > ErrorBoundary > AppProvider > App
    App.tsx                  # splash, gating login/onboarding, layout mobile vs desktop
    styles/                  # globals.css, variables.css, themes.css, animations.css
    context/
      AppContext.tsx         # state global (useReducer) + persistensi localStorage
      AuthContext.tsx, ThemeContext.tsx   # scaffolding, belum dipakai
    pages/
      Auth/LoginPage.tsx (+ RegisterPage.tsx)
      Onboarding/OnboardingPage.tsx
      Dashboard/DashboardPage.tsx
      Products/ProductsPage.tsx (+ ProductCard.tsx, ProductForm.tsx)
      POS/POSPage.tsx (+ Cart.tsx, Checkout.tsx)
      Records/RecordsPage.tsx
      Insights/InsightsPage.tsx
      Settings/SettingsPage.tsx
    components/
      navigation/  TopNav.tsx SideNav.tsx BottomNav.tsx
      modals/      ModalSheet.tsx
      feedback/    Toast.tsx ErrorBoundary.tsx
      branding/    Splash.tsx LakuLogo.tsx LakuWordmark.tsx
      ui/                    # komponen generic shadcn-style
    services/
      auth/authService.ts    # auth demo: register/login/onboarding/kontak akun
      storage/storage.ts     # wrapper aman localStorage
      api/, notification/, analytics/   # scaffolding, belum terhubung
    hooks/
      useMobile.ts           # useIsMobile / useIsTablet / useIsDesktop
      useDebounce.ts, useLocalStorage.ts, useOnlineStatus.ts
    utils/
      currency.ts            # SATU sumber kebenaran perhitungan uang
      date.ts, formatter.ts, helpers.ts (cn(), generateId()), feedback.ts, string.ts
    constants/
      storageKeys.ts, routes.ts, roles.ts, permissions.ts
    types/
      auth.ts, user.ts, product.ts, transaction.ts, index.ts (barrel @/types)
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
disimpan otomatis ke `localStorage` lewat `src/services/storage/storage.ts`
(`readStorage` / `writeStorage` / `removeStorage`). Saat boot, state dipulihkan
dari `localStorage`; data contoh hanya muncul saat pertama kali dibuka.

> `UPDATE_USER` payload-nya `{ name?, email?, phone?, image? }` — dipakai juga
> oleh fitur ubah email/HP di Pengaturan → Akun (lihat §8 & §9.7).

---

## 6. Model Data (`src/types/`)

> `src/types/index.ts` adalah **barrel** yang re-export dari `auth.ts`, `user.ts`,
> `product.ts`, `transaction.ts` — bukan satu file tipe tunggal. Impor lewat
> `@/types`. Lihat juga class diagram lengkap di `CODEBASE_GUIDE.md`.

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

## 7. Perhitungan Uang (`src/utils/currency.ts`)

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
User baru : Buat Akun (email DAN/ATAU nomor HP) → kembali ke Login → Login
            → Langkah pengenalan (nama toko; nomor HP auto-terisi dari akun)
            → Masuk aplikasi
User lama : Login (email ATAU nomor HP) → Masuk aplikasi (onboarding dilewati)
```

- **Login & register menerima email ATAU nomor HP Indonesia** sebagai identifier
  (`isPhoneNumber()` / `normalizePhone()` di `authService.ts` mendeteksi & menormalkan
  ke format `62xxx`). Akun boleh dibuat dengan salah satu atau keduanya.
- **Register tidak auto-login.** Setelah `apiRegister` sukses, UI kembali ke mode
  **Login** dengan identifier terisi otomatis dan menampilkan toast "Akun berhasil
  dibuat! Silakan login...". (`src/pages/Auth/LoginPage.tsx`)
- Saat login, response auth membawa `user.onboardingCompleted`:
  - `false` → `restartOnboarding()` (tampilkan langkah pengenalan).
  - `true`  → langsung masuk aplikasi.
- **Status onboarding disimpan PADA akun terdaftar** (`StoredAccount.onboardingCompleted`,
  key `registeredAccounts`), dicocokkan lewat email atau nomor HP — bukan lagi
  daftar email terpisah. Saat onboarding selesai, `completeOnboarding()` menyimpan
  `hasSeenOnboarding=true` dan memanggil `apiCompleteOnboarding(user.email || user.phone)`
  agar login berikutnya (dengan identifier mana pun yang dipakai akun itu) tidak mengulang.
- Pada langkah pengenalan, field nomor HP toko **tidak diminta ulang** — diisi otomatis
  dari `state.user.phone` (lihat `OnboardingPage.tsx` → `commitStep()`).
- **Mode Demo (Admin)** — tombol "Masuk Demo" selalu memutar ulang onboarding
  (`restartOnboarding()`); login manual dengan kredensial demo memakai status
  onboarding fallback (lihat di bawah).
- **Pengaturan → Akun** kini bisa menambah/mengubah email & nomor HP akun yang
  sedang login lewat `apiUpdateContact()` (validasi format + cek duplikat di akun
  lain/akun demo). Nomor HP yang disimpan ikut disalin ke `storeSettings.storePhone`.

### Demo Mode (`src/services/auth/authService.ts`)
Karena backend belum ada, auth berjalan lokal. Ada dua kategori akun:
- **Akun demo bawaan** (`admin@laku.id`/`admin123`, `demo@laku.id`/`demo123`,
  masing-masing juga punya nomor HP demo) — tidak tersimpan di `registeredAccounts`,
  statusnya pakai fallback `localStorage` key `onboardedEmails`.
- **Akun terdaftar** (hasil "Buat Akun") — tersimpan di `registeredAccounts` lengkap
  dengan `onboardingCompleted` per akun.

Token disimpan di key `token`. Saat backend siap, fungsi-fungsi di `authService.ts`
diganti `fetch` sesuai `API.md` (termasuk endpoint baru untuk `apiUpdateContact`).

---

## 9. Halaman

### 9.1 Login/Register (`pages/Auth/LoginPage.tsx`, `RegisterPage.tsx`)
Form login/register dengan validasi (email **atau** nomor HP), show/hide password,
loading & error state, tombol Demo (Admin) memakai ikon (bukan emoji). Mobile:
background gradient + card. Desktop: split branding kiri + form kanan.

### 9.2 Dashboard (`pages/Dashboard/DashboardPage.tsx`)
Menampilkan laba hari ini, kas di tangan, omzet, biaya, progres target, transaksi
terbaru, edit target harian, dan modal detail. Semua angka dari `utils/currency.ts`
(kas pakai `initialCash` dari Pengaturan, laba pakai HPP — bukan rumus lama).

### 9.3 Produk/Stok (`pages/Products/ProductsPage.tsx`)
CRUD produk + harga modal + kategori + foto (base64, maks 2MB), cari, urut
(Terbaru/Nama/Harga/Stok), filter kategori, atur stok (IN/OUT), status stok
(Habis/Hampir Habis/Tersedia), estimasi laba per unit saat mengisi harga.
Desktop = tabel, Mobile = grid kartu + FAB. Konfirmasi sebelum hapus.

### 9.4 POS/Kasir (`pages/POS/POSPage.tsx`)
Pilih produk → keranjang → atur qty (validasi stok) → checkout dengan metode
pembayaran, diskon, uang diterima & kembalian → buat transaksi `OUT` per item,
kurangi stok, simpan **struk** (bisa dicetak/diunduh).

### 9.5 Catatan (`pages/Records/RecordsPage.tsx`)
Riwayat transaksi dengan filter (Hari ini/Kemarin/7/30 hari), ringkasan omzet,
biaya, laba (via `utils/currency.ts`), jumlah transaksi, dikelompokkan per tanggal,
label `JUAL`/`BELI`.

### 9.6 Insight (`pages/Insights/InsightsPage.tsx`)
- Kartu ringkasan: Total SKU, Terlaris, Transaksi, Stok Rendah.
- **Grafik omzet interaktif** (komponen `SalesChart`): toggle **7 Hari / 30 Hari**,
  batang bisa **diketuk** untuk melihat rincian **Pemasukan / Pengeluaran / Laba**
  hari itu + daftar transaksinya. Mode 30 hari bisa di-scroll horizontal.
- **AI Prediction**: kartu prediksi omzet minggu depan (heuristik dari rata-rata
  omzet 7 hari + momentum, dengan confidence) dan **Prediksi Belanja** (rekomendasi
  restock per produk dari kecepatan penjualan). Tampil **di mobile maupun desktop**.

### 9.7 Pengaturan (`pages/Settings/SettingsPage.tsx`)
Disusun sebagai **accordion per-kategori** (buka satu-satu agar tidak perlu scroll
panjang): Profil Toko, Operasional, Notifikasi, Kategori, Data (backup/restore JSON,
reset demo/kosong), **Akun** (editable: Email & Nomor HP + tombol "Simpan Email &
Nomor" yang memanggil `apiUpdateContact()`, plus logout). Tombol **Simpan** utama
berada di paling bawah.

---

## 10. Komponen Pendukung

- **Onboarding** (`pages/Onboarding/OnboardingPage.tsx`): langkah pengenalan untuk
  akun baru, termasuk setup nama toko & target (nomor HP **tidak** ditanya ulang —
  auto-terisi dari `state.user.phone`). Tiap slide memakai **tinggi tetap**
  (`min(64vh,500px)`) + scroll internal sehingga tombol navigasi tidak
  "lompat-lompat" antar slide.
- **Splash** (`components/branding/Splash.tsx`): animasi loading "laku" + titik berdenyut.
- **LakuLogo** (`components/branding/LakuLogo.tsx`): logo tas belanja + garis tren naik.
- **ErrorBoundary** (`components/feedback/ErrorBoundary.tsx`): menangkap error render global.
- **TopNav** (`components/navigation/TopNav.tsx`): judul halaman, notifikasi (item
  bisa diklik & dibaca), popup profil ("Buka Pengaturan", tanpa tombol logout ganda).
- **SideNav** (`components/navigation/SideNav.tsx`): navigasi tablet/desktop; baris
  profil bawah bersifat info (tidak diklik).
- **BottomNav** (`components/navigation/BottomNav.tsx`): navigasi mobile
  (Dashboard/Stok/Kasir/Catatan/Insight), tombol Kasir menonjol; tanpa garis
  indikator di atas ikon.
- **ModalSheet** (`components/modals/ModalSheet.tsx`): bottom sheet di mobile,
  dialog tengah di desktop; breakpoint reaktif, tutup via overlay/Escape.
- **Toast** (`components/feedback/Toast.tsx`): feedback singkat global.

---

## 11. Responsivitas

Breakpoint via `hooks/useMobile.ts`: Mobile `<768`, Tablet `768–1023`, Desktop `≥1024`.

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
`registeredAccounts` (akun hasil "Buat Akun", lengkap dengan `onboardingCompleted`
per akun — sumber utama status onboarding), serta `onboardedEmails` (fallback
status onboarding khusus **akun demo bawaan**, yang tidak tersimpan di
`registeredAccounts`).

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
8. **Restrukturisasi folder**: `src/lib/*` dipecah menjadi `src/services/`
   (`auth/authService.ts`, `storage/storage.ts`), `src/utils/` (`currency.ts`,
   dst.), dan `src/types/` (per-domain + barrel). Halaman dipindah ke
   subfolder per-fitur (`pages/Auth/`, `pages/Dashboard/`, dst.).
9. **Login/register dual-identifier**: bisa pakai email **atau** nomor HP
   Indonesia (deteksi & normalisasi otomatis). Status onboarding kini disimpan
   per akun terdaftar (`registeredAccounts[].onboardingCompleted`), bukan cuma
   daftar email — jadi tidak terulang baik login pakai email maupun HP.
10. **Onboarding tidak minta nomor HP lagi**: langkah setup toko otomatis
    mengambil nomor HP dari akun yang login.
11. **Pengaturan → Akun jadi bisa diedit**: tambah/ubah email & nomor HP lewat
    `apiUpdateContact()`, otomatis tersinkron ke `storeSettings.storePhone`.

---

## 15. Status & Pengembangan Lanjutan

> Untuk daftar known issues/keterbatasan yang lebih lengkap (termasuk duplikasi
> tipe `AuthResponse` dan catatan RBAC), lihat `CODEBASE_GUIDE.md` §7.

**Sudah berjalan:** UI responsif penuh, auth + onboarding dual-identifier
(email/HP, anti-ulang per akun), kelola kontak akun di Pengaturan, CRUD produk,
POS + struk, catatan, dashboard & insight dengan perhitungan konsisten, persistensi
localStorage, backup/restore, pengaturan lengkap.

**Masih lokal/simulasi:** belum ada backend (data di `localStorage`, password
tidak di-hash — sengaja untuk Demo Mode); prediksi "AI" masih heuristik berbasis
data transaksi (belum model ML); dark mode disiapkan tapi belum diekspos di UI;
RBAC (`owner`/`cashier`) ada di tipe tapi belum ditegakkan di UI.

**Prioritas selanjutnya:**
1. Implementasi backend sesuai `API.md` dan ganti `src/services/auth/authService.ts`
   dari demo ke `fetch` (termasuk endpoint baru untuk `apiUpdateContact`).
2. Sinkronisasi produk/transaksi/pengaturan ke server (saat ini per-device).
3. Pindahkan perhitungan berat (dashboard/insight) ke endpoint server.
4. Proteksi sesi (validasi token, auto-logout saat kedaluwarsa).
5. Test untuk reducer, checkout POS, filter & perhitungan currency.
```
