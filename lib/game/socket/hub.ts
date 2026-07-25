/**
 * WebSocket Hub
 *
 * Manages all WebSocket connections on this Function instance.
 * Handles room membership, broadcasting, and connection lifecycle.
 *
 * Without Redis, matchmaking is limited to players on the same instance.
 */

import type { WebSocket } from "ws";
import type { ServerMessage } from "./protocol";

// ─── Connection Metadata ───────────────────────────────────────────────────
interface Connection {
  ws: WebSocket;
  userId: string;
  username: string;
  connectedAt: number;
}

interface Room {
  id: string;
  connections: Set<WebSocket>;
  metadata: Record<string, any>;
}

// ─── Hub State ─────────────────────────────────────────────────────────────
class Hub {
  /** All connections on this instance, keyed by userId */
  private connections = new Map<string, Connection>();

  /** Reverse lookup: WebSocket → userId */
  private socketToUser = new Map<WebSocket, string>();

  /** Active match rooms */
  private rooms = new Map<string, Room>();

  // ─── Connection Management ──────────────────────────────────────────────

  register(ws: WebSocket, userId: string, username: string): void {
    // Remove any previous connection for this user
    const existing = this.connections.get(userId);
    if (existing) {
      try { existing.ws.close(); } catch {}
      this.socketToUser.delete(existing.ws);
    }

    this.connections.set(userId, { ws, userId, username, connectedAt: Date.now() });
    this.socketToUser.set(ws, userId);
  }

  unregister(ws: WebSocket): void {
    const userId = this.socketToUser.get(ws);
    if (!userId) return;

    // Remove from any rooms
    for (const [, room] of this.rooms) {
      room.connections.delete(ws);
    }

    this.connections.delete(userId);
    this.socketToUser.delete(ws);
  }

  getUserId(ws: WebSocket): string | undefined {
    return this.socketToUser.get(ws);
  }

  getConnection(userId: string): Connection | undefined {
    return this.connections.get(userId);
  }

  getConnectionBySocket(ws: WebSocket): Connection | undefined {
    const userId = this.socketToUser.get(ws);
    if (!userId) return undefined;
    return this.connections.get(userId);
  }

  // ─── Room Management ────────────────────────────────────────────────────

  createRoom(roomId: string, metadata: Record<string, any> = {}): Room {
    const room: Room = {
      id: roomId,
      connections: new Set(),
      metadata,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, ws: WebSocket): void {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    room.connections.add(ws);
  }

  leaveRoom(roomId: string, ws: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.connections.delete(ws);
    // Clean up empty rooms
    if (room.connections.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // ─── Broadcasting ───────────────────────────────────────────────────────

  send(ws: WebSocket, message: ServerMessage): void {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (err) {
      console.error("[hub] send error:", err);
    }
  }

  broadcastToRoom(roomId: string, message: ServerMessage): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    for (const ws of room.connections) {
      this.send(ws, message);
    }
  }

  broadcastToRoomExcept(roomId: string, message: ServerMessage, except: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    for (const ws of room.connections) {
      if (ws !== except) this.send(ws, message);
    }
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────

  /** Remove all connections and rooms */
  cleanup(): void {
    this.connections.clear();
    this.socketToUser.clear();
    this.rooms.clear();
  }
}

// Singleton instance per Function invocation
export const hub = new Hub();
