const CACHE_NAME = 'madhuban-cache-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/images/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Exclude development-specific paths, hot-reloading (HMR), and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('hmr') ||
    url.pathname.includes('turbopack') ||
    url.pathname.startsWith('/api')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async (err) => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw err;
    })
  );
});
