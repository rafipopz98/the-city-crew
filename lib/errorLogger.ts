/**
 * 🔥 ERROR LOGGING UTILITY
 *
 * Toggle the flag below to enable/disable ALL error logging across the app.
 *
 *   true  → errors are logged to the error_logs collection
 *   false → errors are silently skipped (no DB writes)
 *
 * Usage (single line in catch blocks):
 *   await logError('/api/blogs/create', 'POST', error);
 *   await logError('/api/matches', 'GET', error, 500);
 *   await logError('/api/newsletter', 'POST', err);
 */

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
// Set to `false` to disable error logging across the entire app.
const ACTIVE = true;
// ──────────────────────────────────────────────────────────────────────────────

import { connectDB } from "@/lib/db/mongoose";
import { ErrorLogModel } from "@/lib/models/ErrorLog";

const EXCLUDED_ENDPOINTS = ["/me", "/refresh"];
const EXCLUDED_STATUS_CODES = [401, 403];

export async function logError(
  endpoint: string,
  method: string,
  error?: unknown,
  statusCode: number = 500,
): Promise<void> {
  // ─── Global toggle ─────────────────────────────────────────────────────────
  if (!ACTIVE) return;

  // ─── Skip excluded endpoints ───────────────────────────────────────────────
  if (EXCLUDED_ENDPOINTS.some((path) => endpoint.includes(path))) {
    return;
  }

  // ─── Skip excluded status codes ────────────────────────────────────────────
  if (EXCLUDED_STATUS_CODES.includes(statusCode)) {
    return;
  }

  // ─── Extract message ───────────────────────────────────────────────────────
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String((error as { message: unknown }).message);
  } else {
    message = "Unknown error";
  }

  // ─── Persist to DB (never throws) ──────────────────────────────────────────
  try {
    await connectDB();

    await ErrorLogModel.create({
      endpoint,
      method: method.toUpperCase(),
      message,
      status_code: statusCode,
      error_stack: error instanceof Error ? error.stack || null : null,
    });
  } catch (dbError) {
    console.error("❌ ErrorLogger: Failed to save error log:", dbError);
  }
}
