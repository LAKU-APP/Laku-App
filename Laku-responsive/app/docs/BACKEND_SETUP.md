# Menjalankan Backend (Laravel) + Database (PostgreSQL)

Backend ada di folder **`Laku-backend/`** (Laravel 13 + Sanctum). Frontend ada di
`Laku-responsive/app/`. Ikuti langkah ini berurutan.

## 0. Prasyarat
- **PHP 8.3+** dengan ekstensi: `pdo_pgsql`, `mbstring`, `openssl`, `bcmath`, `ctype`, `fileinfo`.
- **Composer** (manajer paket PHP).
- **PostgreSQL 14+**.
- **Node 18+** (untuk frontend).

Cek cepat:
```bash
php -v        # >= 8.3
composer -V
psql --version
```

## 1. Siapkan database PostgreSQL
Buat database + user sesuai default `.env.example` (`laku_db` / `laku` / `laku_secret`):
```bash
sudo -u postgres psql -c "CREATE USER laku WITH PASSWORD 'laku_secret';"
sudo -u postgres psql -c "CREATE DATABASE laku_db OWNER laku;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE laku_db TO laku;"
```
> Boleh pakai kredensial lain — nanti samakan di `.env` langkah 2.

## 2. Konfigurasi backend
```bash
cd Laku-backend
composer install
cp .env.example .env
php artisan key:generate
```

Buka `.env`, pastikan/ubah:
```env
APP_URL=http://localhost:3001

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laku_db
DB_USERNAME=laku
DB_PASSWORD=laku_secret

# Izinkan origin frontend (dev Vite jalan di :3000). WAJIB, kalau tidak → error CORS.
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Agar TIDAK butuh server Redis saat development:
CACHE_STORE=database
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
```
> Untuk produksi, boleh kembali pakai Redis (`CACHE_STORE=redis`, dst.) dan jalankan server Redis.

## 3. Migrasi (buat tabel)
```bash
php artisan migrate
```
Ini membuat semua tabel (users, stores, products, transactions, receipts, dll. +
tabel cache & personal_access_tokens). **Tidak ada data dummy** — database mulai
bersih. Akun & toko dibuat otomatis saat user mendaftar.

> Reset ulang dari nol kapan saja: `php artisan migrate:fresh`.

## 4. Jalankan backend
```bash
php artisan serve --host=127.0.0.1 --port=3001
```
API kini aktif di `http://localhost:3001/api` (mis. `POST /api/auth/register`).
Cek sehat: buka `http://localhost:3001/up` → harus "OK".

## 5. Jalankan frontend (terminal terpisah)
```bash
cd Laku-responsive/app
cp .env.example .env        # kalau belum ada
# pastikan isinya:
#   VITE_API_URL=http://localhost:3001/api
npm install
npm run dev
```
Buka `http://localhost:3000/Laku-App/`.

## 6. Coba alur lengkap
1. **Buat Akun** (register) → otomatis kembali ke Login.
2. **Login** → karena akun baru, lewati **langkah pengenalan (onboarding)** → masuk app.
3. Tambah produk, transaksi di kasir → tersimpan di PostgreSQL (cek via `psql` bila mau).
4. **Logout** → semua cache lokal dibersihkan (data tetap di backend).

> Tidak ada lagi tombol "Masuk Demo / Admin" dan tidak ada data contoh — semua data nyata dari backend.

## 7. Ringkasan port & URL
| Komponen | URL |
|----------|-----|
| Backend API | `http://localhost:3001/api` |
| Health check | `http://localhost:3001/up` |
| Frontend | `http://localhost:3000/Laku-App/` |
| Database | `postgres://laku:laku_secret@127.0.0.1:5432/laku_db` |

## 8. Troubleshooting
- **CORS error / "blocked by CORS policy"** → `CORS_ALLOWED_ORIGINS` di backend `.env`
  belum memuat `http://localhost:3000`. Tambahkan, lalu `php artisan config:clear`.
- **401 Unauthenticated** → token tidak terkirim/kadaluarsa; coba login ulang.
  Frontend menyimpan token di `localStorage` dan menyisipkannya sebagai
  `Authorization: Bearer <token>` (lihat `services/api/interceptor.ts`).
- **SQLSTATE / connection refused** → cek service PostgreSQL jalan & kredensial `.env` benar.
- **"could not find driver"** → ekstensi `pdo_pgsql` belum aktif di PHP.
- **Cache/Redis error** → pastikan `CACHE_STORE=database` (langkah 2) lalu `php artisan config:clear`.
- Setelah mengubah `.env`: `php artisan config:clear` (dan `php artisan migrate` bila skema berubah).
