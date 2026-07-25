/**
 * TCC Manager - Socket.io Server
 *
 * Run this alongside the Next.js dev server for PvP multiplayer support.
 *
 * Usage:
 *   npx tsx socket-server.ts
 *
 * Or with pm2 / concurrently:
 *   "dev": "next dev --webpack & npx tsx socket-server.ts"
 */

import { initSocketServer } from "./lib/game/socket/server";

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);

console.log(`🎮 TCC Manager Socket.io Server`);
console.log(`📡 Listening on port ${PORT}`);
console.log(`🔗 Connect from client at ws://localhost:${PORT}`);

initSocketServer(PORT);
