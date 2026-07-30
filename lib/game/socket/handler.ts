/**
 * WebSocket Message Handler
 *
 * Processes incoming messages from WebSocket clients.
 * Uses Redis-backed matchmaking for cross-region support.
 * When players are on different Vercel instances, the match runs on the
 * host instance and results are stored in Redis for the remote player.
 */

import type { WebSocket } from "ws";
import { hub } from "./hub";
import { matchmaking } from "./matchmaking";
import { simulatePvPMatch } from "./matchEngine";
import { getPlayerInfo } from "./redis";
import type {
  ClientMessage,
  ServerMessage,
  QueueEntry,
  MatchEndPayload,
  MatchEventPayload,
} from "./protocol";

// ─── Duplicate Join Prevention ─────────────────────────────────────────────
// React Strict Mode double-mounts components, causing TWO matchmaking:join
// messages for the same user within milliseconds. This Set tracks users who
// recently joined and skips the second processing.
const recentlyJoined = new Set<string>();

/** Clear the duplicate-join flag for a user (called when WebSocket disconnects) */
export function clearRecentlyJoined(userId: string): void {
  recentlyJoined.delete(userId);
}

// ─── User-Targeted Broadcast ───────────────────────────────────────────────
// Always sends to the user's latest WebSocket from the hub. If a user
// reconnects mid-match (e.g. WebSocket replaced by Strict Mode remount),
// match events still reach them because we look up the current ws every time.
function sendToUser(userId: string, message: ServerMessage): void {
  const conn = hub.getConnection(userId);
  if (conn) {
    send(conn.ws, message);
  }
}

export async function handleMessage(ws: WebSocket, message: ClientMessage): Promise<void> {
  switch (message.type) {
    case "matchmaking:join":
      await handleJoin(ws, message.payload, message.id);
      break;
    case "matchmaking:leave":
      await handleLeave(ws);
      break;
    case "match:ready":
      break;
  }
}

async function handleJoin(
  ws: WebSocket,
  payload: { userId: string; squadRating: number; username: string; squadPlayers?: string[]; squadPlayerPositions?: string[] },
  ackId?: string,
): Promise<void> {
  const { userId, squadRating, username, squadPlayers, squadPlayerPositions } = payload;

  console.log(`[PvP-Server] handleJoin: user=${username}(${userId}) rating=${squadRating}`);

  if (squadRating <= 0) {
    console.warn(`[PvP-Server] Invalid squad rating for ${username}`);
    send(ws, {
      type: "match:ack",
      id: ackId || "",
      payload: { success: false, message: "Invalid squad rating" },
    });
    return;
  }

  // ── Prevent duplicate joins from React Strict Mode ───────────────────
  if (recentlyJoined.has(userId)) {
    console.log(`[PvP-Server] ⏭️ Skipping duplicate join for ${username} (Strict Mode)`);
    hub.register(ws, userId, username);
    send(ws, {
      type: "match:ack",
      id: ackId || "",
      payload: { success: true },
    });
    return;
  }
  recentlyJoined.add(userId);
  setTimeout(() => recentlyJoined.delete(userId), 5000);

  // Register the connection
  console.log(`[PvP-Server] Registering connection for ${username}`);
  hub.register(ws, userId, username);

  // Remove stale queue entry (findMatchAndClaim only removes the opponent,
  // so we need to clean up our own stale entry separately)
  console.log(`[PvP-Server] Removing ${username} from queue (if present)`);
  await matchmaking.remove(userId);

  const entry: QueueEntry = {
    userId,
    username,
    socketId: userId,
    squadRating,
    joinedAt: Date.now(),
    squadPlayerNames: squadPlayers,
    squadPlayerPositions,
  };

  // Try to find a match in Redis (or in-memory fallback)
  console.log(`[PvP-Server] Searching for match for ${username} (rating ${squadRating})`);
  const opponent = await matchmaking.findMatch(entry);

  if (opponent) {
    console.log(`[PvP-Server] 🎯 Match found! ${username} vs ${opponent.username} (rating ${opponent.squadRating})`);
    // We found a match! Now determine if opponent is on this instance or remote.
    const opponentConn = hub.getConnection(opponent.userId);
    const isSameInstance = !!opponentConn;
    console.log(`[PvP-Server] Opponent on ${isSameInstance ? "same instance" : "different instance"}`);

    if (isSameInstance) {
      // ── Both players on this instance — run match directly ─────────────
      await runLocalMatch(userId, opponent.userId, entry, opponent, ackId);
    } else {
      // ── Opponent is on another instance — remote match ──────────────────
      // We are the host instance. Store match info + run sim, then notify remote.
      const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      console.log(`[PvP-Server] Remote match: ${matchId}`);

      // Send ACK to local player
      send(ws, {
        type: "match:ack",
        id: ackId || "",
        payload: { success: true },
      });

      // Get opponent info from Redis
      const opponentInfo = await getPlayerInfo(opponent.userId);
      const oppUsername = opponentInfo?.username || "Opponent";

      // Notify local player that opponent was found
      send(ws, {
        type: "matchmaking:found",
        payload: {
          matchId,
          opponent: { username: oppUsername, squadRating: opponent.squadRating },
          playerSide: "home",
        },
      });

      // Store match info for remote instance
      await matchmaking.storeMatchInfo(matchId, userId, opponent.userId);
      if (opponentInfo?.instanceId) {
        console.log(`[PvP-Server] Notifying remote instance ${opponentInfo.instanceId.slice(0, 8)}...`);
        await matchmaking.notifyRemoteInstance(opponentInfo.instanceId, matchId);
      } else {
        console.warn("[PvP-Server] Opponent has no instanceId — cannot notify");
      }

      // Start countdown for local player
      let cd = 3;
      const countdownInterval = setInterval(() => {
        cd--;
        send(ws, { type: "match:countdown", payload: { seconds: cd } });
        if (cd < 0) {
          clearInterval(countdownInterval);
          // Run match and stream events to local player
          void runMatchAndStore(ws, matchId, entry, opponent, "home");
        }
      }, 1000);
    }    } else {
      // ── No match found — add to queue ─────────────────────────────────────
      console.log(`[PvP-Server] No match found for ${username}, adding to queue`);
      await matchmaking.add(entry);

      send(ws, {
        type: "match:ack",
        id: ackId || "",
        payload: { success: true },
      });

      send(ws, {
        type: "matchmaking:waiting",
        payload: { position: 1 },
      });
      console.log(`[PvP-Server] ${username} added to queue, waiting for opponent`);
    }
}

