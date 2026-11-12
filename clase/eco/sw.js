const CACHE = 'eco-e1fec5277f';
const FILES = ["./", "audio/no-puedo-1.mp3", "audio/no-puedo-2.mp3", "audio/quieres-tomar-algo-1.mp3", "audio/quiero-comer-ahora-1.mp3"];
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
  // Recordings: cache first. Range requests are answered whole from the cache.
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request.url, {ignoreSearch: true}).then(hit =>
    hit || fetch(e.request.url).then(r => { if (r.ok) c.put(e.request.url, r.clone()); return r; }))));
});
