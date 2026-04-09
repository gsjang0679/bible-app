self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Bypass cache completely and fetch from network
  e.respondWith(fetch(e.request));
});
