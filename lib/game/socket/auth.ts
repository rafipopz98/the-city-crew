/**
 * WebSocket Authentication
 *
 * The PvP socket previously trusted whatever `userId` a client sent in its
 * `matchmaking:join` payload — no verification against the actual signed-in
 * session, so a client could join as (impersonate) any user, or manipulate
 * match/reward attribution. This verifies the same accessToken cookie the
 * rest of the app already uses, at WebSocket connection time.
 */

import { verifyToken } from "@/lib/auth/jwt";

/** Parse the `accessToken` cookie out of a raw `Cookie` header string. */
export function extractAccessTokenFromCookieHeader(
  cookieHeader?: string | null,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("accessToken=")) {
      return decodeURIComponent(trimmed.slice("accessToken=".length));
    }
  }
  return null;
}

/**
 * Verify a WebSocket upgrade request's session cookie.
 * Returns the real, authenticated userId, or null if missing/invalid.
 */
export async function verifyWsAuth(
  cookieHeader?: string | null,
): Promise<string | null> {
  const token = extractAccessTokenFromCookieHeader(cookieHeader);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || typeof payload.userId !== "string") return null;
  return payload.userId;
}
