"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on the client side.
 * Place this in the root layout.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    // Only register in production or when explicitly enabled
    if (
      process.env.NODE_ENV !== "production" &&
      !window.location.search.includes("sw=1")
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.debug("[SW] Registered");
      })
      .catch((err) => {
        console.debug("[SW] Registration failed:", err);
      });
  }, []);

  return null;
}
