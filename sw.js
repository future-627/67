// 曉風的個人網頁喵 — 離線快取
// 版本號改變時會自動清掉舊快取，記得每次更新網站內容就順手改一下 CACHE_NAME
const CACHE_NAME = 'xiaofeng-site-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon-32.png',
  './favicon-192.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 策略：核心頁面優先用快取（離線也能開），其他請求則「網路優先，失敗才退回快取」
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // 不快取第三方資源（例如 Google Fonts）

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
