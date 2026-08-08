/* The-Gerett-Studio — service worker (PWA instalável) */
const CACHE = 'gerett-shell-v1';
const OFFLINE = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll([
        './',
        './index.html',
        './css/styles.css',
        './js/app.js',
        './manifest.webmanifest',
        './icons/icon-192.png',
        './icons/icon-512.png'
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isNav = req.mode === 'navigate';

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(isNav ? OFFLINE : req, copy));
        }
        return res;
      })
      .catch(() => caches.match(isNav ? OFFLINE : req).then((hit) => hit))
  );
});
