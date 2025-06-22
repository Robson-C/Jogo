const CACHE_NAME = 'torre-redencao-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './player.js',
  './combat.js',
  './enemy.js',
  './rooms.js',
  './ui.js',
  './manifest.json'
];

// Instala o service worker e cacheia os arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Intercepta requisições e serve do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        // Senão, busca na rede
        return fetch(event.request);
      })
  );
});

// Ativa novo service worker e limpa cache antigo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});