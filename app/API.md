# LAKU API Documentation

Base URL: `http://localhost:3001/api`  
Production: `https://api.laku.app/api` *(sesuaikan)*

Semua request yang butuh autentikasi wajib menyertakan header:
```
Authorization: Bearer <token>
```

---

## Auth

### POST `/auth/register`
Daftar akun baru.

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
    "email": "bsri@email.com"
  }
}
```

**Error `400`:**
```json
{ "message": "Email sudah terdaftar" }
```

---

### POST `/auth/login`
Login dengan email & password.

**Request Body:**
```json
{
  "email": "bsri@email.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_abc123",
    "name": "Warung Bu Sri",
    "email": "bsri@email.com"
  }
}
```

**Error `401`:**
```json
{ "message": "Email atau password salah" }
```

---

### PATCH `/auth/profile`
Update nama user. 🔒 Auth required.

**Request Body:**
```json
{ "name": "Warung Pak Budi" }
```

**Response `200`:**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Warung Pak Budi",
    "email": "bsri@email.com"
  }
}
```

---

## Products

### GET `/products`
Ambil semua produk milik user. 🔒 Auth required.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "prd_001",
      "name": "Nasi Goreng",
      "price": 15000,
      "stock": 50,
      "image": "https://...",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/products`
Tambah produk baru. 🔒 Auth required.

**Request Body:**
```json
{
  "name": "Kopi Susu",
  "price": 8000,
  "stock": 30,
  "image": "data:image/jpeg;base64,..."
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "prd_002",
    "name": "Kopi Susu",
    "price": 8000,
    "stock": 30,
    "image": "https://cdn.laku.app/products/prd_002.jpg",
    "createdAt": "2025-06-01T08:00:00Z"
  }
}
```

---

### PATCH `/products/:id`
Update data produk. 🔒 Auth required.

**Request Body** *(semua field opsional)*:
```json
{
  "name": "Kopi Susu Gula Aren",
  "price": 10000,
  "stock": 25,
  "image": "data:image/jpeg;base64,..."
}
```

**Response `200`:**
```json
{ "data": { ...updatedProduct } }
```

---

### DELETE `/products/:id`
Hapus produk. 🔒 Auth required.

**Response `200`:**
```json
{ "message": "Produk berhasil dihapus" }
```

---

### PATCH `/products/:id/stock`
Adjust stok produk (tambah/kurangi). 🔒 Auth required.

**Request Body:**
```json
{
  "qty": 10,
  "type": "IN",
  "note": "Restock dari supplier"
}
```
> `type`: `"IN"` = tambah stok, `"OUT"` = kurangi stok

**Response `200`:**
```json
{
  "data": {
    "product": { "id": "prd_001", "stock": 60 },
    "transaction": { "id": "trx_099", ... }
  }
}
```

---

## Transactions

### GET `/transactions`
Ambil semua transaksi. 🔒 Auth required.

**Query Params** *(opsional)*:
| Param | Type | Contoh | Keterangan |
|-------|------|--------|------------|
| `date` | string | `2025-06-01` | Filter by tanggal |
| `type` | string | `IN` / `OUT` | Filter by tipe |
| `limit` | number | `20` | Jumlah data |
| `offset` | number | `0` | Pagination |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "trx_001",
      "productId": "prd_001",
      "productName": "Nasi Goreng",
      "type": "OUT",
      "qty": 3,
      "totalPrice": 45000,
      "note": "Penjualan: 3x Nasi Goreng",
      "createdAt": "2025-06-01T10:15:00Z"
    }
  ],
  "total": 42
}
```

---

### POST `/transactions`
Buat transaksi baru (dari kasir/POS). 🔒 Auth required.

**Request Body:**
```json
{
  "items": [
    { "productId": "prd_001", "qty": 2 },
    { "productId": "prd_002", "qty": 1 }
  ],
  "note": "Penjualan siang"
}
```

**Response `201`:**
```json
{
  "data": [
    {
      "id": "trx_010",
      "productId": "prd_001",
      "productName": "Nasi Goreng",
      "type": "OUT",
      "qty": 2,
      "totalPrice": 30000,
      "createdAt": "2025-06-01T12:00:00Z"
    }
  ]
}
```

---

## Dashboard

### GET `/dashboard/stats`
Ambil ringkasan statistik hari ini. 🔒 Auth required.

**Query Params** *(opsional)*:
| Param | Type | Contoh |
|-------|------|--------|
| `date` | string | `2025-06-01` (default: hari ini) |

**Response `200`:**
```json
{
  "data": {
    "todayRevenue": 125000,
    "todayExpense": 60000,
    "todayProfit": 65000,
    "todayTransactionCount": 8,
    "dailyTarget": 300000,
    "targetProgress": 21.67,
    "lowStockCount": 2
  }
}
```

---

### GET `/dashboard/weekly`
Ambil data omzet 7 hari terakhir. 🔒 Auth required.

**Response `200`:**
```json
{
  "data": [
    { "date": "2025-05-26", "day": "Min", "revenue": 85000 },
    { "date": "2025-05-27", "day": "Sen", "revenue": 120000 },
    { "date": "2025-05-28", "day": "Sel", "revenue": 95000 },
    { "date": "2025-05-29", "day": "Rab", "revenue": 0 },
    { "date": "2025-05-30", "day": "Kam", "revenue": 110000 },
    { "date": "2025-05-31", "day": "Jum", "revenue": 145000 },
    { "date": "2025-06-01", "day": "Sab", "revenue": 125000 }
  ]
}
```

---

## Error Format

Semua error menggunakan format yang konsisten:

```json
{
  "message": "Deskripsi error",
  "code": "ERROR_CODE"
}
```

| HTTP Status | Keterangan |
|-------------|------------|
| `400` | Bad Request — validasi gagal |
| `401` | Unauthorized — token tidak ada / expired |
| `403` | Forbidden — tidak punya akses |
| `404` | Not Found — data tidak ditemukan |
| `409` | Conflict — data duplikat (misal email sudah ada) |
| `500` | Internal Server Error |

---

## Setup Backend (Rekomendasi Stack)

```
Node.js + Express
Prisma ORM
PostgreSQL (atau Supabase)
JWT (jsonwebtoken)
bcrypt (hash password)
Cloudinary / S3 (upload gambar produk)
```

### Contoh `.env` backend:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/laku_db"
JWT_SECRET="your-super-secret-key"
PORT=3001
CLOUDINARY_URL="cloudinary://..."
```

### Contoh `.env` frontend:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Frontend Integration

File service layer sudah dibuat di:
```
app/src/lib/api.ts
```

Fungsi yang tersedia:
- `apiLogin(email, password)` → `AuthResponse`
- `apiRegister(name, email, password)` → `AuthResponse`
- `apiGetProducts()` → list produk
- `apiCreateProduct(payload)` → produk baru
- `apiUpdateProduct(id, payload)` → update produk
- `apiDeleteProduct(id)` → hapus produk
- `apiGetTransactions()` → list transaksi
- `apiCreateTransaction(payload)` → transaksi baru
- `saveToken(token)` → simpan JWT ke localStorage
- `clearToken()` → hapus JWT (logout)

> **Note:** Selama backend belum tersedia, Login otomatis fallback ke **Demo Mode** — semua fitur tetap berjalan dengan data lokal.
