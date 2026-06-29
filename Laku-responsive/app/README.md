# LAKU — Aplikasi Stok & Kasir UMKM

Aplikasi web manajemen toko/warung: kelola produk & stok, kasir (POS), catatan
transaksi, dan insight bisnis. Responsif penuh dari HP kecil sampai desktop.

## Tech Stack
React 19 · TypeScript · Vite 7 · Tailwind CSS 3 · lucide-react · jsPDF/html2canvas

## Menjalankan
```bash
npm install
npm run dev        # http://localhost:3000/Laku-App/
```

## Script
| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Type-check + build produksi (`tsc -b && vite build`) |
| `npm run lint` | ESLint |
| `npm run preview` | Preview hasil build |
| `npm run deploy` | Deploy ke GitHub Pages |

## Struktur

```txt
src/
  assets/        gambar, ikon, logo, font
  components/    ui, navigation, modals, feedback, forms, tables, branding
  constants/     routes, roles, permissions, storageKeys
  context/       AppContext (utama), AuthContext, ThemeContext (scaffolding)
  hooks/         useMobile, useDebounce, useLocalStorage, useOnlineStatus
  pages/         Auth, Dashboard, Products, POS, Records, Insights, Settings, Onboarding
  services/      api, auth, storage, notification, analytics
  styles/        globals, variables, themes, animations
  types/         auth, user, product, transaction, index (barrel)
  utils/         currency, date, formatter, string, helpers
```

## Konfigurasi
Salin `.env.example` → `.env` lalu sesuaikan:
```env
VITE_API_URL=http://localhost:3001/api
```

## Dokumentasi
Mulai dari [`docs/CODEBASE_GUIDE.md`](./docs/CODEBASE_GUIDE.md) — ringkasan
arsitektur, class diagram, sequence diagram auth, dan use case yang ditulis
khusus agar sesi AI/kontributor baru tidak perlu baca seluruh source code.

Dokumen lain di folder [`docs/`](./docs): `PATHS.md` (peta folder singkat),
`API.md` (kontrak backend), `ARCHITECTURE.md`, `DEPLOYMENT.md`, `ROADMAP.md`
(status fitur), `DOKUMENTASI_PENGERJAAN.md` (detail per-halaman/komponen).

## Status
Frontend berjalan penuh dengan data lokal (`localStorage`). Backend belum
terhubung — lihat `docs/API.md` untuk kontrak endpoint.
