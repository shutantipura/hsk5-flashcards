// Offline support: app shell + vocab cached; network-first so updates arrive when online.
const CACHE = 'hsk5-v2.5.0';
const SHELL = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'data/vocab.json', 'data/examples-1.json', 'data/examples-2.json', 'data/examples-3.json', 'data/examples-4.json', 'data/examples-5.json', 'icons/icon-180.png', 'icons/icon-192.png',
  'js/app.js', 'js/reader.js', 'js/flashcards.js', 'js/practice.js', 'js/practice-data.js', 'js/grammar.js', 'js/learning-mode.js', 'js/grammar-data.js', 'js/examples.js', 'js/api.js', 'js/config.js', 'js/engine.js', 'js/fsrs.js', 'js/idb.js', 'js/report.js', 'js/store.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Supabase calls go straight to network
  const full = fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  });
  const slow = new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 3500));
  // Network first; if the network is slow or down, use the cached copy (and fall back to waiting if not cached).
  e.respondWith(Promise.race([full, slow]).catch(() => caches.match(e.request, { ignoreSearch: true })
    .then((r) => r || full.catch(() => caches.match('index.html')))));
});
