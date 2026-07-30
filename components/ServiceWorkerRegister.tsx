"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register the cleanup service worker. It will clear any stale caches,
    // take control of the page, and then unregister itself so future loads
    // always fetch fresh assets.
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        registration.update();
      })
      .catch(() => {
        // Ignore registration errors; the inline script already clears caches.
      });
  }, []);

  return null;
}
