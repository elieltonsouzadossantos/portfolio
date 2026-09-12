/*
 * sw.js — Service worker do portfólio Elidavy.
 *
 * Estratégia: "cache primeiro, com atualização em segundo plano" (modo
 * ESTÁTICO do kit PWA). Faz sentido aqui porque o portfólio é uma página
 * única que quase não muda — então vale mais a pena abrir instantaneamente
 * (até offline) do que sempre buscar a rede primeiro.
 *
 * Nota para reaproveitar este arquivo em projeto de cliente com conteúdo
 * que muda com frequência (catálogo de produtos, por exemplo): trocar a
 * estratégia da função `handleFetch` para "rede primeiro, cai pro cache só
 * se a rede falhar" nas rotas de conteúdo dinâmico, mantendo "cache
 * primeiro" só pra CSS/imagens/ícones. Ver DOCUMENTACAO_TECNICA.md, seção
 * de PWA, pra mais contexto dessa decisão.
 *
 * Toda vez que o conteúdo precache abaixo mudar de verdade (nova imagem,
 * novo CSS), suba o número da versão do cache — isso invalida o cache
 * antigo nos aparelhos que já instalaram o app.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `elidavy-portfolio-${CACHE_VERSION}`;

// Arquivos essenciais pra a página abrir por completo mesmo offline.
// Ajustar essa lista por projeto ao reaproveitar o kit.
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./images/logo.png",
  "./images/profile.jpg",
  "./images/catalog-preview.jpg",
  "./images/icons/icon-192.png",
  "./images/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("elidavy-portfolio-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só intercepta GET do mesmo domínio — deixa tudo o resto (ex.: link do
  // WhatsApp, chamadas de terceiros) seguir direto pra rede, sem passar
  // pelo cache.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Cache primeiro: responde na hora se já tiver localmente, e atualiza o
  // cache em segundo plano pra próxima visita (stale-while-revalidate).
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkFetch; // deixa atualizar em segundo plano, sem bloquear a resposta
    return cached;
  }

  const fresh = await networkFetch;
  if (fresh) return fresh;

  // Sem cache e sem rede: se for uma navegação de página, cai pro
  // index.html cacheado em vez de mostrar o erro padrão do navegador.
  if (request.mode === "navigate") {
    const fallback = await cache.match("./index.html");
    if (fallback) return fallback;
  }

  return new Response("Offline e sem versão em cache para este recurso.", {
    status: 503,
    statusText: "Offline",
  });
}