async function handleLeave(ws: WebSocket): Promise<void> {
  const conn = hub.getConnectionBySocket(ws);
  if (conn) {
    await matchmaking.remove(conn.userId);
    hub.unregister(ws);
  }
}

// ─── Local Match (both players on same instance) ───────────────────────────

async function runLocalMatch(
  homeUserId: string,
  awayUserId: string,
  homePlayer: QueueEntry,
  awayPlayer: QueueEntry,
  ackId?: string,
): Promise<void> {
  const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Notify both players using latest ws from hub
  sendToUser(homeUserId, {
    type: "matchmaking:found",
    payload: {
      matchId,
      opponent: { username: awayPlayer.username, squadRating: awayPlayer.squadRating },
      playerSide: "home",
    },
  });
  sendToUser(awayUserId, {
    type: "matchmaking:found",
    payload: {
      matchId,
      opponent: { username: homePlayer.username, squadRating: homePlayer.squadRating },
      playerSide: "away",
    },
  });

  // Send ACK to home player
  const homeConn = hub.getConnection(homeUserId);
  if (homeConn) {
    send(homeConn.ws, {
      type: "match:ack",
      id: ackId || "",
      payload: { success: true },
    });
  }

  // Countdown — use sendToUser to always get latest WebSocket from hub
  let cd = 3;
  sendToUser(homeUserId, { type: "match:countdown", payload: { seconds: 3 } });
  sendToUser(awayUserId, { type: "match:countdown", payload: { seconds: 3 } });

  const countdownInterval = setInterval(() => {
    cd--;
    sendToUser(homeUserId, { type: "match:countdown", payload: { seconds: cd } });
    sendToUser(awayUserId, { type: "match:countdown", payload: { seconds: cd } });
    if (cd < 0) {
      clearInterval(countdownInterval);
      void runMatch(matchId, homeUserId, awayUserId, homePlayer, awayPlayer);
    }
  }, 1000);
}

// ─── Match Execution (both players on this instance) ───────────────────────

async function runMatch(
  matchId: string,
  homeUserId: string,
  awayUserId: string,
  homePlayer: QueueEntry,
  awayPlayer: QueueEntry,
): Promise<void> {
  const result = simulatePvPMatch(
    homePlayer.squadRating,
    awayPlayer.squadRating,
    homePlayer.squadPlayerNames,
    awayPlayer.squadPlayerNames,
    homePlayer.squadPlayerPositions,
    awayPlayer.squadPlayerPositions,
  );

  // Stream events — uses sendToUser so it always picks up the latest
  // WebSocket from the hub (handles reconnects mid-match).
  for (const event of result.events) {
    await delay(1000 + Math.random() * 1000);
    const msg = {
      type: "match:event" as const,
      payload: {
        minute: event.minute,
        type: event.type,
        description: event.description,
        actorName: event.actorName,
      },
    };
    sendToUser(homeUserId, msg);
    sendToUser(awayUserId, msg);
  }

  await delay(1000);

  const finalResult: MatchEndPayload = {
    matchId,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    homePossession: result.homePossession,
    awayPossession: result.awayPossession,
    homeShots: result.homeShots,
    awayShots: result.awayShots,
    homeShotsOnTarget: result.homeShotsOnTarget,
    awayShotsOnTarget: result.awayShotsOnTarget,
    userFouls: result.userFouls,
    opponentFouls: result.opponentFouls,
    userYellowCards: result.userYellowCards,
    opponentYellowCards: result.opponentYellowCards,
    userRedCards: result.userRedCards,
    opponentRedCards: result.opponentRedCards,
    userPenalties: result.userPenalties,
    opponentPenalties: result.opponentPenalties,
    userCorners: result.userCorners,
    opponentCorners: result.opponentCorners,
    events: result.events.map((e) => ({
      minute: e.minute,
      type: e.type,
      description: e.description,
      actorName: e.actorName,
    })),
    playerOfTheMatch: result.playerOfTheMatch,
    winner: result.winner,
    homeRewards: result.homeRewards,
    awayRewards: result.awayRewards,
  };

  sendToUser(homeUserId, { type: "match:end", payload: finalResult });
  sendToUser(awayUserId, { type: "match:end", payload: finalResult });
}

