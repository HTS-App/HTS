/* HTS app shell — service worker.
   Keeps the shell (this page, icons, settings) on the phone so the icon opens instantly.
   The HTS app itself always loads live from Google, so data is never stale. */
const CACHE = 'hts-shell-v1.0.3';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192-v2.png', './icons/icon-512-v2.png', './icons/maskable-512-v2.png', './icons/favicon-v2.png', './img/bg.jpg', './img/logo-full.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;   // Google / app requests: never touched
  // Network first (always the newest page, settings, icons); the saved copy is used only when offline.
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
