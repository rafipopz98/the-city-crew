"use client";

import { useEffect } from "react";
import { extractUtmFromUrl, persistUtm } from "@/lib/utm";

/**
 * Invisible component that captures UTM parameters from the current page URL
 * and stores them in a 30-day cookie. Place this in the root layout so it
 * runs on every page.
 *
 * If the URL does not contain any UTM params, existing cookie data is preserved.
 */
export function UtmCapture() {
  useEffect(() => {
    const utm = extractUtmFromUrl();
    if (Object.keys(utm).length > 0) {
      persistUtm(utm);
    }
  }, []);

  // This component renders nothing
  return null;
}
