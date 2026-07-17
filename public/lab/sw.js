/* /lab/sw.js — offline service worker for the lab page ONLY.
 *
 * Registered with the default scope of its own location (/lab/), so it can only
 * ever control /lab pages — the main site is never intercepted. Strategy:
 *   - navigations  -> network-first, fall back to cache (fresh content online,
 *                     still works offline). Never serves a stale shell online.
 *   - GET assets   -> stale-while-revalidate (instant, refreshes in background).
 * Send {type:'purge'} to wipe the cache; unregister from the page to fully clean up.
 */
const CACHE = 'lab-cache-v1';
const CORE = ['/lab/', '/lab/lab.wasm'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'purge') {
    event.waitUntil(caches.delete(CACHE));
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('/lab/'))),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
