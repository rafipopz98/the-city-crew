/**
 * Matchmaking Queue
 *
 * In-memory queue for pairing players. Without Redis, this only matches
 * players connected to the same Function instance.
 */

import type { QueueEntry } from "./protocol";

const MATCHMAKING_TIMEOUT = 30_000; // 30 seconds
const RATING_RANGE = 15; // ±15 rating range

class MatchmakingQueue {
  private queue: QueueEntry[] = [];
  private timers = new Map<string, NodeJS.Timeout>();

  /**
   * Try to find an opponent for the given entry.
   * Returns the matched opponent, or null if none found.
   */
  findMatch(entry: QueueEntry): QueueEntry | null {
    for (const other of this.queue) {
      if (other.socketId === entry.socketId) continue;
      if (Math.abs(other.squadRating - entry.squadRating) <= RATING_RANGE) {
        return other;
      }
    }
    return null;
  }

  /**
   * Add a player to the queue. Returns a timeout promise that rejects
   * if the player waits too long.
   */
  add(entry: QueueEntry): { onTimeout: (callback: () => void) => void } {
    this.queue.push(entry);

    const timer = setTimeout(() => {
      this.remove(entry.socketId);
      this.timers.delete(entry.socketId);
    }, MATCHMAKING_TIMEOUT);

    this.timers.set(entry.socketId, timer);

    return {
      onTimeout: (callback: () => void) => {
        // Replace the default timeout with one that calls the callback
        clearTimeout(timer);
        const newTimer = setTimeout(() => {
          this.remove(entry.socketId);
          this.timers.delete(entry.socketId);
          callback();
        }, MATCHMAKING_TIMEOUT);
        this.timers.set(entry.socketId, newTimer);
      },
    };
  }

  /**
   * Remove a player from the queue by socketId.
   */
  remove(socketId: string): void {
    const idx = this.queue.findIndex((e) => e.socketId === socketId);
    if (idx !== -1) this.queue.splice(idx, 1);
    const timer = this.timers.get(socketId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(socketId);
    }
  }

  /**
   * Get the current queue size.
   */
  get size(): number {
    return this.queue.length;
  }

  /**
   * Get all entries in the queue (for diagnostics).
   */
  get entries(): QueueEntry[] {
    return [...this.queue];
  }

  /**
   * Clear all entries and timers.
   */
  clear(): void {
    this.queue = [];
    for (const [, timer] of this.timers) clearTimeout(timer);
    this.timers.clear();
  }
}

export const matchmaking = new MatchmakingQueue();
