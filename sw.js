/* Offline support: network first, cached copy when offline. Bump VERSION on every publish.
   Cache names MUST start with this app's PREFIX: all isaymotion apps share one origin and one cache storage. */
const PREFIX = 'mitrainer-';
const VERSION = PREFIX + '1.5.0';
const CORE = ['./', './index.html', './css/app.css', './js/app.js', './data/app-meta.js', './data/changelog.js', './data/hospital.js', './data/strings.js', './data/chapters.js', './data/ch01.js', './data/ch02.js', './data/ch03.js', './data/ch04.js', './data/ch05.js', './data/ch06.js', './icons/apple-touch-icon.png', './icons/favicon-32.png', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', (event) => {
  // add() one by one so a not-yet-uploaded icon cannot make the whole install fail;
  // cache:'reload' skips the browser HTTP cache so a new VERSION never stores last release's files
  event.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // Only delete this app's own old caches: other study apps on isaymotion.github.io share this cache storage.
      .then((keys) => Promise.all(keys.filter((k) => k.indexOf(PREFIX) === 0 && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
