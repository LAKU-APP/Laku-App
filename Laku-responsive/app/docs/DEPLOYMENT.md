# Deployment

## Build lokal
```bash
npm install
npm run build      # tsc -b && vite build  → output ke dist/
npm run preview    # cek hasil build
```

## Konfigurasi penting
- **Base path**: `vite.config.ts` → `base: '/Laku-App/'`. Wajib cocok dengan
  sub-path hosting (GitHub Pages project site). Ubah bila domain/sub-path berbeda.
- **Env**: salin `.env.example` → `.env`. `VITE_API_URL` menentukan base URL backend
  (lihat `API.md`). Bila kosong, kode memakai default `http://localhost:3001/api`.

## GitHub Pages
`package.json`:
- `homepage`: `https://laku-app.github.io/Laku-App/`
- deploy: `npm run deploy` (menjalankan `predeploy` → `build`, lalu `gh-pages -d dist`).

```bash
npm run deploy
```

## CI
`.github/workflows/ci.yml` menjalankan `npm ci`, `npm run lint`, dan `npm run build`
pada push/PR (working-directory: `Laku-responsive/app`).

## Checklist rilis
1. `npm run lint` & `npm run build` hijau.
2. Pastikan `base` & `VITE_API_URL` sesuai target.
3. `npm run deploy` (atau pipeline) → verifikasi di URL `homepage`.
4. Hard refresh untuk memastikan bundle terbaru termuat.
