# 🔍 Analisis Fitur yang Kurang — Aplikasi LAKU

> Berdasarkan review lengkap seluruh codebase: `Login.tsx`, `Dashboard.tsx`, `Products.tsx`, `POS.tsx`, `Records.tsx`, `Insights.tsx`, `AppContext.tsx`, `SideNav.tsx`, `TopNav.tsx`, `BottomNav.tsx`, `ModalSheet.tsx`, `api.ts`, `types/index.ts`, `index.css`

---

## 🔴 CRITICAL — Harus Ada untuk Layak Pakai

### 1. Data Persistence (Penyimpanan Data)
- **Masalah**: Semua data produk, transaksi, dan keranjang hanya di-state React. Refresh = data hilang (kembali ke `initialProducts` / `initialTransactions`)
- **Solusi**: Simpan state ke `localStorage` atau `IndexedDB` setiap kali ada perubahan
- **File**: [AppContext.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/context/AppContext.tsx)

### 2. Konfirmasi Hapus Produk
- **Masalah**: `handleDelete` langsung hapus tanpa konfirmasi. User bisa salah klik → produk hilang
- **Solusi**: Tambah dialog konfirmasi "Yakin hapus produk ini?"
- **File**: [Products.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Products.tsx#L61-L65)

### 3. Validasi Input Harga & Stok
- **Masalah**: `parseInt(formPrice)` bisa menghasilkan `NaN` kalau user input huruf. Tidak ada validasi harga negatif
- **Solusi**: Tambah validasi angka positif, tampilkan error yang jelas
- **File**: [Products.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Products.tsx#L30-L48)

### 4. Empty State yang Informatif
- **Masalah**: Dashboard menampilkan "Belum ada transaksi" tapi tidak ada panduan apa yang harus dilakukan
- **Solusi**: Tambah CTA (Call-to-Action) seperti "Mulai tambah produk" atau "Buat transaksi pertama"
- **File**: [Dashboard.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Dashboard.tsx#L278-L283)

---

## 🟠 HIGH PRIORITY — Sangat Penting untuk Profesionalisme

### 5. Notifikasi System yang Berfungsi
- **Masalah**: Bell icon di TopNav hanya menampilkan `showToast('3 notifikasi baru')` — hardcoded, bukan notifikasi real
- **Solusi**: Gunakan `notifications` state yang sudah ada di AppContext. Trigger notifikasi saat stok rendah, target tercapai, dll
- **File**: [TopNav.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/components/TopNav.tsx#L65-L66) + [AppContext.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/context/AppContext.tsx#L217-L227)

### 6. Perhitungan Laba yang Akurat
- **Masalah**: `todayProfit = todayRevenue - todayExpense * 0.2` — angka 0.2 hardcoded, bukan perhitungan real. Juga `profit = revenue - expense * 0.2` di Records
- **Solusi**: Laba = Revenue - Expense (atau gunakan margin per produk yang bisa di-setting)
- **File**: [Dashboard.tsx L21](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Dashboard.tsx#L21), [Records.tsx L48](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Records.tsx#L48)

### 7. Kas di Tangan yang Akurat
- **Masalah**: `cashOnHand = 1200000 + todayRevenue - todayExpense` — saldo awal 1.2 juta hardcoded, detail modal bilang 1 juta (inkonsisten)
- **Solusi**: Buat saldo awal bisa di-edit user, simpan di state
- **File**: [Dashboard.tsx L22](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Dashboard.tsx#L22)

### 8. Search/Filter di Halaman Records
- **Masalah**: Tidak ada search bar di Records. User tidak bisa cari transaksi berdasarkan nama produk
- **Solusi**: Tambah search bar + filter by tipe (JUAL/BELI)
- **File**: [Records.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Records.tsx)

### 9. Prediksi AI yang Real (Bukan Hardcoded)
- **Masalah**: `predictions` di Insights berisi data statis (Cabai Merah +12kg, dll). "Prediksi Omzet Rp 2.800.000" juga hardcoded
- **Solusi**: Hitung prediksi dari data transaksi aktual (rata-rata 7 hari × 1.1, dll)
- **File**: [Insights.tsx L70-L75](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Insights.tsx#L70-L75), [L296-L299](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Insights.tsx#L296-L299)

### 10. Halaman Settings / Pengaturan
- **Masalah**: Tidak ada halaman settings untuk mengatur preferensi toko (nama, alamat, mata uang, tema, dll)
- **Solusi**: Buat page Settings dengan pengaturan toko, profile, dan preferensi
- **File**: Buat baru `Settings.tsx`

---

## 🟡 MEDIUM — Nice-to-Have tapi Impactful

### 11. Kategori Produk
- **Masalah**: Produk tidak punya kategori. Kalau produk banyak, susah diorganisir
- **Solusi**: Tambah field `category` di Product type + filter by category
- **File**: [types/index.ts](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/types/index.ts#L1-L9), [Products.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Products.tsx)

### 12. Harga Beli vs Harga Jual
- **Masalah**: Produk hanya punya 1 `price`. Tidak bisa hitung margin/profit per produk dengan akurat
- **Solusi**: Tambah `costPrice` (harga beli) dan `sellPrice` (harga jual) di Product type
- **File**: [types/index.ts](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/types/index.ts#L1-L9)

### 13. Diskon / Potongan Harga di POS
- **Masalah**: POS tidak support diskon. Di dunia nyata, penjual sering kasih diskon
- **Solusi**: Tambah input diskon (persen/nominal) di cart sebelum checkout
- **File**: [POS.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/POS.tsx)

### 14. Metode Pembayaran
- **Masalah**: Checkout langsung tanpa opsi metode pembayaran (tunai, transfer, QRIS)
- **Solusi**: Tambah pilihan metode + input nominal bayar (untuk hitung kembalian cash)
- **File**: [POS.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/POS.tsx)

### 15. Riwayat Struk (Receipt History)
- **Masalah**: `lastReceipt` hanya menyimpan 1 struk terakhir. Struk sebelumnya hilang
- **Solusi**: Simpan semua receipt, bisa diakses ulang dan dicetak ulang
- **File**: [POS.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/POS.tsx#L36)

### 16. Loading / Skeleton States
- **Masalah**: Tidak ada loading skeleton saat data dimuat. Langsung tampil data atau kosong
- **Solusi**: Tambah skeleton loading animation (shimmer cards) di Dashboard, Products, Records
- **File**: Semua halaman utama

### 17. Error Boundary
- **Masalah**: Tidak ada React Error Boundary. Kalau ada crash, user lihat blank screen
- **Solusi**: Buat ErrorBoundary component yang menampilkan pesan error yang friendly
- **File**: Buat baru `ErrorBoundary.tsx`

---

## 🟢 LOW — Polish & Detail

### 18. Dark Mode Toggle
- **Masalah**: CSS variables sudah disiapkan tapi hanya light mode
- **Solusi**: Tambah toggle dark/light mode di Settings atau TopNav
- **File**: [index.css](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/index.css)

### 19. Sortir Produk
- **Masalah**: Products hanya bisa search, tidak bisa sort (by name, price, stock, date)
- **Solusi**: Tambah dropdown sort di header Products
- **File**: [Products.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Products.tsx)

### 20. Pagination / Infinite Scroll di Records
- **Masalah**: Semua transaksi di-render sekaligus. Kalau data ribuan, performance turun
- **Solusi**: Implementasi virtual scroll atau pagination (10-20 per halaman)
- **File**: [Records.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/Records.tsx)

### 21. Keyboard Shortcuts
- **Masalah**: Tidak ada keyboard shortcut. Power user harus klik semua
- **Solusi**: Tambah shortcut: `Ctrl+N` tambah produk, `Ctrl+K` search, `Esc` close modal
- **File**: Global handler di `App.tsx`

### 22. Feedback Haptic / Sound
- **Masalah**: Checkout dan aksi penting tidak ada feedback audio
- **Solusi**: Tambah subtle sound effect saat checkout berhasil, notifikasi stok habis
- **File**: [POS.tsx](file:///home/h3rwthme/Documents/Tar%20gw%20beresin%20dah/BismillahLancarRezeki/Laku-App/Laku-responsive/app/src/pages/POS.tsx)

### 23. PWA Support (Install di HP)
- **Masalah**: Belum ada `manifest.json` dan service worker untuk PWA
- **Solusi**: Tambah manifest + service worker agar bisa di-install di smartphone
- **File**: `public/manifest.json`, `vite.config.ts` (plugin PWA)

### 24. Multi-language (i18n)
- **Masalah**: Semua text hardcoded dalam Bahasa Indonesia
- **Solusi**: Siapkan i18n structure untuk support Bahasa Inggris di masa depan

---

## 🔵 FUTURE — Fitur Advanced

### 25. Multi-Outlet / Multi-User
- User bisa punya beberapa toko, tiap toko punya data terpisah

### 26. Barcode Scanner
- Scan barcode produk pakai kamera HP untuk input cepat di POS

### 27. Laporan Bulanan Auto-Generate
- Auto-generate laporan PDF tiap akhir bulan dengan chart dan summary

### 28. Supplier Management
- Catat data supplier, riwayat pembelian, dan saran restock otomatis

### 29. Customer Database
- Simpan data pelanggan, riwayat beli, dan program loyalti sederhana

### 30. Sync ke Cloud / Backup
- Backup data ke cloud (Firebase/Supabase) agar aman dan bisa diakses multi-device

---

## 📊 Ringkasan Prioritas

| Kategori | Jumlah | Estimasi Impact |
|----------|--------|----------------|
| 🔴 Critical | 4 item | App bisa rusak/data hilang tanpa ini |
| 🟠 High | 6 item | Kesan profesional naik drastis |
| 🟡 Medium | 7 item | Fitur yang user expect di app modern |
| 🟢 Low | 7 item | Polish dan detail premium |
| 🔵 Future | 6 item | Fitur scale-up bisnis |

> [!IMPORTANT]
> **Rekomendasi urutan pengerjaan**: Mulai dari **#1 Data Persistence** karena tanpa ini semua data hilang saat refresh. Lalu **#6 & #7** karena perhitungan laba yang salah bisa menyesatkan user.
