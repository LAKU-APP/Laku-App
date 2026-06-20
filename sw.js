// Service worker LAKU — strategi NETWORK-FIRST.
// Tujuan: app tetap bisa di-install (PWA) & punya fallback offline, TANPA
// pernah menyajikan bundle lama saat online (menghindari bug "perubahan tak
// muncul"). Saat ada koneksi, selalu ambil versi terbaru dari jaringan;
// cache hanya dipakai sebagai cadangan ketika offline.

const CACHE = 'laku-runtime-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Hapus cache versi lama.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Hanya tangani permintaan same-origin.
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Fallback terakhir untuk navigasi: index.html dari cache.
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/Laku-App/index.html');
          if (fallback) return fallback;
        }
        throw new Error('offline dan tidak ada cache');
      }
    })(),
  );
});
