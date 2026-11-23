/* Кото-Лут v2.2.1 — сервис-воркер: офлайн-кэш и установка PWA.
   Положить рядом с koto-lut.html на raidopert.ru (регистрация происходит
   в игре только на http/https — при открытии с файла SW не активируется). */
const CACHE = 'koto-lut-v2.2.1';
const CORE = ['./', './koto-lut.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        try {
          if (res.ok && new URL(e.request.url).origin === location.origin) {
            const cp = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
          }
        } catch (err) { /* opaque/нестандартные ответы просто не кэшируем */ }
        return res;
      }).catch(function () { return caches.match('./koto-lut.html'); });
    })
  );
});
