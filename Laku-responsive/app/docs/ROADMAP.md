# 🔍 Analisis Fitur LAKU — Status Realisasi

> Dokumen ini awalnya berisi daftar fitur yang **kurang**. Setelah beberapa iterasi
> pengerjaan, sebagian besar sudah **selesai**. Daftar di bawah dibagi dua:
> **✅ Sudah Selesai** (dengan catatan update terbaru) dan **⬜ Belum Direalisasikan**.
>
> Update terakhir: alur auth baru (register → login → onboarding), grafik omzet
> interaktif, dan perbaikan scroll desktop.

---

## 📊 Ringkasan Status

| Status | Jumlah | Keterangan |
|--------|--------|------------|
| ✅ Selesai | 19 | Fitur Critical, High, dan sebagian Medium/Low sudah jalan |
| 🟡 Sebagian | 1 | Keyboard shortcut (baru Esc-tutup-modal) |
| ⬜ Belum | 4 | Skeleton (ditunda), dark mode toggle, pagination, i18n |
| 🔵 Future | 6 | Fitur scale-up bisnis (belum dikerjakan, memang lingkup lanjut) |

---

## ✅ SUDAH SELESAI (Update Terbaru)

### 🔴 Critical

**1. Data Persistence** — ✅ Selesai
Semua data inti auto-save ke `localStorage`. Wrapper aman di `src/lib/storage.ts`
(`readStorage/writeStorage/removeStorage`), dipanggil per-slice di `AppContext.tsx`
(produk, transaksi, keranjang, struk, kategori, user, target, pengaturan, onboarding).
Refresh tidak lagi menghilangkan data.

**2. Konfirmasi Hapus Produk** — ✅ Selesai
Modal konfirmasi ("Produk akan dihapus permanen...") sebelum hapus di `Products.tsx`
(state `confirmDelete`). Aman dari salah klik.

**3. Validasi Input Harga & Stok** — ✅ Selesai
`parseNonNegativeInt()` + `validateForm()` di `Products.tsx`: tolak input huruf/NaN,
harga harus > 0, stok ≥ 0, modal valid; error tampil via toast.

**4. Empty State Informatif** — ✅ Selesai
Empty state dengan ikon + teks panduan ("Tidak ada produk / Tambahkan produk baru")
di Products & Records; FAB (mobile) dan tombol "Tambah Produk" sebagai CTA.

### 🟠 High Priority

**5. Sistem Notifikasi Berfungsi** — ✅ Selesai
`notifications` di-generate otomatis dari data nyata: stok rendah/habis & target laba
tercapai (mengikuti toggle `notifLowStock`/`notifTarget` di Pengaturan). Di `TopNav`,
item notifikasi **bisa diklik, dibaca, dan ditandai sudah dibaca**.

**6. Perhitungan Laba Akurat** — ✅ Selesai
Dipindah ke `src/lib/finance.ts` sebagai sumber tunggal. Laba kotor = `harga jual −
harga modal (costPrice) × qty`. Angka ajaib `× 0.2` **dihapus**. Dashboard, Records,
dan Insights kini memakai fungsi yang sama → angka konsisten.

**7. Kas di Tangan Akurat** — ✅ Selesai
Saldo awal (`initialCash`) bisa diatur di Pengaturan. `calcCashOnHand = saldo awal +
omzet − pengeluaran`. Tidak ada lagi angka 1,2 juta hardcoded yang inkonsisten.

**8. Search/Filter di Records** — ✅ Selesai
`Records.tsx` punya pencarian nama produk + filter tipe (Semua / JUAL / BELI) +
filter waktu (Hari ini / Kemarin / 7 / 30 hari) dengan ringkasan ikut menyesuaikan.

**9. Prediksi AI Berbasis Data** — ✅ Selesai
`Insights.tsx` menghitung dari transaksi nyata: rekomendasi restock dari kecepatan
jual 7 hari terakhir, dan prakiraan omzet minggu depan dari rata-rata harian +
momentum (dibatasi ±30%) + tingkat confidence. Tidak ada lagi angka statis.

**10. Halaman Settings/Pengaturan** — ✅ Selesai
`Settings.tsx` baru: accordion per-kategori (Profil Toko, Operasional, Notifikasi,
Kategori, Data, Akun) + tombol **Simpan** di paling bawah.

### 🟡 Medium

**11. Kategori Produk** — ✅ Selesai
Field `category` di Product; filter chip kategori di Products; kelola kategori
(tambah/hapus) di Pengaturan.

**12. Harga Beli vs Harga Jual** — ✅ Selesai
Field `costPrice` ditambahkan. Form produk menampilkan estimasi laba per unit.
Dipakai untuk perhitungan laba di `finance.ts`.

**13. Diskon di POS** — ✅ Selesai
Input diskon (nominal) saat checkout, ikut tersimpan di transaksi & struk.

**14. Metode Pembayaran** — ✅ Selesai
Pilihan `cash / transfer / qris` + input uang diterima & perhitungan kembalian.

**15. Riwayat Struk (Receipt History)** — ✅ Selesai
Semua struk disimpan (`receipts[]` / `ReceiptSnapshot`), bisa dibuka & dicetak ulang.

**17. Error Boundary** — ✅ Selesai
`ErrorBoundary.tsx` membungkus aplikasi di `main.tsx` → crash tampil ramah, bukan
layar putih.

