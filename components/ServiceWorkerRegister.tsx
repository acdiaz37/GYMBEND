"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const clearCachesAndUnregister = async () => {
      let hadRegistration = false;

      // Unregister any existing service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        hadRegistration = true;
        await registration.unregister();
      }

      // Clear all caches to prevent stale/broken assets in Chrome
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      // Reload once if a service worker was cleared so Chrome fetches fresh assets
      if (hadRegistration && !sessionStorage.getItem("gymbend_sw_cleared")) {
        sessionStorage.setItem("gymbend_sw_cleared", "1");
        window.location.reload();
      }
    };

    clearCachesAndUnregister();
  }, []);

  return null;
}
