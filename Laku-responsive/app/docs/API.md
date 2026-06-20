# LAKU — Kontrak API Backend

Dokumen ini adalah kontrak endpoint yang dibutuhkan frontend LAKU. Saat ini
seluruh auth & data berjalan dalam **Demo Mode** (lokal, lihat `src/lib/api.ts`
dan `localStorage`). Ketika backend siap, implementasikan endpoint di bawah dan
ganti isi `src/lib/api.ts` — bentuk request/response sudah disesuaikan dengan
yang dipakai UI.

Base URL: `http://localhost:3001/api`
Production: `https://api.laku.app/api` *(sesuaikan)*

Semua request yang butuh autentikasi wajib menyertakan header:
```
Authorization: Bearer <token>
```

> Penanda 🔒 = butuh token.

---

## 0. Catatan Penting Alur Auth (WAJIB dibaca)

Alur autentikasi yang dipakai UI:

```
User baru : Buat Akun (register) ─▶ kembali ke halaman Login ─▶ Login ─▶ Langkah pengenalan (onboarding) ─▶ Masuk aplikasi
User lama : Login ─▶ Masuk aplikasi (onboarding dilewati)
```

Konsekuensi untuk backend:

1. **`POST /auth/register` TIDAK otomatis menjadikan user "masuk".** Frontend
   sengaja tidak memakai token dari response register untuk auto-login; user
   diarahkan kembali ke form login. Backend tetap boleh mengembalikan token
   (boleh diabaikan UI), tetapi yang penting akun tercipta.
2. Setiap user punya status **`onboardingCompleted`** (boolean). Response
   `login` & `register` **wajib** menyertakan field ini di objek `user`.
   - `false` → setelah login, UI menampilkan langkah pengenalan.
   - `true`  → setelah login, UI langsung masuk aplikasi.
3. Saat user menyelesaikan langkah pengenalan, UI memanggil
   **`PATCH /auth/onboarding`** agar status menjadi `true` dan login berikutnya
   tidak mengulang onboarding.

---

## 1. Auth

### POST `/auth/register`
Daftar akun baru. **Tidak** auto-login di sisi UI.

**Request Body:**
```json
{
  "name": "Warung Bu Sri",
  "email": "bsri@email.com",
  "password": "password123"
}
```

**Response `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_abc123",
    "name": "Warung Bu Sri",
    "email": "bsri@email.com",
    "onboardingCompleted": false
  }
}
```

**Error `409`:**
```json
{ "message": "Email sudah terdaftar", "code": "EMAIL_TAKEN" }
```

---

### POST `/auth/login`
Login dengan email & password.

**Request Body:**
```json
{ "email": "bsri@email.com", "password": "password123" }
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_abc123",
    "name": "Warung Bu Sri",
    "email": "bsri@email.com",
    "onboardingCompleted": true
  }
}
```

**Error `401`:**
```json
{ "message": "Email atau password salah", "code": "INVALID_CREDENTIALS" }
```

---

### PATCH `/auth/onboarding` 🔒
Tandai bahwa user sudah menyelesaikan langkah pengenalan. Dipanggil sekali,
saat user menekan "Mulai" di akhir onboarding.

**Request Body:** *(kosong)*

**Response `200`:**
```json
{ "user": { "id": "usr_abc123", "onboardingCompleted": true } }
```

---

### PATCH `/auth/profile` 🔒
Update profil user (nama, dan opsional foto).

**Request Body** *(semua opsional)*:
```json
{ "name": "Warung Pak Budi", "image": "data:image/jpeg;base64,..." }
```

