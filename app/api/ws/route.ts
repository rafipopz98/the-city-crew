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
import { handleMessage, streamRemoteMatch } from "@/lib/game/socket/handler";
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
    // Register is done by the first message (matchmaking:join)
    // We just attach the message handler

    ws.on("message", (data: WebSocketData) => {
      let message: ClientMessage;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return; // ignore non-JSON
      }

      handleMessage(ws, message).catch((err) =>
        console.error("[ws] handler error:", err)
      );
    });

    ws.on("close", () => {
      console.log("[ws] client disconnected");
      hub.unregister(ws);
    });

    ws.on("error", (err) => {
      console.error("[ws] error:", err.message);
      hub.unregister(ws);
    });
  });
}
