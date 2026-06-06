# Dokumentasi Pengerjaan Web LAKU

Dokumentasi ini dibuat berdasarkan pembacaan struktur dan source code project `Laku-responsive`.
Project ini adalah aplikasi web manajemen toko/warung bernama LAKU, dengan fokus pada pengelolaan produk, transaksi kasir, catatan transaksi, dan insight bisnis sederhana.

## 1. Ringkasan Project

LAKU dibangun sebagai aplikasi frontend responsif untuk membantu pemilik toko kecil mengelola aktivitas harian. Aplikasi menyediakan pengalaman yang bisa dipakai di mobile, tablet, dan desktop.

Fitur utama yang tersedia:

- Login dan register akun.
- Mode demo jika backend belum tersedia.
- Dashboard ringkasan laba, kas, transaksi, dan target harian.
- Manajemen produk dan stok.
- Halaman kasir/POS dengan keranjang belanja.
- Riwayat transaksi dengan filter waktu.
- Halaman analisis/insight untuk omzet mingguan, produk terlaris, stok rendah, dan prediksi sederhana.
- Profil pengguna, update nama, dan logout.

## 2. Tech Stack

Project menggunakan stack berikut:

- React 19 untuk UI.
- TypeScript untuk type safety.
- Vite 7 sebagai dev server dan bundler.
- Tailwind CSS 3 untuk styling.
- React Router tersedia sebagai dependency, tetapi navigasi utama saat ini memakai state tab di context.
- Lucide React untuk ikon.
- Radix UI dan komponen shadcn-style tersedia di `src/components/ui`.
- Recharts tersedia sebagai dependency, meskipun chart omzet mingguan saat ini dibuat manual dengan div/Tailwind.
- `localStorage` untuk menyimpan user, token, dan target harian.

Script penting dari `package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run deploy
```

Konfigurasi deploy sudah diarahkan ke GitHub Pages:

- `homepage`: `https://laku-app.github.io/Laku-App/`
- Vite `base`: `/Laku-App/`
- Deploy command: `gh-pages -d dist`

## 3. Struktur Folder Utama

Struktur utama berada di folder `app`.

```txt
app/
  API.md
  PATHS.md
  info.md
  package.json
  vite.config.ts
  tailwind.config.js
  src/
    main.tsx
    App.tsx
    index.css
    context/
      AppContext.tsx
    pages/
      Login.tsx
      Dashboard.tsx
      Products.tsx
      POS.tsx
      Records.tsx
      Insights.tsx
    components/
      TopNav.tsx
      SideNav.tsx
      BottomNav.tsx
      ModalSheet.tsx
      Toast.tsx
      ui/
    hooks/
      use-mobile.ts
    lib/
      api.ts
      utils.ts
    types/
      index.ts
```

Peran folder:

- `src/pages`: halaman utama aplikasi.
- `src/components`: komponen layout dan komponen global.
- `src/components/ui`: komponen UI kecil/generic dari setup shadcn-style.
- `src/context`: state global aplikasi.
- `src/hooks`: hook responsif untuk mobile/tablet/desktop.
- `src/lib`: helper API dan utility.
- `src/types`: definisi tipe data TypeScript.

## 4. Entry Point dan Arsitektur Aplikasi

Entry point React berada di `src/main.tsx`.

Alur awal:

1. React melakukan render ke elemen `#root`.
2. Aplikasi dibungkus oleh `AppProvider`.
3. `AppProvider` menyediakan state global untuk seluruh komponen.
4. `App.tsx` menentukan apakah user sudah login.
5. Jika belum login, aplikasi menampilkan halaman `Login`.
6. Jika sudah login, aplikasi menampilkan layout utama dan halaman sesuai tab aktif.

`App.tsx` tidak memakai routing URL. Halaman dipilih dari `state.activeTab`:

- `dashboard` -> `Dashboard`
- `products` -> `Products`
- `pos` -> `POS`
- `records` -> `Records`
- `insights` -> `Insights`

Pendekatan ini membuat aplikasi terasa seperti single dashboard app. Navigasi antar halaman berjalan cepat karena hanya mengganti state tab.

## 5. State Management

State global berada di `src/context/AppContext.tsx` dan dikelola dengan `useReducer`.

Data utama:

- `products`: daftar produk.
- `transactions`: daftar transaksi.
- `cart`: item keranjang kasir.
- `activeTab`: halaman/menu aktif.
- `toast`: pesan feedback global.
- `user`: data user login.
- `dailyTarget`: target laba harian.
- `notifications`: data notifikasi lokal.

