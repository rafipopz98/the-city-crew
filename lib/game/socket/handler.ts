/**
 * WebSocket Message Handler
 *
 * Processes incoming messages from WebSocket clients.
 * Handles matchmaking, countdown, match simulation, and event streaming.
 */

import type { WebSocket } from "ws";
import { hub } from "./hub";
import { matchmaking } from "./matchmaking";
import { simulatePvPMatch } from "./matchEngine";
import type {
  ClientMessage,
  ServerMessage,
  QueueEntry,
  MatchEndPayload,
} from "./protocol";

export function handleMessage(ws: WebSocket, message: ClientMessage): void {
  switch (message.type) {
    case "matchmaking:join":
      handleJoin(ws, message.payload, message.id);
      break;
    case "matchmaking:leave":
      handleLeave(ws);
      break;
    case "match:ready":
      // Currently unused, but kept for future use
      break;
  }
}

function handleJoin(
  ws: WebSocket,
  payload: { userId: string; squadRating: number; username: string; squadPlayers?: string[] },
  ackId?: string,
): void {
  const { userId, squadRating, username, squadPlayers } = payload;

  if (squadRating <= 0) {
    send(ws, {
      type: "match:ack",
      id: ackId || "",
      payload: { success: false, message: "Invalid squad rating" },
    });
    return;
  }

  // Register the connection
  hub.register(ws, userId, username);

  // Remove from queue if already there
  matchmaking.remove(/* socket doesn't have a real socketId without Socket.IO,
                        but we can use userId as a proxy */ userId);

  const entry: QueueEntry = {
    userId,
    username,
    socketId: userId, // Use userId as socketId since we don't have Socket.IO IDs
    squadRating,
    joinedAt: Date.now(),
    squadPlayerNames: squadPlayers,
  };

  // Try to find a match
  const opponent = matchmaking.findMatch(entry);

  if (opponent) {
    // Remove opponent from queue
    matchmaking.remove(opponent.socketId);

    // Create match room
    const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const roomName = `match:${matchId}`;

    // Add both players to the room
    hub.joinRoom(roomName, ws);
    const opponentConn = hub.getConnection(opponent.userId);
    if (opponentConn) {
      hub.joinRoom(roomName, opponentConn.ws);
    }

    // Notify both players
    hub.send(ws, {
      type: "matchmaking:found",
      payload: {
        matchId,
        opponent: { username: opponent.username, squadRating: opponent.squadRating },
        playerSide: "home",
      },
    });

    if (opponentConn) {
      hub.send(opponentConn.ws, {
        type: "matchmaking:found",
        payload: {
          matchId,
          opponent: { username, squadRating },
          playerSide: "away",
        },
      });
    }

    // Start countdown
    let cd = 3;
    hub.broadcastToRoom(roomName, {
      type: "match:countdown",
      payload: { seconds: 3 },
    });

    const countdownInterval = setInterval(() => {
      cd--;
      hub.broadcastToRoom(roomName, {
        type: "match:countdown",
        payload: { seconds: cd },
      });
      if (cd < 0) {
        clearInterval(countdownInterval);
        // Start the match simulation
        void runMatch(matchId, roomName, entry, opponent);
      }
    }, 1000);

    // Send ACK
    send(ws, {
      type: "match:ack",
      id: ackId || "",
      payload: { success: true },
    });
  } else {
    // Add to queue
    matchmaking.add(entry);

    hub.send(ws, {
      type: "matchmaking:waiting",
      payload: { position: matchmaking.size },
    });

    // Send ACK
    send(ws, {
      type: "match:ack",
      id: ackId || "",
      payload: { success: true },
    });
  }
}

function handleLeave(ws: WebSocket): void {
  const conn = hub.getConnectionBySocket(ws);
  if (conn) {
    matchmaking.remove(conn.userId);
    hub.unregister(ws);
  }
}

// ─── Match Execution ───────────────────────────────────────────────────────

async function runMatch(
  matchId: string,
  roomName: string,
  homePlayer: QueueEntry,
  awayPlayer: QueueEntry,
): Promise<void> {
  const result = simulatePvPMatch(
    homePlayer.squadRating,
    awayPlayer.squadRating,
    homePlayer.squadPlayerNames,
    awayPlayer.squadPlayerNames,
  );

  // Stream events one by one with delays
  for (const event of result.events) {
    await delay(800 + Math.random() * 600);
    hub.broadcastToRoom(roomName, {
      type: "match:event",
      payload: {
        minute: event.minute,
        type: event.type,
        description: event.description,
        actorName: event.actorName,
      },
    });
  }

  // Send final result after a short delay
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

  hub.broadcastToRoom(roomName, {
    type: "match:end",
    payload: finalResult,
  });

  // Clean up room after 10 seconds
  setTimeout(() => {
    // Remove all connections from the room
    const room = hub.getRoom(roomName);
    if (room) {
      for (const ws of room.connections) {
        hub.leaveRoom(roomName, ws);
      }
    }
  }, 10000);
}

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
