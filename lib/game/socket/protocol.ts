// ─── Message Types ─────────────────────────────────────────────────────────

export type MessageType =
  | "matchmaking:join"
  | "matchmaking:leave"
  | "matchmaking:waiting"
  | "matchmaking:found"
  | "match:countdown"
  | "match:event"
  | "match:end"
  | "match:error"
  | "match:ready";

// ─── Client → Server Messages ──────────────────────────────────────────────

export interface MatchmakingJoinPayload {
  userId: string;
  squadRating: number;
  username: string;
  squadPlayers?: string[];
  /** Parallel array of positions: GK/DEF/MID/FWD for each squadPlayer */
  squadPlayerPositions?: string[];
}

export interface MatchmakingLeavePayload {}

export interface MatchReadyPayload {
  matchId: string;
}

export type ClientMessage =
  | { type: "matchmaking:join"; payload: MatchmakingJoinPayload; id?: string }
  | { type: "matchmaking:leave"; payload?: MatchmakingLeavePayload; id?: string }
  | { type: "match:ready"; payload: MatchReadyPayload; id?: string };

// ─── Server → Client Messages ──────────────────────────────────────────────

export interface MatchmakingWaitingPayload {
  position: number;
}

export interface MatchmakingFoundPayload {
  matchId: string;
  opponent: { username: string; squadRating: number };
  playerSide: "home" | "away";
}

export interface MatchCountdownPayload {
  seconds: number;
}

export interface MatchEventPayload {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "half_time" | "full_time" | "possession";
  description: string;
  actorName: string;
}

export interface MatchEndPayload {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  events: MatchEventPayload[];
  playerOfTheMatch: string;
  winner: "home" | "away" | "draw";
  homeRewards: { xp: number; coins: number };
  awayRewards: { xp: number; coins: number };
}

export interface MatchErrorPayload {
  message: string;
}

export type ServerMessage =
  | { type: "matchmaking:waiting"; payload: MatchmakingWaitingPayload }
  | { type: "matchmaking:found"; payload: MatchmakingFoundPayload }
  | { type: "match:countdown"; payload: MatchCountdownPayload }
  | { type: "match:event"; payload: MatchEventPayload }
  | { type: "match:end"; payload: MatchEndPayload }
  | { type: "match:error"; payload: MatchErrorPayload }
  | { type: "match:ack"; payload: { success: boolean; message?: string }; id: string };

// ─── Queue Entry ────────────────────────────────────────────────────────────

export interface QueueEntry {
  userId: string;
  username: string;
  socketId: string;
  squadRating: number;
  joinedAt: number;
  squadPlayerNames?: string[];
  /** Parallel array of positions: GK/DEF/MID/FWD for each squadPlayer */
  squadPlayerPositions?: string[];
}
