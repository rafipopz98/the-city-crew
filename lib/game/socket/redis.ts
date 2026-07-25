/**
 * Redis Client for Matchmaking
 *
 * Provides shared state across Vercel Function instances so players
 * in different regions can find each other.
 *
 * Uses @upstash/redis (REST API) — no persistent TCP connections needed.
 * Falls back gracefully when Redis is not configured (local dev without Redis).
 */

import { Redis } from "@upstash/redis";

const RATING_RANGE = 15;

let redisClient: Redis | null = null;

function createRedisFromEnv(): Redis | null {
  try {
    // @upstash/redis REST API expects URL + token
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn("[redis] No KV_REST_API_URL or token found — running without Redis");
      return null;
    }

    return new Redis({ url, token });
  } catch (err) {
    console.warn("[redis] Failed to initialize Redis:", err);
    return null;
  }
}

export function getRedis(): Redis | null {
  if (redisClient !== null) return redisClient;
  redisClient = createRedisFromEnv();
  return redisClient;
}

/** Check if Redis is available */
export function isRedisAvailable(): boolean {
  return getRedis() !== null;
}

// ─── Queue Operations ──────────────────────────────────────────────────────

/** Add a player to the matchmaking queue (sorted by rating) */
export async function addToQueue(userId: string, rating: number): Promise<void> {
  const r = getRedis();
  if (!r) { console.warn("[Redis] addToQueue: Redis unavailable"); return; }
  console.log(`[Redis] addToQueue: ${userId} rating=${rating}`);
  await r.zadd("game:queue", { score: rating, member: userId });
  console.log(`[Redis] addToQueue done`);
}

/** Remove a player from the queue */
export async function removeFromQueue(userId: string): Promise<void> {
  const r = getRedis();
  if (!r) { console.warn("[Redis] removeFromQueue: Redis unavailable"); return; }
  console.log(`[Redis] removeFromQueue: ${userId}`);
  await r.zrem("game:queue", userId);
}

/**
 * Find a matching opponent in the queue and atomically remove both.
 * Returns the opponent's userId, or null if no match found.
 */
export async function findMatchAndClaim(userId: string, rating: number): Promise<string | null> {
  const r = getRedis();
  if (!r) { console.warn("[Redis] findMatchAndClaim: Redis unavailable"); return null; }

  const min = rating - RATING_RANGE;
  const max = rating + RATING_RANGE;
  console.log(`[Redis] findMatchAndClaim: searching range ${min}-${max}`);
  const candidates = await r.zrange("game:queue", min, max, { byScore: true });
  console.log(`[Redis] findMatchAndClaim: candidates:`, candidates);

  for (const candidateId of candidates) {
    if (candidateId === userId) continue;

    console.log(`[Redis] findMatchAndClaim: trying to claim ${candidateId}`);
    const removed = await r.zrem("game:queue", candidateId as string);
    if (removed >= 1) {
      console.log(`[Redis] findMatchAndClaim: ✅ claimed ${candidateId}`);
      return candidateId as string;
    }

    // removed === 0 means another instance already claimed this candidate
    console.log(`[Redis] findMatchAndClaim: ${candidateId} already taken, trying next`);
  }

  console.log(`[Redis] findMatchAndClaim: no match found`);
  return null;
}

/** Get current queue size */
export async function queueSize(): Promise<number> {
  const r = getRedis();
  if (!r) return 0;
  return r.zcard("game:queue");
}

// ─── Player Info ───────────────────────────────────────────────────────────

/** Store player metadata so other instances can read it */
export async function storePlayerInfo(
  userId: string,
  data: Record<string, string>,
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.hset(`game:player:${userId}`, data);
  await r.expire(`game:player:${userId}`, 120); // 2 min TTL
}

/** Get player metadata */
export async function getPlayerInfo(
  userId: string,
): Promise<Record<string, string> | null> {
  const r = getRedis();
  if (!r) return null;
  const data = await r.hgetall(`game:player:${userId}`);
  return data as Record<string, string> | null;
}

// ─── Match Storage ─────────────────────────────────────────────────────────

/** Store full match result in Redis for cross-instance retrieval */
export async function storeMatchResult(
  matchId: string,
  resultJson: string,
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.set(`game:result:${matchId}`, resultJson, { ex: 300 }); // 5 min TTL
}

/** Retrieve a stored match result */
export async function getMatchResult(
  matchId: string,
): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  return r.get(`game:result:${matchId}`);
}

/** Store cross-instance match info (so remote instance knows about it) */
export async function storeMatchInfo(
  matchId: string,
  data: Record<string, string>,
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.hset(`game:match:${matchId}`, data);
  await r.expire(`game:match:${matchId}`, 300); // 5 min TTL
}

/** Get cross-instance match info */
export async function getMatchInfo(
  matchId: string,
): Promise<Record<string, string> | null> {
  const r = getRedis();
  if (!r) return null;
  const data = await r.hgetall(`game:match:${matchId}`);
  return data as Record<string, string> | null;
}

// ─── Cross-Instance Notifications ──────────────────────────────────────────

/** Push a matchId notification to a specific instance's pending list */
export async function notifyInstance(
  instanceId: string,
  matchId: string,
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.lpush(`game:pending:${instanceId}`, matchId);
  await r.expire(`game:pending:${instanceId}`, 120); // 2 min TTL
}

/** Pop all pending matchIds for this instance */
export async function drainPendingNotifications(
  instanceId: string,
): Promise<string[]> {
  const r = getRedis();
  if (!r) return [];
  const items = await r.lrange(`game:pending:${instanceId}`, 0, -1);
  if (items.length > 0) {
    await r.del(`game:pending:${instanceId}`);
  }
  return items;
}