### 🟢 Low

**19. Sortir Produk** — ✅ Selesai
Dropdown urutan: Terbaru / Nama A-Z / Harga / Stok di `Products.tsx`.

**22. Feedback Haptic / Sound** — ✅ Selesai
Bunyi konfirmasi (Web Audio) + getaran (`navigator.vibrate`) saat checkout berhasil,
via `utils/feedback.ts`.

**23. PWA Support (Install di HP)** — ✅ Selesai
`manifest.webmanifest` + ikon (192/512/maskable, apple-touch, favicon dari aset
`src/assets/logos`) + **service worker network-first** (`public/sw.js`, anti
stale-cache, hanya aktif di produksi). Bisa di-install di Android & iOS.

### ➕ Bonus (di luar daftar awal)

- **Logo & wordmark baru**: ikon dari `laku.svg`, wordmark "LAKU" (L `#1E50DC`,
  "AKU" putih) font **Sora** dipakai konsisten (login, splash, sidenav, topnav).
- **Validasi login** ditegakkan: password salah / email belum terdaftar kini ditolak
  (akun terdaftar tersimpan lokal di `services/auth/authService.ts`).
- **Login email ATAU nomor HP**; onboarding selesai tersimpan di akun (anti-ulang);
  email/HP bisa ditambah/diubah di Pengaturan → Akun.
- **Logout** dipindah ke tombol yang selalu terlihat di paling bawah Pengaturan.
- **Onboarding bertahap** untuk akun baru (`Onboarding.tsx`) dengan tinggi slide
  konsisten (anti layout-shift) + setup toko/target.
- **Alur auth baru**: register tidak lagi auto-masuk → kembali ke Login → onboarding
  → masuk; user lama langsung masuk (via `onboardingCompleted`).
- **Splash screen** "laku..." (`Splash.tsx`) + **logo baru** (`LakuLogo.tsx`).
- **Grafik omzet interaktif** (7/30 hari, ketuk batang → rincian pemasukan/
  pengeluaran/laba + daftar transaksi hari itu).
- **Perbaikan scroll desktop** (pola `min-h-0` pada container halaman).
- **Backup/Restore data** (ekspor-impor JSON) + reset data demo/kosong di Pengaturan.

---

## ⬜ BELUM DIREALISASIKAN

### 🟡 Medium

**16. Loading / Skeleton States** — ⬜ Belum (sengaja ditunda)
Data dimuat instan dari `localStorage`, jadi skeleton sekarang akan artificial
(menambah delay palsu = UX lebih buruk). Ditunda sampai integrasi backend (saat data
di-fetch async) agar bermakna. Util `.animate-shimmer` sudah ada di `styles/animations.css`.

### 🟢 Low

**18. Dark Mode Toggle** — ⬜ Belum (sengaja ditunda)
Field `darkMode` sudah ada di settings, tapi toggle **belum diekspos di UI**. Alasan:
UI memakai warna hex langsung (bukan token CSS), jadi mengaktifkan toggle sekarang
akan menghasilkan dark mode yang tidak berfungsi penuh. Perlu refactor warna ke
token dulu sebelum diaktifkan.

**20. Pagination / Infinite Scroll di Records** — ⬜ Belum
Semua transaksi masih dirender sekaligus. Untuk data ribuan perlu virtual scroll
atau pagination (10–20/halaman).

**21. Keyboard Shortcuts** — 🟡 Sebagian
Sudah: `Esc` menutup modal (`ModalSheet.tsx`). Belum: `Ctrl+N` (tambah produk),
`Ctrl+K` (search) sebagai global handler di `App.tsx`.

**24. Multi-language (i18n)** — ⬜ Belum
Semua teks masih hardcoded Bahasa Indonesia. Belum ada struktur i18n.

---

## 🔵 FUTURE — Fitur Advanced (belum dikerjakan, lingkup lanjutan)

| # | Fitur | Catatan |
|---|-------|---------|
| 25 | Multi-Outlet / Multi-User | Satu user banyak toko, data terpisah |
| 26 | Barcode Scanner | Scan barcode via kamera HP untuk input cepat di POS |
| 27 | Laporan Bulanan Auto-Generate | Auto PDF tiap akhir bulan (chart + summary) |
| 28 | Supplier Management | Data supplier, riwayat beli, saran restock |
| 29 | Customer Database | Data pelanggan + loyalti sederhana |
| 30 | Sync ke Cloud / Backup Online | Backup ke Firebase/Supabase, multi-device |

> Catatan: backup/restore **lokal** (file JSON) sudah ada; #30 mengacu ke sinkronisasi
> cloud otomatis yang butuh backend (lihat `API.md`).

---

## 🎯 Sisa Pekerjaan yang Disarankan

1. **Integrasi backend** sesuai `API.md` (ganti `services/auth/authService.ts` &
   `services/api/*` dari demo ke `fetch`) — membuka jalan untuk #30 (sync cloud),
   validasi password nyata (hashing), dan multi-device.
2. **Skeleton states (#16)** — kerjakan bareng integrasi backend, saat data benar-benar
   async (sekarang ditunda karena data lokal instan).
3. **Dark mode (#18)** — perlu refactor warna hex ke token CSS dulu (lihat `styles/`).
4. Sisanya (#18, #20, #21, #22, #24) bersifat polish dan bisa menyusul.