**Response `200`:**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Warung Pak Budi",
    "email": "bsri@email.com",
    "image": "https://cdn.laku.app/avatars/usr_abc123.jpg",
    "onboardingCompleted": true
  }
}
```

---

## 2. Products

Model produk lengkap (perhatikan field baru `costPrice` & `category`):

| Field | Type | Keterangan |
|-------|------|------------|
| `id` | string | ID produk |
| `name` | string | Nama produk |
| `price` | number | Harga **jual** |
| `costPrice` | number? | Harga **modal/HPP** — dipakai untuk hitung laba. Default 0 |
| `stock` | number | Stok saat ini |
| `category` | string? | Kategori (opsional) |
| `image` | string? | URL atau base64 |
| `emoji` | string | Emoji fallback (default `"📦"`) |
| `createdAt` | string (ISO) | Tanggal dibuat |

### GET `/products` 🔒
Ambil semua produk milik user.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "prd_001",
      "name": "Nasi Goreng",
      "price": 15000,
      "costPrice": 8000,
      "stock": 50,
      "category": "Makanan",
      "image": "https://...",
      "emoji": "📦",
      "createdAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```

### POST `/products` 🔒
Tambah produk baru.

**Request Body:**
```json
{
  "name": "Kopi Susu",
  "price": 8000,
  "costPrice": 3500,
  "stock": 30,
  "category": "Minuman",
  "image": "data:image/jpeg;base64,..."
}
```
> `costPrice`, `category`, `image` opsional. Validasi UI: `price > 0`,
> `stock >= 0`, `costPrice >= 0`.

**Response `201`:** `{ "data": { ...product } }`

### PATCH `/products/:id` 🔒
Update produk (semua field opsional). **Response `200`:** `{ "data": { ...product } }`

### DELETE `/products/:id` 🔒
Hapus produk. Riwayat transaksi yang sudah ada tidak ikut terhapus.
**Response `200`:** `{ "message": "Produk berhasil dihapus" }`

### PATCH `/products/:id/stock` 🔒
Tambah/kurangi stok. Sekaligus membuat transaksi penyesuaian stok.

**Request Body:**
```json
{ "qty": 10, "type": "IN", "note": "Restock dari supplier" }
```
> `type`: `"IN"` = tambah stok (pembelian), `"OUT"` = kurangi stok.

**Response `200`:**
```json
{
  "data": {
    "product": { "id": "prd_001", "stock": 60 },
    "transaction": { "id": "trx_099", "type": "IN", "qty": 10, "totalPrice": -150000, "...": "..." }
  }
}
```
> Catatan tanda: transaksi `IN` (pembelian) disimpan dengan `totalPrice`
> **negatif** di frontend untuk membedakannya dari penjualan. Backend boleh
> menyimpan nilai absolut + `type`; yang penting konsisten dan terdokumentasi.

---

## 3. Categories

Daftar kategori produk milik user (string sederhana).

### GET `/categories` 🔒
**Response `200`:** `{ "data": ["Makanan", "Minuman", "Sembako", "Bumbu", "Lainnya"] }`

### POST `/categories` 🔒
**Request Body:** `{ "name": "Snack" }` → **Response `201`:** `{ "data": ["...", "Snack"] }`

### DELETE `/categories/:name` 🔒
**Response `200`:** `{ "message": "Kategori dihapus" }`

---

## 4. Transactions

Model transaksi (field baru `paymentMethod` & `discount`):

| Field | Type | Keterangan |
|-------|------|------------|
| `id` | string | |
| `productId` | string | |
| `productName` | string | Nama saat transaksi (snapshot) |
| `type` | `"IN"` \| `"OUT"` | `OUT` = penjualan, `IN` = pembelian/restock |
| `qty` | number | |
| `totalPrice` | number | Total. `IN` boleh negatif (lihat catatan di atas) |
| `paymentMethod` | `"cash"`\|`"transfer"`\|`"qris"`? | Hanya untuk penjualan |
| `discount` | number? | Nominal diskon (Rp) |
| `note` | string? | |
| `createdAt` | string (ISO) | |

### GET `/transactions` 🔒
**Query Params** *(opsional)*:
| Param | Type | Contoh | Keterangan |
|-------|------|--------|------------|
| `from` | string | `2026-06-01` | Rentang tanggal awal |
| `to` | string | `2026-06-30` | Rentang tanggal akhir |
| `type` | string | `IN` / `OUT` | Filter tipe |
| `limit` | number | `20` | |
| `offset` | number | `0` | |

**Response `200`:** `{ "data": [ { ...transaction } ], "total": 42 }`

