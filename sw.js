const CACHE_VERSION = "fs4-shell-v19";
const MEDIA_CACHE = "fs4-media-v1";
const VOICE = Array.from({ length: 40 }, (_, i) => `./assets/voice/n${i + 1}.mp3`);
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./plan.js",
  "./workout-core.js",
  "./storage.js",
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

function isMediaUrl(url) {
  return url.pathname.includes("/videos/clips/") || url.pathname.includes("/assets/voice/");
}

function parseRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value || "");
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!suffix) return { invalid: true };
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }
  if (start >= size || end < start) return { invalid: true };
  end = Math.min(end, size - 1);
  return { start, end };
}

async function rangeFromCachedResponse(response, rangeHeader) {
  if (!response || response.status !== 200 || response.headers.has("Content-Range")) return null;
  const body = await response.arrayBuffer();
  const range = parseRange(rangeHeader, body.byteLength);
  if (!range) return null;
  if (range.invalid) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${body.byteLength}`, "Accept-Ranges": "bytes" }
    });
  }
  const headers = new Headers(response.headers);
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${body.byteLength}`);
  headers.set("Content-Length", String(range.end - range.start + 1));
  headers.set("Accept-Ranges", "bytes");
  return new Response(body.slice(range.start, range.end + 1), { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const shell = await caches.open(CACHE_VERSION);
    await shell.addAll(SHELL);
    const media = await caches.open(MEDIA_CACHE);
    for (const path of VOICE) {
      try {
        const request = new Request(path, { cache: "reload" });
        const response = await fetch(request);
        if (response.ok && response.status === 200 && !response.headers.has("Content-Range")) {
          await media.put(request, response);
        }
      } catch (_) {}
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const media = await caches.open(MEDIA_CACHE);
    const keys = await caches.keys();
    for (const key of keys.filter(name => name.startsWith("fs4-shell-") && name !== CACHE_VERSION)) {
      const oldShell = await caches.open(key);
      for (const request of await oldShell.keys()) {
        const url = new URL(request.url);
        if (isMediaUrl(url)) {
          const response = await oldShell.match(request);
          if (response && response.status === 200 && !response.headers.has("Content-Range")) {
            await media.put(request, response);
          }
        }
      }
      await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  const messageType = typeof event.data === "string" ? event.data : event.data?.type;
  if (messageType === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (messageType !== "CACHE_STATUS" || !event.ports || !event.ports[0]) return;
  event.waitUntil((async () => {
    const shell = await caches.open(CACHE_VERSION);
    const media = await caches.open(MEDIA_CACHE);
    const requests = await media.keys();
    const port = event.ports[0];
    port.postMessage({
      shellReady: (await Promise.all(SHELL.map(path => shell.match(path)))).every(Boolean),
      voices: requests.filter(request => new URL(request.url).pathname.includes("/assets/voice/")).length,
      clips: requests.filter(request => new URL(request.url).pathname.includes("/videos/clips/")).length,
      version: CACHE_VERSION
    });
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isMediaUrl(url)) {
    event.respondWith((async () => {
      const media = await caches.open(MEDIA_CACHE);
      const lookup = new Request(event.request.url, { method: "GET" });
      const cached = await media.match(lookup);
      if (event.request.headers.has("Range")) {
        if (cached) {
          const partial = await rangeFromCachedResponse(cached, event.request.headers.get("Range"));
          if (partial) return partial;
        }
        return fetch(event.request);
      }
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.status === 200 && response.ok && !response.headers.has("Content-Range")) {
        event.waitUntil(media.put(lookup, response.clone()));
      }
      return response;
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok && response.status === 200) {
        const shell = await caches.open(CACHE_VERSION);
        event.waitUntil(shell.put(event.request, response.clone()));
      }
      return response;
    } catch (_) {
      const shell = await caches.open(CACHE_VERSION);
      const cached = await shell.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") {
        const page = await shell.match("./index.html");
        if (page) return page;
      }
      return new Response("Offline and no cached response is available.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
