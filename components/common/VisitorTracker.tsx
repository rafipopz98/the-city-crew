"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "tcc_geo_captured";
const DELAY_MS = 10_000; // 10 seconds

/**
 * Invisible component that tracks a visitor's geo-location **once**.
 *
 * Flow:
 * 1. On mount, check localStorage for `tcc_geo_captured` flag
 * 2. If already true → do nothing (already tracked this visitor)
 * 3. If false / missing → wait 10 seconds
 * 4. After 10s, call `/api/geo` which fetches data from geojs.io and
 *    upserts a record in the VisitorGeo collection (with count increment)
 * 5. Set `tcc_geo_captured` in localStorage to prevent re-tracking
 *
 * Place this in the root layout so it runs on every page.
 */
export function VisitorTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    // ── Guard: only run once per page session ───────────────────────
    if (trackedRef.current) return;

    // ── Check localStorage ──────────────────────────────────────────
    const alreadyCaptured = localStorage.getItem(STORAGE_KEY) === "true";
    if (alreadyCaptured) return;

    trackedRef.current = true;

    // ── Wait 10 seconds, then send the geo request ──────────────────
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/geo", {
          // Use keepalive so the request completes even if the user
          // navigates away during the 10-second window.
          keepalive: true,
        });
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Silently fail — geo tracking is a nice-to-have.
        // The flag is NOT set, so it will retry on the next visit.
        console.warn("Visitor geo tracking failed");
      }
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // This component renders nothing
  return null;
}