### POST `/transactions` 🔒
Buat transaksi penjualan dari kasir/POS. Satu checkout bisa berisi banyak item.
Backend membuat satu transaksi `OUT` per item **dan** mengurangi stok masing-masing.

**Request Body:**
```json
{
  "items": [
    { "productId": "prd_001", "qty": 2 },
    { "productId": "prd_002", "qty": 1 }
  ],
  "paymentMethod": "cash",
  "discount": 2000,
  "cashPaid": 50000,
  "note": "Penjualan siang"
}
```

**Response `201`:**
```json
{
  "data": {
    "transactions": [ { "id": "trx_010", "type": "OUT", "...": "..." } ],
    "receipt": { "id": "rcp_010", "total": 38000, "change": 12000, "...": "..." }
  }
}
```

---

## 5. Receipts (Struk)

Snapshot struk untuk dicetak/diunduh ulang.

| Field | Type |
|-------|------|
| `id` | string |
| `storeName` | string |
| `createdAt` | string (ISO) |
| `items` | `{ productId, productName, price, qty }[]` |
| `total` | number |
| `discount` | number? |
| `paymentMethod` | `"cash"`\|`"transfer"`\|`"qris"`? |
| `cashPaid` | number? |
| `change` | number? |

### GET `/receipts` 🔒
**Response `200`:** `{ "data": [ { ...receipt } ] }`

---

## 6. Store Settings & Target

Pengaturan toko (1 objek per user). Dipakai di halaman Pengaturan, struk, dan
perhitungan kas/notifikasi.

| Field | Type | Default | Keterangan |
|-------|------|---------|------------|
| `storeName` | string | `""` | Nama toko (tampil di struk & dashboard) |
| `storeAddress` | string | `""` | Alamat toko |
| `storePhone` | string | `""` | No. HP toko (tampil di struk) |
| `receiptNote` | string | `"Terima kasih telah berbelanja"` | Catatan kaki struk |
| `initialCash` | number | `1000000` | Saldo awal kas (basis perhitungan kas di tangan) |
| `lowStockThreshold` | number | `5` | Batas stok dianggap "rendah" |
| `notifLowStock` | boolean | `true` | Aktifkan notifikasi stok rendah/habis |
| `notifTarget` | boolean | `true` | Aktifkan notifikasi target tercapai |
| `currency` | string | `"IDR"` | |
| `darkMode` | boolean | `false` | (toggle disiapkan, belum diekspos di UI) |
| `dailyTarget` | number | `300000` | Target **laba** harian |

### GET `/settings` 🔒
**Response `200`:** `{ "data": { ...storeSettings, "dailyTarget": 300000 } }`

### PATCH `/settings` 🔒
Update sebagian field (partial). **Request Body** contoh:
```json
{ "storeName": "Warung Bu Sri", "lowStockThreshold": 3, "initialCash": 2000000 }
```
**Response `200`:** `{ "data": { ...storeSettings } }`

### PATCH `/settings/target` 🔒 *(alternatif terpisah)*
```json
{ "dailyTarget": 500000 }
```

---

## 7. Dashboard & Insights

Saat ini semua angka dihitung di frontend dari `transactions` + `products`
(lihat `src/lib/finance.ts`). Endpoint berikut **opsional** namun disarankan
agar perhitungan berat dipindah ke server.

**Model perhitungan (HARUS sama dengan frontend):**
- `revenue`  = Σ `totalPrice` transaksi `OUT`.
- `expense`  = Σ |`totalPrice`| transaksi `IN`.
- `profit` (laba kotor) = Σ (`totalPrice` − `costPrice` × `qty`) untuk tiap
  penjualan (`OUT`). Pembelian stok **tidak** dipotong dari laba.
- `cashOnHand` = `initialCash` + `revenue` − `expense`.
- Stok rendah = `0 < stock <= lowStockThreshold`; stok habis = `stock == 0`.

### GET `/dashboard/stats` 🔒
**Query:** `date` (opsional, default hari ini).
```json
{
  "data": {
    "todayRevenue": 125000,
    "todayExpense": 60000,
    "todayProfit": 48000,
    "todayTransactionCount": 8,
    "cashOnHand": 1065000,
    "dailyTarget": 300000,
    "targetProgress": 16.0,
    "lowStockCount": 2
  }
}
```

