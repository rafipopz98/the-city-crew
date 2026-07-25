// ─── Client → Server Events ────────────────────────────────────────────────
export interface ClientEvents {
  "matchmaking:join": (
    data: { userId: string; squadRating: number; username: string; squadPlayers?: string[] },
    callback: (response: { success: boolean; message?: string }) => void,
  ) => void;

  "matchmaking:leave": () => void;

  "match:ready": (data: { matchId: string }) => void;
}

// ─── Server → Client Events ────────────────────────────────────────────────
export interface ServerEvents {
  "matchmaking:waiting": (data: { position: number }) => void;

  "matchmaking:found": (data: {
    matchId: string;
    opponent: { username: string; squadRating: number };
    playerSide: "home" | "away";
  }) => void;

  "match:event": (data: MatchSocketEvent) => void;

  "match:end": (data: MatchSocketResult) => void;

  "match:error": (data: { message: string }) => void;

  "match:countdown": (data: { seconds: number }) => void;
}

// ─── Match Event ────────────────────────────────────────────────────────────
export interface MatchSocketEvent {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "half_time" | "full_time" | "possession";
  description: string;
  actorName: string;
}

// ─── Match Result ───────────────────────────────────────────────────────────
export interface MatchSocketResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  events: MatchSocketEvent[];
  playerOfTheMatch: string;
  winner: "home" | "away" | "draw";
  homeRewards: { xp: number; coins: number };
  awayRewards: { xp: number; coins: number };
}

// ─── Queue Entry ────────────────────────────────────────────────────────────
export interface QueueEntry {
  userId: string;
  username: string;
  socketId: string;
  squadRating: number;
  joinedAt: number;
  squadPlayerNames?: string[];
}
