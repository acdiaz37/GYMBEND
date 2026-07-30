// Cleanup service worker: wipes any previously cached content and unregisters itself.
// This guarantees Chrome fetches the latest version instead of serving stale assets.

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  );
  self.clients.claim();
  // Unregister this cleanup worker once it has taken control.
  self.registration.unregister();
});

// Do not intercept any requests; let the browser fetch everything fresh.
self.addEventListener("fetch", (event) => {
  return;
});
