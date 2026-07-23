"use client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  [key: string]: string | undefined;
}

export interface GeoData {
  ip?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  organization?: string;
}

export interface StoredUtmData {
  utm: UtmParams;
  captured_at: string;
}

// ─── Cookie helpers ─────────────────────────────────────────────────────────

const UTM_COOKIE = "tcc_utm";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ─── UTM param extraction from URL ───────────────────────────────────────────

/** Known non-utm_ keys that we always track */
const EXTRA_TRACKED_KEYS = ["gclid", "fbclid"];

/**
 * Extract UTM-related params from the current page URL.
 *
 * Captures **all** query params starting with `utm_` dynamically (so any
 * custom utm_ param is picked up without a code change), plus well-known
 * non-utm_ keys like gclid / fbclid.
 */
export function extractUtmFromUrl(): UtmParams {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};

  for (const [key, value] of params.entries()) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    if (key.startsWith("utm_") || EXTRA_TRACKED_KEYS.includes(key)) {
      utm[key] = trimmed;
    }
  }

  return utm;
}

/**
 * Read stored UTM data from the cookie.
 */
export function readStoredUtm(): UtmParams | null {
  if (typeof window === "undefined") return null;

  const raw = getCookie(UTM_COOKIE);
  if (!raw) return null;

  try {
    const parsed: StoredUtmData = JSON.parse(raw);
    return parsed.utm;
  } catch {
    return null;
  }
}

/**
 * Save UTM params to a cookie with a 30-day expiry.
 * Merges with any existing stored params — new params from the URL win.
 */
export function persistUtm(utm: UtmParams): void {
  if (typeof window === "undefined") return;

  const existing = readStoredUtm() || {};
  const merged: UtmParams = { ...existing, ...utm };

  // Only persist if we actually have at least one key
  const hasKeys = Object.values(merged).some((v) => v !== undefined);
  if (!hasKeys) return;

  const data: StoredUtmData = {
    utm: merged,
    captured_at: new Date().toISOString(),
  };

  setCookie(UTM_COOKIE, JSON.stringify(data), COOKIE_MAX_AGE);
}

/**
 * Clear the UTM cookie.
 */
export function clearUtmCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${UTM_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
