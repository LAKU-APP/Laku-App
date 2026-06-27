# Laku Backend

Backend Laravel + PostgreSQL untuk aplikasi POS LAKU. Implementasi mengikuti kontrak
endpoint di [`../docs/PRD-Backend-Laravel.md`](../docs/PRD-Backend-Laravel.md) dan
[`../Laku-responsive/app/docs/API.md`](../Laku-responsive/app/docs/API.md) — **API.md
adalah sumber kebenaran bentuk request/response**, jangan diubah sepihak dari sisi
backend tanpa menyamakan ke frontend juga.

## Setup lokal

Prasyarat: PHP 8.3+, Composer, Docker Desktop (untuk Postgres + Redis).

```bash
cp .env.example .env
php artisan key:generate

docker compose up -d        # Postgres (5432) + Redis (6379)
composer install
php artisan migrate
php artisan serve --port=3001
```

API akan berjalan di `http://127.0.0.1:3001/api`, sesuai `VITE_API_URL` default di
frontend (`Laku-responsive/app/.env.example`).

> PHP CLI butuh extension `pdo_pgsql` aktif. Kalau pakai Laragon/XAMPP, cek
> `php.ini` dan hapus tanda `;` di depan `extension=pdo_pgsql`.

## Reset data lokal

```bash
php artisan migrate:fresh
```

## Struktur penting

- `app/Models` — Eloquent, primary key UUID (`HasUuids`), semua tabel di-scope ke `store_id`.
- `app/Http/Controllers/Concerns/ScopesToStore.php` — setiap controller resource wajib pakai
  ini agar data antar store/user tidak pernah bocor.
- `app/Support/Finance.php` — satu-satunya tempat rumus revenue/expense/profit/cashOnHand
  dihitung; harus identik dengan `lib/finance.ts` di frontend.
- `app/Exceptions/ApiException.php` — lempar ini untuk error domain (`EMAIL_TAKEN`,
  `INSUFFICIENT_STOCK`, dst.) agar response selalu `{ message, code }`.

## Catatan status (Fase 1 — MVP, lihat PRD §13)

Sudah jalan: auth (register/login/onboarding/profile/logout), products + adjust stock,
categories, checkout (transactions) dengan row-locking anti race condition, receipts,
settings, dashboard stats, insights sales/predictions.

Belum (Fase 2 sesuai PRD): upload gambar ke object storage (sekarang masih base64 di
kolom `text`), notifikasi server-driven, Sentry, Horizon, CI/CD, RBAC owner/cashier
(skema `store_user` sudah ada, enforcement belum).
