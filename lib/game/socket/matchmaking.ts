/**
 * Matchmaking Queue
 *
 * Uses Redis (shared across Vercel regions) so players anywhere can find
 * each other. Falls back to in-memory when Redis is unavailable (local dev).
 *
 * Cross-instance flow:
 *  1. Player joins → added to Redis sorted set (game:queue)
 *  2. Immediately scans set for a match (findMatchAndClaim)
 *  3. If match found + opponent is on another instance →
 *     store match + result in Redis, notify other instance via pending list
 *  4. Other instance's poll picks up notification → streams events to player
 */

import { QueueEntry } from "./protocol";
import {
  addToQueue,
  removeFromQueue,
  findMatchAndClaim,
  queueSize,
  storePlayerInfo,
  getPlayerInfo,
  storeMatchInfo,
  storeMatchResult,
  getMatchInfo,
  getMatchResult,
  notifyInstance,
  drainPendingNotifications,
  isRedisAvailable,
} from "./redis";
import { hub } from "./hub";
import type { WebSocket } from "ws";

const RATING_RANGE = 15;
const POLL_INTERVAL_MS = 3000; // check for cross-instance matches every 3s

// ─── In-memory fallback (same as before) ───────────────────────────────────
class InMemoryQueue {
  private queue: QueueEntry[] = [];

  findMatch(entry: QueueEntry): QueueEntry | null {
    for (const other of this.queue) {
      if (other.userId === entry.userId) continue;
      if (Math.abs(other.squadRating - entry.squadRating) <= RATING_RANGE) {
        return other;
      }
    }
    return null;
  }

  add(entry: QueueEntry): void {
    this.queue.push(entry);
  }

  remove(userId: string): void {
    this.queue = this.queue.filter((e) => e.userId !== userId);
  }

  get size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

const fallbackQueue = new InMemoryQueue();

// ─── Polling for cross-instance matches ────────────────────────────────────
let pollTimer: ReturnType<typeof setInterval> | null = null;
let currentInstanceId = "";

/** Callback invoked when a cross-instance match is ready */
type OnMatchReadyCallback = (ws: WebSocket, matchId: string, opponentUserId: string) => void;
let onMatchReady: OnMatchReadyCallback | null = null;

export function setOnMatchReady(cb: OnMatchReadyCallback): void {
  onMatchReady = cb;
}

async function pollPendingMatches() {
  if (!currentInstanceId) return;
  const matchIds = await drainPendingNotifications(currentInstanceId);
  for (const matchId of matchIds) {
    const info = await getMatchInfo(matchId);
    if (!info) continue;

    // Determine which side this instance's player is on
    const homeConn = hub.getConnection(info.homeUser);
    const awayConn = hub.getConnection(info.awayUser);

    if ((homeConn || awayConn) && onMatchReady) {
      const localWs = homeConn ? homeConn.ws : awayConn!.ws;
      const opponentId = homeConn ? info.awayUser : info.homeUser;
      try {
        await onMatchReady(localWs, matchId, opponentId);
      } catch (err) {
        console.error("[matchmaking] onMatchReady error:", err);
      }
    }
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export const matchmaking = {
  /**
   * Find a match for the entry.
   * - With Redis: scans the shared queue, atomically claims both players.
   * - Without Redis: scans the local in-memory queue.
   */
  async findMatch(entry: QueueEntry): Promise<QueueEntry | null> {
    if (isRedisAvailable()) {
      const opponentId = await findMatchAndClaim(entry.userId, entry.squadRating);
      if (opponentId) {
        // Get opponent info from Redis to populate username/rating
        const info = await getPlayerInfo(opponentId);
        // Handle array (Upstash REST auto-parses JSON), JSON string, or CSV string
        let parsedSquadPlayers: string[] | undefined;
        const raw = (info as any)?.squadPlayers;
        if (Array.isArray(raw)) {
          parsedSquadPlayers = raw;
        } else if (typeof raw === "string") {
          try {
            parsedSquadPlayers = JSON.parse(raw);
          } catch {
            parsedSquadPlayers = raw.split(",").map((s: string) => s.trim());
          }
        }
        // Handle positions similarly
        let parsedSquadPositions: string[] | undefined;
        const rawPos = (info as any)?.squadPlayerPositions;
        if (Array.isArray(rawPos)) {
          parsedSquadPositions = rawPos;
        } else if (typeof rawPos === "string") {
          try {
            parsedSquadPositions = JSON.parse(rawPos);
          } catch {
            // ignore — positions are not critical
          }
        }
        return {
          userId: opponentId,
          username: info?.username || "Opponent",
          socketId: opponentId,
          squadRating: parseInt(info?.squadRating || "0", 10),
          joinedAt: Date.now(),
          squadPlayerNames: parsedSquadPlayers,
          squadPlayerPositions: parsedSquadPositions,
        };
      }
      return null;
    }

    // In-memory fallback
    return fallbackQueue.findMatch(entry);
  },

  /**
   * Add a player to the queue.
   */
  async add(entry: QueueEntry): Promise<void> {
    if (isRedisAvailable()) {
      await addToQueue(entry.userId, entry.squadRating);
      await storePlayerInfo(entry.userId, {
        username: entry.username,
        squadRating: String(entry.squadRating),
        squadPlayers: JSON.stringify(entry.squadPlayerNames || []),
        squadPlayerPositions: JSON.stringify(entry.squadPlayerPositions || []),
        instanceId: currentInstanceId,
      });
    } else {
      fallbackQueue.add(entry);
    }
  },

  /**
   * Remove a player from the queue.
   */
  async remove(userId: string): Promise<void> {
    if (isRedisAvailable()) {
      await removeFromQueue(userId);
    } else {
      fallbackQueue.remove(userId);
    }
  },

  /** Current queue size */
  get size(): number {
    if (isRedisAvailable()) {
      // Can't return sync from Redis, return 0 — position is sent via API
      return 0;
    }
    return fallbackQueue.size;
  },

  /** Start periodic polling for cross-instance match notifications */
  startPolling(instanceId: string): void {
    if (pollTimer) return;
    currentInstanceId = instanceId;
    pollTimer = setInterval(pollPendingMatches, POLL_INTERVAL_MS);
  },

  /** Stop polling */
  stopPolling(): void {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    currentInstanceId = "";
  },

  isPolling(): boolean {
    return pollTimer !== null;
  },

  /** Store match result in Redis for cross-instance retrieval */
  async storeResult(matchId: string, resultJson: string): Promise<void> {
    if (isRedisAvailable()) {
      await storeMatchResult(matchId, resultJson);
    }
  },

  /** Notify another instance about a match */
  async notifyRemoteInstance(instanceId: string, matchId: string): Promise<void> {
    if (isRedisAvailable()) {
      await notifyInstance(instanceId, matchId);
    }
  },

  /** Store match info (home/away players, etc.) */
  async storeMatchInfo(matchId: string, homeUser: string, awayUser: string): Promise<void> {
    if (isRedisAvailable()) {
      await storeMatchInfo(matchId, {
        homeUser,
        awayUser,
        status: "pending",
      });
    }
  },

  /** Retrieve match result from Redis */
  async getResult(matchId: string): Promise<string | null> {
    if (isRedisAvailable()) {
      return getMatchResult(matchId);
    }
    return null;
  },

  async getInfo(matchId: string): Promise<Record<string, string> | null> {
    if (isRedisAvailable()) {
      return getMatchInfo(matchId);
    }
    return null;
  },
};

