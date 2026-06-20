# Arsitektur LAKU

Ringkasan arsitektur frontend. Untuk detail per-halaman lihat
`DOKUMENTASI_PENGERJAAN.md`; untuk kontrak backend lihat `API.md`.

## Lapisan

```
main.tsx
  └─ ErrorBoundary ─ AppProvider ─ App
                                    ├─ pages/      (layar per fitur)
                                    ├─ components/ (UI bersama: navigation, modals, feedback, branding, ui)
                                    ├─ context/    (state global: AppContext)
                                    ├─ services/   (api, auth, storage, notification, analytics)
                                    ├─ hooks/      (useMobile, useDebounce, ...)
                                    ├─ utils/      (currency, date, formatter, string, helpers)
                                    ├─ constants/  (storageKeys, routes, roles, permissions)
                                    └─ types/      (barrel @/types)
```

## Prinsip

- **Sumber kebenaran data**: `context/AppContext.tsx` (`useReducer`). Semua mutasi
  produk/transaksi/keranjang/pengaturan lewat action reducer.
- **Sumber kebenaran uang**: `utils/currency.ts` (`calcRevenue`, `calcExpense`,
  `calcGrossProfit`, `calcCashOnHand`, `formatRupiah`). Tidak ada perhitungan uang
  yang di-hardcode di komponen.
- **Persistensi**: `services/storage/storage.ts` membungkus `localStorage`;
  AppContext menyimpan tiap slice otomatis. Kunci ada di `constants/storageKeys.ts`.
- **Auth**: `services/auth/authService.ts` (saat ini Demo Mode lokal). `services/api/`
  adalah scaffolding HTTP (`client`, `endpoints`, `interceptor`) untuk backend nyata.
- **Navigasi**: berbasis state (`state.activeTab`), bukan URL routing. `App.tsx`
  memilih halaman; `constants/routes.ts` menyimpan path acuan bila migrasi ke router.

## Alur data

```
UI (pages) ── dispatch(action) ──▶ appReducer ──▶ state baru
   ▲                                                 │
   └──────────── re-render (useApp) ◀────────────────┘
                         │
                         └─ effect persistensi ─▶ localStorage
```

## Responsif

`hooks/useMobile.ts`: Mobile `<768`, Tablet `768–1023`, Desktop `≥1024`.
Mobile memakai `TopNav` + `BottomNav` dan `<main>` sebagai area scroll; Tablet/Desktop
memakai `SideNav` + `TopNav` dengan tinggi root tetap (`h-dvh`) dan tiap halaman
scroll internal (`flex-1 min-h-0 overflow-y-auto`).

## Catatan scaffolding

`context/AuthContext.tsx`, `context/ThemeContext.tsx`, `services/notification`,
`services/analytics`, `constants/roles.ts`, `constants/permissions.ts`, dan
`hooks/useDebounce|useLocalStorage|useOnlineStatus` disiapkan untuk pengembangan
lanjut (RBAC, tema, offline, dsb) dan belum semua terpakai di UI.
