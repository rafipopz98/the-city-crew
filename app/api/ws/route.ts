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
import { handleMessage } from "@/lib/game/socket/handler";
import { hub } from "@/lib/game/socket/hub";
import type { ClientMessage } from "@/lib/game/socket/protocol";

export function GET() {
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

      handleMessage(ws, message);
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