Tipe action penting:

- `SET_TAB`: pindah halaman.
- `ADD_PRODUCT`: tambah produk.
- `UPDATE_PRODUCT`: update produk.
- `DELETE_PRODUCT`: hapus produk.
- `ADD_TRANSACTION`: tambah transaksi.
- `ADJUST_STOCK`: tambah/kurangi stok sekaligus membuat transaksi stok.
- `ADD_TO_CART`: memasukkan produk ke keranjang.
- `UPDATE_CART_QTY`: tambah/kurangi kuantitas item keranjang.
- `CLEAR_CART`: kosongkan keranjang.
- `SHOW_TOAST` dan `HIDE_TOAST`: feedback global.
- `SET_USER`, `UPDATE_USER`, dan `LOGOUT`: autentikasi/profil.
- `SET_DAILY_TARGET`: update target harian.
- `ADD_NOTIFICATION`, `MARK_NOTIFICATION_READ`, dan `CLEAR_NOTIFICATIONS`: notifikasi lokal.

Data awal masih berupa dummy data di frontend:

- 8 produk awal.
- 12 transaksi awal.
- Target harian default `300000`.

Data user dan target harian dibaca dari `localStorage` saat aplikasi pertama dibuka.

## 6. Model Data

Definisi tipe berada di `src/types/index.ts`.

### Product

Produk menyimpan identitas barang, harga, stok, gambar opsional, dan tanggal dibuat.

Field utama:

- `id`
- `name`
- `price`
- `stock`
- `emoji`
- `image`
- `createdAt`

### Transaction

Transaksi dipakai untuk penjualan dan pembelian/penyesuaian stok.

Field utama:

- `id`
- `productId`
- `productName`
- `type`: `IN` atau `OUT`
- `qty`
- `totalPrice`
- `note`
- `createdAt`

Makna `type`:

- `OUT`: barang keluar/penjualan.
- `IN`: barang masuk/pembelian/restock.

### CartItem

Keranjang kasir berisi:

- `productId`
- `productName`
- `price`
- `qty`

## 7. Autentikasi dan Mode Demo

Halaman login berada di `src/pages/Login.tsx`.

Fitur autentikasi:

- Mode login.
- Mode register.
- Validasi input dasar.
- Toggle show/hide password.
- Loading state.
- Error state.
- Fallback demo mode.

Saat user submit form:

1. Frontend mencoba request ke API lewat `apiLogin` atau `apiRegister`.
2. Jika sukses, token disimpan lewat `saveToken`.
3. Data user disimpan ke context dan `localStorage`.
4. User diarahkan ke tab `dashboard`.
5. Jika request gagal karena network/backend belum aktif, aplikasi membuat user demo lokal.

Dengan fallback ini, aplikasi tetap bisa dipakai walaupun backend belum jalan.

## 8. Integrasi API

Layer API ada di `src/lib/api.ts`.

Base URL:

```ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

Endpoint helper yang sudah tersedia:

- `apiLogin(email, password)`
- `apiRegister(name, email, password)`
- `apiGetProducts()`
- `apiCreateProduct(payload)`
- `apiUpdateProduct(id, payload)`
- `apiDeleteProduct(id)`
- `apiGetTransactions()`
- `apiCreateTransaction(payload)`
- `saveToken(token)`
- `clearToken()`

Header Authorization otomatis ditambahkan jika token tersedia:

```txt
Authorization: Bearer <token>
```

Status integrasi saat ini:

- Login/register sudah mencoba API dan punya fallback demo.
- Product dan transaction helper sudah dibuat.
- Halaman produk, POS, dashboard, records, dan insights saat ini masih membaca/menulis data dari context lokal.
- Dokumen kontrak backend lengkap tersedia di `API.md`.

## 9. Layout Responsif

Responsivitas dikendalikan oleh hook di `src/hooks/use-mobile.ts`.

Breakpoint:

- Mobile: kurang dari 768 px.
- Tablet: 768 px sampai kurang dari 1024 px.
- Desktop: 1024 px ke atas.

Layout utama:

- Mobile memakai `TopNav` dan `BottomNav`.
- Tablet/desktop memakai `SideNav` dan `TopNav`.
- Konten utama menyesuaikan halaman aktif.

`ModalSheet` juga responsif:

- Mobile tampil sebagai bottom sheet.
- Tablet/desktop tampil sebagai dialog di tengah layar.

## 10. Navigasi

Navigasi utama menggunakan `TabType`:

```ts
export type TabType = 'dashboard' | 'products' | 'pos' | 'records' | 'insights';
```

Komponen navigasi:

- `TopNav`: header atas, judul halaman, tombol notifikasi, tombol profil.
- `BottomNav`: navigasi bawah untuk mobile.
- `SideNav`: navigasi samping untuk tablet/desktop.

Menu yang tersedia:

- Dashboard
- Stok Barang
- Kasir
- Catatan
- Analisis AI

Tombol Kasir dibuat lebih menonjol terutama di mobile karena POS adalah workflow utama aplikasi.

## 11. Dokumentasi Fitur Per Halaman

### 11.1 Login

File: `src/pages/Login.tsx`

Fungsi:

- Menampilkan form login/register.
- Melakukan validasi input.
- Memanggil API auth.
- Menyimpan token dan user.
- Menyediakan demo mode saat backend belum aktif.

Mobile dan desktop punya layout visual berbeda:

- Mobile memakai background gradient penuh dan form card.
- Desktop memakai split layout branding kiri dan form kanan.

### 11.2 Dashboard

File: `src/pages/Dashboard.tsx`

Fungsi:

- Menampilkan nama toko/user.
- Menampilkan tanggal hari ini.
- Menghitung transaksi hari ini.
- Menghitung omzet, biaya, laba, kas di tangan, dan progres target.
- Menyediakan edit target harian.
- Menampilkan transaksi terbaru.
- Membuka modal detail kas, transaksi, dan daftar transaksi penuh.

Rumus yang dipakai:

- `todayRevenue`: total transaksi `OUT` hari ini.
- `todayExpense`: total absolut transaksi `IN` hari ini.
- `todayProfit`: `todayRevenue - todayExpense * 0.2`.
- `cashOnHand`: `1200000 + todayRevenue - todayExpense`.
- `targetProgress`: persentase laba terhadap target harian.

Catatan:

- Saldo awal kas masih hardcoded di komponen.
- Rumus laba masih simulasi dan belum memakai HPP per produk.

### 11.3 Products / Stok Barang

File: `src/pages/Products.tsx`

Fungsi:

- Menampilkan daftar produk.
- Search produk berdasarkan nama.
- Tambah produk.
- Edit produk.
- Hapus produk.
- Upload gambar produk sebagai base64.
- Atur stok dengan mode tambah/kurangi.
- Menampilkan status stok:
  - Habis.
  - Hampir Habis.
  - Tersedia.

Tampilan responsif:

- Desktop memakai table layout.
- Mobile memakai card grid dan floating action button untuk tambah produk.

Alur tambah produk:

1. User membuka form tambah.
2. Mengisi nama, harga, stok, dan gambar opsional.
3. Produk baru dibuat di context.
4. Toast menampilkan feedback sukses.

Alur atur stok:

1. User memilih produk.
2. Pilih tambah atau kurangi.
3. Masukkan jumlah.
4. Context menjalankan `ADJUST_STOCK`.
5. Stok produk berubah.
6. Transaksi stok otomatis ditambahkan.

### 11.4 POS / Kasir

File: `src/pages/POS.tsx`

Fungsi:

- Menampilkan produk yang stoknya masih tersedia.
- Search produk.
- Tambah produk ke keranjang.
- Mengatur kuantitas item keranjang.
- Validasi stok sebelum menambahkan item atau checkout.
- Mengosongkan keranjang.
- Checkout transaksi.

Alur checkout:

1. User memilih produk ke keranjang.
2. User menyesuaikan jumlah.
3. Sistem mengecek stok tiap item.
4. Saat bayar, sistem membuat transaksi `OUT` untuk tiap item.
5. Stok produk dikurangi.
6. Keranjang dikosongkan.
7. Toast menampilkan total pembayaran.

Catatan:

- Checkout masih berjalan di frontend lokal.
- Belum ada input metode pembayaran, diskon, pajak, uang diterima, atau kembalian.
- Satu checkout multi-item menghasilkan beberapa transaksi `OUT` dengan note yang sama.

### 11.5 Records / Catatan

File: `src/pages/Records.tsx`

Fungsi:

- Menampilkan riwayat transaksi.
- Filter berdasarkan:
  - Hari ini.
  - Kemarin.
  - 7 hari.
  - 30 hari.
- Menghitung omzet, biaya, laba, dan jumlah transaksi sesuai filter.
- Mengelompokkan transaksi berdasarkan tanggal.
- Menampilkan label transaksi `JUAL` untuk `OUT` dan `BELI` untuk `IN`.

Rumus laporan:

- `revenue`: total transaksi `OUT`.
- `expense`: total absolut transaksi `IN`.
- `profit`: `revenue - expense * 0.2`.
- `transactionCount`: jumlah transaksi hasil filter.

### 11.6 Insights / Analisis AI

File: `src/pages/Insights.tsx`

Fungsi:

- Menampilkan total SKU.
- Menampilkan produk terlaris berdasarkan jumlah transaksi `OUT`.
- Menampilkan total transaksi.
- Menampilkan jumlah produk stok rendah/habis.
- Menampilkan chart omzet 7 hari terakhir.
- Menampilkan peringatan stok rendah dan stok habis.
- Menampilkan prediksi belanja minggu depan.
- Menampilkan prediksi omzet minggu depan.

Perhitungan:

- Best seller dihitung dari akumulasi `qty` transaksi `OUT` per nama produk.
- Omzet mingguan dihitung dari transaksi `OUT` selama 7 hari terakhir.
- Stok rendah adalah produk dengan stok `<= 5` dan `> 0`.
- Stok habis adalah produk dengan stok `0`.

Catatan:

- Prediksi belanja masih berupa data statis.
- Prediksi omzet juga masih statis.
- Label "AI" saat ini lebih sebagai simulasi fitur insight, belum terhubung ke model AI atau backend analitik.

## 12. Komponen Pendukung

### ModalSheet

File: `src/components/ModalSheet.tsx`

Dipakai untuk:

- Detail dashboard.
- Form produk.
- Atur stok.
- Profil pengguna.

Behavior:

- Lock body scroll ketika modal terbuka.
- Klik overlay menutup modal.
- Mobile tampil bottom sheet.
- Desktop tampil centered dialog.

### Toast

File: `src/components/Toast.tsx`

Dipakai untuk feedback singkat seperti:

- Login berhasil.
- Produk ditambahkan.
- Stok tidak mencukupi.
- Checkout berhasil.
- Profil diperbarui.

Toast mengambil data dari `state.toast`.

### TopNav

File: `src/components/TopNav.tsx`

Fungsi:

- Menampilkan brand/title halaman.
- Menampilkan subtitle sesuai tab.
- Menampilkan tombol notifikasi.
- Membuka modal profil.
- Update nama profil.
- Logout.

### SideNav

File: `src/components/SideNav.tsx`

Fungsi:

- Navigasi tablet/desktop.
- Menampilkan logo LAKU.
- Menampilkan menu utama.
- Menampilkan profil user di bagian bawah.
- Pada tablet, sidebar berubah menjadi versi compact icon-only.

### BottomNav

File: `src/components/BottomNav.tsx`

Fungsi:

- Navigasi mobile.
- Menampilkan 5 menu utama.
- Tombol Kasir dibuat floating/lebih besar sebagai aksi utama.

## 13. Styling dan Design System

Styling utama berada di `src/index.css` dan Tailwind config.

Karakter visual:

- Warna utama biru LAKU: `#1A56DB`.
- Biru gelap: `#1340b8`.
- Aksen oranye: `#F97316`.
- Hijau untuk sukses/penjualan.
- Merah untuk error/stok habis/biaya.
- Background terang untuk dashboard.
- Card dengan shadow halus.
- Rounded card dan tombol konsisten.
- Animasi `fadeUp`, `slideUp`, `fadeIn`, `pulseRing`, dan `shimmer`.

