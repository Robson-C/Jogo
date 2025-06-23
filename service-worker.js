// service-worker.js — PWA 100% offline para Torre da Redenção
const CACHE_NAME = 'torre-cache-v1.0.0';

const FILES_TO_CACHE = [
  './',
  'index.html',
  'style.css',
  'game.js',
  'status.js',
  'exploration.js',
  'ui.js',
  'combat.js',
  'enemyBehaviors.js',
  'buffUtils.js',
  'manifest.json',
  'icon.svg',
  // Imagens estáticas, adicione outras se houver
  'background.png',
  'background_game.png',
  'botao.png'
];

// Instala o SW e faz cache dos arquivos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .catch(() => {})
  );
  self.skipWaiting();
});

// Remove caches antigos ao ativar nova versão do SW
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta requests: responde do cache ou tenta rede (fallback ao cache se offline)
self.addEventListener('fetch', event => {
  // Apenas GET e apenas requests locais (não cacheia chamadas externas)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('index.html'))
  );
});