### GET `/insights/sales` 🔒
Data omzet + pengeluaran harian untuk grafik interaktif (7 atau 30 hari).
**Query:** `period` = `7` | `30`.
```json
{
  "data": [
    { "date": "2026-06-13", "day": "Sab", "revenue": 85000, "expense": 0 },
    { "date": "2026-06-14", "day": "Min", "revenue": 120000, "expense": 60000 }
  ]
}
```

### GET `/insights/predictions` 🔒
Prakiraan restock + omzet minggu depan (heuristik berbasis kecepatan jual 7 hari).
```json
{
  "data": {
    "restock": [
      { "productId": "prd_007", "product": "Mie Goreng", "stock": 0, "recommended": 14, "urgency": "high" }
    ],
    "forecast": { "amount": 850000, "changePct": 12, "confidence": 71, "hasData": true }
  }
}
```

---

## 8. Notifications *(opsional)*

Saat ini notifikasi (stok rendah, target tercapai) di-generate di frontend.
Bila ingin dipindah ke server, sediakan:

- `GET /notifications` 🔒 → `{ "data": [ { id, title, message, type, read, createdAt } ] }`
- `PATCH /notifications/:id/read` 🔒
- `DELETE /notifications` 🔒 (clear semua)

`type`: `"info" | "success" | "warning" | "error"`.

---

## 9. Backup / Restore

Fitur ekspor-impor data berjalan **sepenuhnya di sisi klien** (file JSON via
halaman Pengaturan). Tidak butuh endpoint. Bila ingin sinkronisasi multi-device,
backend cukup menyediakan GET/PATCH per-resource di atas.

Bentuk file backup (referensi):
```json
{
  "products": [ ... ],
  "transactions": [ ... ],
  "receipts": [ ... ],
  "categories": [ ... ]
}
```

---

## 10. Error Format

```json
{ "message": "Deskripsi error", "code": "ERROR_CODE" }
```

| HTTP | Keterangan |
|------|------------|
| `400` | Bad Request — validasi gagal |
| `401` | Unauthorized — token tidak ada / kadaluarsa |
| `403` | Forbidden — tidak punya akses |
| `404` | Not Found |
| `409` | Conflict — duplikat (mis. email sudah ada) |
| `500` | Internal Server Error |

---

## 11. Setup Backend (Rekomendasi Stack)

```
Node.js + Express
Prisma ORM
PostgreSQL (atau Supabase)
JWT (jsonwebtoken)
bcrypt (hash password)
Cloudinary / S3 (upload gambar produk & avatar)
```

`.env` backend:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/laku_db"
JWT_SECRET="your-super-secret-key"
PORT=3001
CLOUDINARY_URL="cloudinary://..."
```

`.env` frontend:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 12. Integrasi Frontend

Service layer ada di `app/src/lib/api.ts`. **Saat ini Demo Mode** — auth & status
onboarding disimpan di `localStorage` (key `token` dan `onboardedEmails`), data
produk/transaksi/dll. dikelola di `src/context/AppContext.tsx` (juga persisted ke
`localStorage`).

Fungsi yang sudah ada (Demo Mode):
- `apiLogin(email, password)` → `AuthResponse` (mengandung `user.onboardingCompleted`)
- `apiRegister(name, email, password)` → `AuthResponse` (UI tidak auto-login)
- `apiCompleteOnboarding(email)` → tandai onboarding selesai
- `saveToken(token)` / `clearToken()`

Yang perlu ditambahkan saat backend siap (ganti implementasi demo dengan `fetch`):
- `apiGetProducts / apiCreateProduct / apiUpdateProduct / apiDeleteProduct / apiAdjustStock`
- `apiGetTransactions / apiCreateTransaction`
- `apiGetCategories / apiAddCategory / apiRemoveCategory`
- `apiGetSettings / apiUpdateSettings / apiUpdateTarget`
- `apiGetReceipts`
- `apiGetDashboardStats / apiGetSales / apiGetPredictions`

> Selama backend belum tersedia, aplikasi tetap berjalan penuh dengan data lokal.