CSS variable penting:

- `--laku-blue`
- `--laku-blue-dark`
- `--laku-orange`
- `--laku-bg`
- `--laku-gray-*`
- `--laku-green`
- `--laku-red`

Project juga memakai utility custom:

- `.scrollbar-hide`
- `.card-shadow`
- `.card-shadow-hover`
- `.stat-blue-shadow`
- `.stat-orange-shadow`
- `.animate-fade-up`
- `.modal-overlay`
- `.modal-sheet`

## 14. Alur Data Utama

### Alur login

```txt
Login form
  -> apiLogin/apiRegister
  -> saveToken
  -> login(user)
  -> SET_TAB dashboard
  -> App menampilkan layout utama
```

Jika backend tidak aktif:

```txt
Login form
  -> request gagal karena network
  -> buat user demo
  -> login(user demo)
  -> aplikasi tetap bisa dipakai
```

### Alur tambah produk

```txt
Products
  -> Form tambah produk
  -> dispatch ADD_PRODUCT
  -> products di context bertambah
  -> UI list produk update
```

### Alur atur stok

```txt
Products
  -> Modal atur stok
  -> dispatch ADJUST_STOCK
  -> stok produk berubah
  -> transaction IN/OUT dibuat
  -> Dashboard/Records/Insights ikut berubah
```

