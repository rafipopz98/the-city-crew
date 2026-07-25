/**
 * WebSocket Route
 *
 * Handles WebSocket connections for the PvP multiplayer mode.
 * Uses @vercel/functions to upgrade HTTP to WebSocket.
 *
 * Must be run with `vercel dev` locally (not `next dev`).
 */

import { experimental_upgradeWebSocket } from "@vercel/functions";
import type { WebSocketData } from "@vercel/functions";
import { handleMessage, streamRemoteMatch, clearRecentlyJoined } from "@/lib/game/socket/handler";
import { hub } from "@/lib/game/socket/hub";
import { setOnMatchReady } from "@/lib/game/socket/matchmaking";
import type { ClientMessage } from "@/lib/game/socket/protocol";
import type { WebSocket } from "ws";

export function GET() {
  // Wire up cross-instance match streaming (inside GET so it's lazy)
  if (typeof setOnMatchReady === "function") {
    setOnMatchReady(async (ws: WebSocket, matchId: string, opponentUserId: string) => {
      await streamRemoteMatch(ws, matchId, opponentUserId);
    });
  } else {
    console.warn("[ws] setOnMatchReady not available — cross-instance PvP won't work");
  }
  return experimental_upgradeWebSocket((ws) => {
    ws.on("message", (data: WebSocketData) => {
      try {
        const raw = data.toString();
        const message: ClientMessage = JSON.parse(raw);
        handleMessage(ws, message).catch((err) =>
          console.error("[ws] handler error:", err)
        );
      } catch {
        // malformed message — ignore
      }
    });

    ws.on("close", () => {
      const conn = hub.getConnectionBySocket(ws);
      if (conn) {
        clearRecentlyJoined(conn.userId);
      }
      hub.unregister(ws);
    });

    ws.on("error", (err) => {
      console.error("[PvP-Server-Vercel] error:", err.message);
      hub.unregister(ws);
    });
  });
}