// ─── Remote Match (opponent on different instance) ─────────────────────────

async function runMatchAndStore(
  homeWs: WebSocket,
  matchId: string,
  homePlayer: QueueEntry,
  awayPlayer: QueueEntry,
  side: "home" | "away",
): Promise<void> {
  const result = simulatePvPMatch(
    homePlayer.squadRating,
    awayPlayer.squadRating,
    homePlayer.squadPlayerNames,
    awayPlayer.squadPlayerNames,
    homePlayer.squadPlayerPositions,
    awayPlayer.squadPlayerPositions,
  );

  // Store full result in Redis for the remote instance
  const finalResult: MatchEndPayload = {
    matchId,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    homePossession: result.homePossession,
    awayPossession: result.awayPossession,
    homeShots: result.homeShots,
    awayShots: result.awayShots,
    homeShotsOnTarget: result.homeShotsOnTarget,
    awayShotsOnTarget: result.awayShotsOnTarget,
    userFouls: result.userFouls,
    opponentFouls: result.opponentFouls,
    userYellowCards: result.userYellowCards,
    opponentYellowCards: result.opponentYellowCards,
    userRedCards: result.userRedCards,
    opponentRedCards: result.opponentRedCards,
    userPenalties: result.userPenalties,
    opponentPenalties: result.opponentPenalties,
    userCorners: result.userCorners,
    opponentCorners: result.opponentCorners,
    events: result.events.map((e) => ({
      minute: e.minute,
      type: e.type,
      description: e.description,
      actorName: e.actorName,
    })),
    playerOfTheMatch: result.playerOfTheMatch,
    winner: result.winner,
    homeRewards: result.homeRewards,
    awayRewards: result.awayRewards,
  };

  await matchmaking.storeResult(matchId, JSON.stringify(finalResult));

  // Stream events to local player
  for (const event of result.events) {
    await delay(1000 + Math.random() * 1000);
    send(homeWs, {
      type: "match:event",
      payload: {
        minute: event.minute,
        type: event.type,
        description: event.description,
        actorName: event.actorName,
      },
    });
  }

  await delay(1000);

  send(homeWs, { type: "match:end", payload: finalResult });
}

// ─── Cross-Instance Match Streaming ────────────────────────────────────────
// Called when the poller finds a pending match for a player on this instance.

export async function streamRemoteMatch(
  ws: WebSocket,
  matchId: string,
  opponentUserId: string,
): Promise<void> {
  // Get opponent info
  const opponentInfo = await getPlayerInfo(opponentUserId);
  const oppUsername = opponentInfo?.username || "Opponent";
  const oppRating = parseInt(opponentInfo?.squadRating || "0", 10);

  // Determine which side we are
  const matchInfo = await matchmaking.getInfo(matchId);
  const isHome = matchInfo?.homeUser === hub.getUserId(ws);
  const side = isHome ? "home" as const : "away" as const;

  // Notify the player about the match
  send(ws, {
    type: "matchmaking:found",
    payload: {
      matchId,
      opponent: { username: oppUsername, squadRating: oppRating },
      playerSide: side,
    },
  });

  // Wait for result to be available in Redis (poll with timeout)
  let resultJson: string | null = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    resultJson = await matchmaking.getResult(matchId);
    if (resultJson) break;
    await delay(1000);
  }

  if (!resultJson) {
    send(ws, { type: "match:error", payload: { message: "Match result not found" } });
    return;
  }

  const result: MatchEndPayload = JSON.parse(resultJson);

  // Short countdown
  send(ws, { type: "match:countdown", payload: { seconds: 1 } });
  await delay(1000);

  // Stream events
  for (const event of result.events) {
    await delay(1000 + Math.random() * 1000);
    send(ws, {
      type: "match:event",
      payload: {
        minute: event.minute,
        type: event.type,
        description: event.description,
        actorName: event.actorName,
      },
    });
  }

  await delay(1000);
  send(ws, { type: "match:end", payload: result });
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function send(ws: WebSocket, message: ServerMessage): void {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  } catch (err) {
    console.error("[handler] send error:", err);
  }
}
