const CACHE_NAME = 'wbjee-finder-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/api/data',
  '/api/compression-status',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (
    url.startsWith('https://cdn.jsdelivr.net') ||
    url.startsWith('https://rsms.me')
  ) {
    return;
  }
  
  const cacheUrl = new URL(event.request.url);
  const cacheKey = cacheUrl.origin + cacheUrl.pathname;
  
  event.respondWith(
    caches.match(cacheKey)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request, {
          headers: {
            'Accept-Encoding': 'gzip, deflate, br'
          }
        }).catch((error) => {
          console.log('Fetch failed:', error);
          if (event.request.url.includes('.css')) {
            return new Response('/* CSS not available */', {
              headers: { 'Content-Type': 'text/css' }
            });
          }
          throw error;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 