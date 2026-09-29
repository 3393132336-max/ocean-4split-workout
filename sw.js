const CACHE_VERSION = "fs4-shell-v9";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/bg-surface.jpg",
  "./assets/bg-underwater.jpg",
  "./assets/bg-day1.jpg",
  "./assets/bg-day2.jpg",
  "./assets/bg-day3.jpg",
  "./assets/bg-day4.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // 视频与图片资产：缓存优先（体积大、不常变）
  if (url.pathname.includes("/videos/clips/") || url.pathname.includes("/assets/")) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy)); }
      return response;
    })));
    return;
  }
  // 页面与代码：网络优先，离线时回退缓存（保证刷新即能拿到新版本）
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html"))));
});
