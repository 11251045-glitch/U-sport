// U-Sport 集點小幫手 · Service Worker 2026
const CACHE = 'usport-v2';
// Use relative paths so the SW works at any hosting path (root or subdirectory)
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // addAll with individual error handling to avoid full failure on one bad asset
      return Promise.allSettled(ASSETS.map(url => c.add(url).catch(err => {
        console.warn('[SW] Failed to cache:', url, err);
      })));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => {
      // Offline fallback — return cached index.html for navigation requests
      if (e.request.mode === 'navigate') return caches.match('./index.html');
    }))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
