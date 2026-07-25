import { createServer } from "http";
import { Server } from "socket.io";
import type { QueueEntry, MatchSocketEvent, MatchSocketResult } from "./types";
import { simulatePvPMatch } from "./matchEngine";

let io: Server | null = null;

export function getIO(): Server | null {
  return io;
}

export function initSocketServer(port: number = 3001) {
  const httpServer = createServer();

  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // ─── Matchmaking Queue ───────────────────────────────────────────────
  const queue: QueueEntry[] = [];
  const MATCHMAKING_TIMEOUT = 30000; // 30 seconds max wait

  function findMatch(entry: QueueEntry): QueueEntry | null {
    const range = 15; // ±15 rating range
    for (const other of queue) {
      if (other.socketId === entry.socketId) continue;
      if (Math.abs(other.squadRating - entry.squadRating) <= range) {
        return other;
      }
    }
    return null;
  }

  function removeFromQueue(socketId: string) {
    const idx = queue.findIndex((e) => e.socketId === socketId);
    if (idx !== -1) queue.splice(idx, 1);
  }

  // ─── Connection Handler ──────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    let currentUserId: string | null = null;
    let matchmakingTimeout: NodeJS.Timeout | null = null;

    // ─── Matchmaking: Join ────────────────────────────────────────────
    socket.on(
      "matchmaking:join",
      (data: { userId: string; squadRating: number; username: string; squadPlayers?: string[] }, callback) => {
        currentUserId = data.userId;

        if (data.squadRating <= 0) {
          callback({ success: false, message: "Invalid squad rating" });
          return;
        }

        // Remove if already in queue
        removeFromQueue(socket.id);

        const entry: QueueEntry = {
          userId: data.userId,
          username: data.username,
          socketId: socket.id,
          squadRating: data.squadRating,
          joinedAt: Date.now(),
          squadPlayerNames: data.squadPlayers,
        };

        // Try to find a match
        const opponent = findMatch(entry);

        if (opponent) {
          // Remove opponent from queue
          removeFromQueue(opponent.socketId);

          // Create match room
          const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const roomName = `match:${matchId}`;

          // Join both sockets to the room
          socket.join(roomName);
          const opponentSocket = io?.sockets.sockets.get(opponent.socketId);
          if (opponentSocket) {
            opponentSocket.join(roomName);
          }

          // Notify both players
          socket.emit("matchmaking:found", {
            matchId,
            opponent: { username: opponent.username, squadRating: opponent.squadRating },
            playerSide: "home",
          });

          if (opponentSocket) {
            opponentSocket.emit("matchmaking:found", {
              matchId,
              opponent: { username: data.username, squadRating: data.squadRating },
              playerSide: "away",
            });
          }

          // Start countdown
          let cd = 3;
          io?.to(roomName).emit("match:countdown", { seconds: 3 });
          const countdownInterval = setInterval(() => {
            cd--;
            io?.to(roomName).emit("match:countdown", { seconds: cd });
            if (cd < 0) {
              clearInterval(countdownInterval);
              // Start the match simulation
              runMatch(matchId, roomName, entry, opponent);
            }
          }, 1000);

          callback({ success: true });
        } else {
          // Add to queue
          queue.push(entry);
          socket.emit("matchmaking:waiting", { position: queue.length });

          // Set timeout
          matchmakingTimeout = setTimeout(() => {
            removeFromQueue(socket.id);
            socket.emit("match:error", { message: "Matchmaking timed out. Try again." });
          }, MATCHMAKING_TIMEOUT);

          callback({ success: true });
        }
      },
    );

    // ─── Matchmaking: Leave ────────────────────────────────────────────
    socket.on("matchmaking:leave", () => {
      removeFromQueue(socket.id);
      if (matchmakingTimeout) {
        clearTimeout(matchmakingTimeout);
        matchmakingTimeout = null;
      }
    });

    // ─── Match: Ready ──────────────────────────────────────────────────
    socket.on("match:ready", (data: { matchId: string }) => {
      // Ready acknowledgment
      io?.to(`match:${data.matchId}`).emit("match:countdown", { seconds: 0 });
    });

    // ─── Disconnect ────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Player disconnected: ${socket.id}`);
      removeFromQueue(socket.id);
      if (matchmakingTimeout) {
        clearTimeout(matchmakingTimeout);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`🎮 Socket.io server running on port ${port}`);
  });

  return httpServer;
}

// ─── Run Match (Server-side simulation) ─────────────────────────────────────
async function runMatch(
  matchId: string,
  roomName: string,
  homePlayer: QueueEntry,
  awayPlayer: QueueEntry,
) {
  const result = simulatePvPMatch(
    homePlayer.squadRating,
    awayPlayer.squadRating,
    homePlayer.squadPlayerNames,
    awayPlayer.squadPlayerNames,
  );

  // Stream events one by one with delays
  for (const event of result.events) {
    await delay(800 + Math.random() * 600);
    io?.to(roomName).emit("match:event", event);
  }

  // Send final result after a short delay
  await delay(1000);

  const finalResult: MatchSocketResult = {
    matchId,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    homePossession: result.homePossession,
    awayPossession: result.awayPossession,
    homeShots: result.homeShots,
    awayShots: result.awayShots,
    homeShotsOnTarget: result.homeShotsOnTarget,
    awayShotsOnTarget: result.awayShotsOnTarget,
    events: result.events,
    playerOfTheMatch: result.playerOfTheMatch,
    winner: result.winner,
    homeRewards: result.homeRewards,
    awayRewards: result.awayRewards,
  };

  io?.to(roomName).emit("match:end", finalResult);

  // Clean up room after 10 seconds
  setTimeout(() => {
    const room = io?.sockets.adapter.rooms.get(roomName);
    if (room) {
      for (const socketId of room) {
        const sock = io?.sockets.sockets.get(socketId);
        sock?.leave(roomName);
      }
    }
  }, 10000);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
