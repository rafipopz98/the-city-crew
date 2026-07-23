"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FIRST_PAGE_KEY = "tcc_first_page";
const LAST_PAGE_KEY = "tcc_last_page";

/** Routes where we should NOT update the "last page" tracker */
const AUTH_ROUTES = new Set(["/sign-up", "/login"]);

/**
 * Invisible component that tracks:
 *
 * 1. **First Landing Page** — The very first page the visitor landed on.
 *    Set once in localStorage and never overwritten.
 *
 * 2. **Conversion Page** — The last non-auth page the visitor was on.
 *    Updated on every page visit EXCEPT `/sign-up` and `/login`, so when
 *    the user arrives at the sign-up / login page, this still holds the
 *    page they came from.
 *
 * Place this in the root layout so it runs on every route change.
 */
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // ── 1. First landing page (set once, never change) ───────────────
    // localStorage ops are idempotent, so StrictMode double-run is harmless.
    if (!localStorage.getItem(FIRST_PAGE_KEY)) {
      localStorage.setItem(FIRST_PAGE_KEY, pathname);
    }

    // ── 2. Last / conversion page ────────────────────────────────────
    // Only update if the current page is NOT an auth page. This way,
    // when the user lands on sign-up/login, the stored value is still
    // the *previous* page they were on.
    if (!AUTH_ROUTES.has(pathname)) {
      localStorage.setItem(LAST_PAGE_KEY, pathname);
    }
  }, [pathname]);

  return null;
}

// ─── Read helpers for use in auth components ────────────────────────────────

export function getFirstLandingPage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FIRST_PAGE_KEY);
}

export function getConversionPage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_PAGE_KEY);
}
