/**
 * Development WebSocket Server
 *
 * Runs alongside `next dev` for local development of PvP multiplayer.
 * `next dev` cannot handle @vercel/functions' experimental_upgradeWebSocket,
 * so this server provides WebSocket support on a separate port.
 *
 * The client auto-detects localhost and connects here instead of /api/ws.
 *
 * Reuses the same hub/handler/matchmaking logic as the Vercel deployment.
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local so Redis client finds KV_REST_API_URL / KV_REST_API_TOKEN
config({ path: resolve(".env.local") });

import { WebSocketServer, WebSocket } from "ws";
import { handleMessage, streamRemoteMatch, clearRecentlyJoined } from "../lib/game/socket/handler";
import { hub } from "../lib/game/socket/hub";
import { setOnMatchReady } from "../lib/game/socket/matchmaking";
import type { ClientMessage } from "../lib/game/socket/protocol";

// Wire up cross-instance match streaming
setOnMatchReady(async (ws: WebSocket, matchId: string, opponentUserId: string) => {
  await streamRemoteMatch(ws, matchId, opponentUserId);
});

const PORT = 3001;

const wss = new WebSocketServer({ port: PORT });

console.log(`\x1b[36m[dev-ws]\x1b[0m WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.warn("[PvP-Server] New WebSocket connection (total:", wss.clients.size, ")");

  ws.on("message", (data: Buffer) => {
    try {
      const raw = data.toString();
      const message: ClientMessage = JSON.parse(raw);
      handleMessage(ws, message).catch((err) =>
        console.error("[dev-ws] handler error:", err)
      );
    } catch {
      // malformed message — ignore
    }
  });

  ws.on("close", () => {
    console.warn("[PvP-Server] WebSocket disconnected (remaining:", wss.clients.size - 1, ")");

    // Clear the duplicate-join flag so the next page navigation isn't blocked
    const conn = hub.getConnectionBySocket(ws);
    if (conn) {
      clearRecentlyJoined(conn.userId);
    }
    hub.unregister(ws);
  });

  ws.on("error", (err) => {
    console.error("\x1b[36m[dev-ws]\x1b[0m error:", err.message);
    hub.unregister(ws);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\x1b[36m[dev-ws]\x1b[0m shutting down...");
  hub.cleanup();
  wss.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  hub.cleanup();
  wss.close(() => process.exit(0));
});
