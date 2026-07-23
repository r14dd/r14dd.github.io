const CACHE = 'portfolio-v2';
const CORE = ['/'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const c = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, c));
          }
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('/'))),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const c = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, c));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    }),
  );
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'purge') e.waitUntil(caches.delete(CACHE));
});