### Alur checkout POS

```txt
POS
  -> pilih produk
  -> ADD_TO_CART
  -> update qty
  -> checkout
  -> validasi stok
  -> ADD_TRANSACTION per item
  -> UPDATE_PRODUCT untuk kurangi stok
  -> CLEAR_CART
```

### Alur laporan dan insight

```txt
transactions + products dari context
  -> dihitung dengan useMemo
  -> Dashboard/Records/Insights menampilkan hasil terbaru
```

## 15. Cara Menjalankan Project

Dari folder `app`:

```bash
npm install
npm run dev
```

Default dev server diatur pada port `3000`.

Untuk build production:

```bash
npm run build
```

Untuk preview hasil build:

```bash
npm run preview
```

Untuk deploy ke GitHub Pages:

```bash
npm run deploy
```

## 16. Environment Variable

Frontend mendukung konfigurasi API URL lewat:

```env
VITE_API_URL=http://localhost:3001/api
```

Jika variable tersebut tidak ada, frontend memakai fallback:

```txt
http://localhost:3001/api
```

## 17. Status Pengerjaan Saat Ini

Yang sudah berjalan:

- UI utama responsif mobile/tablet/desktop.
- Login/register dengan fallback demo.
- Navigasi antar menu.
- CRUD produk lokal.
- Upload gambar produk lokal/base64.
- Penyesuaian stok.
- POS dan checkout lokal.
- Riwayat transaksi.
- Dashboard ringkasan.
- Insight dasar dan chart omzet mingguan.
- Modal dan toast global.
- Layer API awal.
- Dokumentasi API backend awal.
- Konfigurasi GitHub Pages.

Yang masih simulasi/lokal:

- Penyimpanan produk dan transaksi belum persisted ke backend.
- Prediksi AI masih statis.
- Notifikasi masih toast sederhana dan belum memakai data nyata.
- Profit belum memakai struktur HPP/margin produk.
- Kas awal masih hardcoded.

## 18. Rekomendasi Pengembangan Lanjutan

Prioritas lanjutan yang disarankan:

1. Integrasikan halaman Products dengan API backend.
2. Integrasikan POS checkout dengan endpoint transaksi backend.
3. Simpan dan ambil transaksi dari backend.
4. Buat endpoint dashboard stats agar perhitungan tidak hanya di frontend.
5. Tambahkan field modal produk seperti harga modal/HPP untuk laba yang lebih akurat.
6. Tambahkan metode pembayaran, uang diterima, dan kembalian di POS.
7. Tambahkan export laporan transaksi ke CSV/PDF.
8. Ganti prediksi statis di Insights dengan perhitungan berbasis data transaksi nyata.
9. Tambahkan proteksi route/session check dari token.
10. Tambahkan test untuk reducer, checkout, dan filter transaksi.

## 19. Catatan Teknis Penting

- Aplikasi memakai state lokal, jadi data produk/transaksi reset saat browser reload kecuali data yang memang disimpan di `localStorage`.
- User dan daily target tersimpan di `localStorage`.
- Token auth disimpan di `localStorage`.
- `AppContext` adalah pusat perubahan data. Jika fitur baru butuh mengubah produk, transaksi, cart, atau user, cek reducer di `AppContext.tsx`.
- Karena navigasi memakai `activeTab`, penambahan halaman baru perlu update:
  - `TabType` di `src/types/index.ts`.
  - `renderPage` di `src/App.tsx`.
  - daftar menu di `TopNav`, `SideNav`, dan/atau `BottomNav`.
- API helper sudah tersedia, tetapi perlu dipanggil dari halaman agar data benar-benar tersinkronisasi dengan backend.

## 20. Kesimpulan

LAKU saat ini sudah menjadi prototype frontend yang cukup lengkap untuk aplikasi manajemen warung. Secara UI dan flow, aplikasi sudah mencakup aktivitas utama: login, melihat ringkasan bisnis, mengelola stok, melakukan penjualan lewat kasir, membaca riwayat transaksi, dan melihat insight sederhana.

Tahap berikutnya yang paling penting adalah menghubungkan seluruh data produk/transaksi ke backend agar aplikasi bisa dipakai sebagai sistem nyata, bukan hanya demo lokal.
