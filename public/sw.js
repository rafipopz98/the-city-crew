// ─── The City Crew — Service Worker ─────────────────────────────────────────
// Cache name — bump version to force re-cache everything
const CACHE = "tcc-v1";

// ─── Install: pre-cache critical assets ─────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          "/",
          "/manifest.json",
          "/homescreen.png",
          "/logo.svg",
          "/logo.png",
          "/logo-dark.png",
        ]),
      ),
  );
});

// ─── Activate: clean old caches ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// ─── Fetch: network-first, fallback to cache ────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls (we want fresh data)
  if (event.request.url.includes("/api/")) return;

  // Skip non-HTTP(S) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok || response.type === "opaqueredirect") {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;

          // If it's a navigation request, serve the shell
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }

          return new Response("Offline", { status: 503 });
        });
      }),
  );
});
