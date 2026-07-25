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
import { hub, setHubCallbacks } from "@/lib/game/socket/hub";
import { matchmaking, setOnMatchReady } from "@/lib/game/socket/matchmaking";
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

  // Wire up polling lifecycle (avoids circular import hub ↔ matchmaking)
  setHubCallbacks({
    onFirstConnection: (instanceId) => matchmaking.startPolling(instanceId),
    onZeroConnections: () => matchmaking.stopPolling(),
  });
  return experimental_upgradeWebSocket((ws) => {
    console.log("[PvP-Server-Vercel] ⚡ New WebSocket connection via /api/ws");

    ws.on("message", (data: WebSocketData) => {
      let raw = "";
      try {
        raw = data.toString();
        const message: ClientMessage = JSON.parse(raw);
        console.log(`[PvP-Server-Vercel] Received: ${message.type}`);
        handleMessage(ws, message).catch((err) =>
          console.error("[ws] handler error:", err)
        );
      } catch {
        console.warn("[PvP-Server-Vercel] Failed to parse:", raw.slice(0, 200));
      }
    });

    ws.on("close", () => {
      console.log("[PvP-Server-Vercel] WebSocket disconnected");
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
