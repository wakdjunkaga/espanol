const CACHE = 'eco-26b4055203';
const FILES = ["./", "audio/no-puedo-1-7deb18.mp3", "audio/no-puedo-2-91caff.mp3", "audio/quieres-tomar-algo-1-1ec792.mp3", "audio/quiero-comer-ahora-1-5a8c27.mp3"];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks =>
  Promise.all(ks.filter(k => k.startsWith('eco-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Page: network first so new sentences show up; offline falls back to the cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); }
      return r;
    }).catch(() => caches.match('./', {ignoreSearch: true})));
    return;
  }
  // Recordings: cache first (file names carry a fingerprint, so a new take is a new name).
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request.url, {ignoreSearch: true}).then(hit =>
    hit || fetch(e.request.url).then(r => { if (r.ok) c.put(e.request.url, r.clone()); return r; }))));
});
