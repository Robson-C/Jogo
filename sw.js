/* [DOC] Service Worker do jogo "Torre da Redenção"
   - Estratégia: cache estático + stale-while-revalidate em segundo plano
   - Política: nenhuma atualização durante a sessão; novas versões só no próximo início (Regra 5)
   - Escopo: relativo à pasta atual (./)
   - Rede: somente mesma origem; nenhuma chamada iniciada pelo app (apenas interceptação)
*/
const APP_VERSION = '0.1.1'; // [STATE] aumentar manualmente ao publicar nova versão
const STATIC_CACHE = `tdr-static-v${APP_VERSION}`;
const RUNTIME_CACHE = `tdr-runtime-v${APP_VERSION}`;

// [DOC] Lista mínima de assets para abrir offline (precached)
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './game.js',
  './ui.js',
  './i18n.js',
  './manifest.json',
  './icon-192.png'
];

// Instalação: pré-carrega assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

// Ativação: limpa caches antigos que não correspondem à versão atual
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Importante: sem clients.claim() e sem skipWaiting — atualização só aplica no próximo start
});

// Fetch: cache-first para mesma origem, com atualização silenciosa em segundo plano
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // somente mesma origem

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          // Apenas respostas básicas (mesma origem) e 200 OK
          if (res && res.status === 200 && res.type === 'basic') {
            const putPromise = caches.open(RUNTIME_CACHE).then((cache) =>
              cache.put(req, res.clone())
            );
            event.waitUntil(putPromise);
          }
          return res;
        })
        .catch(() => cached); // offline: usa cache se houver

      // Se houver cache, responde imediato e atualiza em background
      return cached || networkFetch;
    })
  );
});
