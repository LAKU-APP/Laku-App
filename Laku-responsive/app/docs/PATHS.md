# Peta Folder Singkat — Laku-responsive (app)

> Versi ringkas untuk skim cepat. Untuk konteks lengkap (arsitektur, class
> diagram, use case, alur auth) lihat [`CODEBASE_GUIDE.md`](./CODEBASE_GUIDE.md).

## Root (`app/`)
- `package.json`, `vite.config.ts` (base `/Laku-App/`, port 3000), `tailwind.config.js`,
  `postcss.config.js`, `tsconfig.json`/`tsconfig.app.json`, `index.html`.
- `docs/` — dokumentasi (folder ini).
- `public/` — `manifest.webmanifest`, `sw.js` (service worker, prod only), ikon.

## `src/`
- `main.tsx` — bootstrap: `StrictMode > ErrorBoundary > AppProvider > App`.
- `App.tsx` — root component: splash → gate login → gate onboarding → layout + halaman aktif.
- `styles/` — `globals.css`, `variables.css`, `themes.css`, `animations.css`.

### `src/context/`
- `AppContext.tsx` — **state global aktif** (`useReducer`), satu-satunya sumber kebenaran data.
- `AuthContext.tsx`, `ThemeContext.tsx` — scaffolding, **belum dipakai**.

### `src/pages/` (satu subfolder per fitur)
- `Auth/LoginPage.tsx` (login & register), `Auth/RegisterPage.tsx` (wrapper tipis)
- `Onboarding/OnboardingPage.tsx`
- `Dashboard/DashboardPage.tsx`
- `Products/ProductsPage.tsx`, `ProductCard.tsx`, `ProductForm.tsx`
- `POS/POSPage.tsx`, `Cart.tsx`, `Checkout.tsx`
- `Records/RecordsPage.tsx`
- `Insights/InsightsPage.tsx`
- `Settings/SettingsPage.tsx`

### `src/components/`
- `navigation/` — `TopNav.tsx`, `SideNav.tsx`, `BottomNav.tsx`
- `modals/` — `ModalSheet.tsx`
- `feedback/` — `Toast.tsx`, `ErrorBoundary.tsx`
- `branding/` — `Splash.tsx`, `LakuLogo.tsx`, `LakuWordmark.tsx`
- `forms/`, `tables/` — kosong (`.gitkeep`), belum dipakai
- `ui/` — ~40 komponen generic shadcn/Radix (`button.tsx`, `dialog.tsx`, `card.tsx`, dst.)

### `src/services/`
- `auth/authService.ts` — Demo Mode auth (register/login/onboarding/kontak akun, semua lokal).
- `storage/storage.ts` — wrapper aman `localStorage` (`readStorage`/`writeStorage`/`removeStorage`).
- `api/client.ts`, `api/endpoints.ts`, `api/interceptor.ts` — scaffolding fetch wrapper untuk backend nyata, belum terhubung.
- `notification/`, `analytics/` — scaffolding no-op.

### `src/hooks/`
- `useMobile.ts` — `useIsMobile`/`useIsTablet`/`useIsDesktop` (dipakai luas).
- `useDebounce.ts`, `useLocalStorage.ts` — siap pakai, minim dipakai.
- `useOnlineStatus.ts` — scaffolding, tidak dipakai.

### `src/utils/`
- `currency.ts` — **satu-satunya** sumber hitung uang (revenue/expense/profit/cash/format).
- `date.ts`, `formatter.ts`, `helpers.ts` (`cn()`, `generateId()`, `parseNonNegativeInt()`), `feedback.ts` (haptic/sound), `string.ts`.

### `src/constants/`
- `storageKeys.ts` — semua key `localStorage` (hindari typo string).
- `routes.ts`, `roles.ts`, `permissions.ts` — scaffolding RBAC/router, belum ditegakkan di UI.

### `src/types/`
- `auth.ts`, `user.ts`, `product.ts`, `transaction.ts`, `index.ts` (barrel, diimpor sebagai `@/types`).

## Yang **tidak** ada lagi (jangan dicari)
- `src/lib/` (`api.ts`, `finance.ts`, `storage.ts`, `utils.ts`) — sudah dipecah ke `services/`, `utils/`, `types/`.
- `pages/Login.tsx` tunggal — sekarang `pages/Auth/LoginPage.tsx` + `RegisterPage.tsx`.
- `components/Onboarding.tsx` — sekarang `pages/Onboarding/OnboardingPage.tsx`.
- `hooks/use-mobile.ts` — sekarang `hooks/useMobile.ts`.
- `types/index.ts` sebagai satu-satunya file tipe — sekarang barrel yang re-export dari beberapa file tipe terpisah.
- `src/sections/` — pernah muncul di output tooling awal (lihat `info.md`), tidak pernah dibuat di proyek ini.

## Alias import
`@/` → `src/` (lihat `tsconfig.json` / `vite.config.ts`), contoh: `@/context/AppContext`, `@/utils/currency`, `@/types`.
