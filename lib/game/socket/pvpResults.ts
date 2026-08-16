/**
 * Authoritative PvP Match Results
 *
 * The server (handler.ts) computes the real outcome of every PvP match via
 * simulatePvPMatch. Previously that result was only ever sent to the two
 * clients over the socket, and /api/game/match/pvp trusted whatever
 * result/xp/coins a client POSTed back — with no link to what the server
 * actually computed. That meant a client could POST a forged result
 * directly, or replay one real result repeatedly to farm rewards.
 *
 * This stores the server-computed result keyed by matchId right after a
 * match ends, so the REST endpoint can look up the true outcome instead of
 * trusting the client, and marks each side's rewards as claimed exactly
 * once. Works via an in-memory map (always available, single-process dev)
 * with Redis as a cross-instance/restart-surviving mirror when configured.
 */

import { getMatchResult, storeMatchResult } from "./redis";

export interface StoredPvPResult {
  homeUserId: string;
  awayUserId: string;
  homeScore: number;
  awayScore: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  winner: "home" | "away" | "draw";
  homeRewards: { xp: number; coins: number };
  awayRewards: { xp: number; coins: number };
  playerOfTheMatch: string;
  claimedByHome: boolean;
  claimedByAway: boolean;
}

const REDIS_KEY_PREFIX = "pvp-claim:";
const memoryStore = new Map<string, StoredPvPResult>();

export async function savePvPResult(
  matchId: string,
  result: Omit<StoredPvPResult, "claimedByHome" | "claimedByAway">,
): Promise<void> {
  const stored: StoredPvPResult = { ...result, claimedByHome: false, claimedByAway: false };
  memoryStore.set(matchId, stored);
  await storeMatchResult(REDIS_KEY_PREFIX + matchId, JSON.stringify(stored));
}

async function loadStoredResult(matchId: string): Promise<StoredPvPResult | null> {
  const inMemory = memoryStore.get(matchId);
  if (inMemory) return inMemory;
  const raw = await getMatchResult(REDIS_KEY_PREFIX + matchId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPvPResult;
  } catch {
    return null;
  }
}

/**
 * Claim the calling user's own side of a match's rewards exactly once.
 * Returns null if the match doesn't exist, the user wasn't a participant,
 * or their side was already claimed — the caller (the REST route) should
 * treat any of those as a rejection, never falling back to client-supplied
 * values.
 */
export async function claimPvPResult(
  matchId: string,
  userId: string,
): Promise<{
  side: "home" | "away";
  userScore: number;
  opponentScore: number;
  userPossession: number;
  opponentPossession: number;
  userShots: number;
  opponentShots: number;
  userShotsOnTarget: number;
  opponentShotsOnTarget: number;
  result: "win" | "loss" | "draw";
  rewards: { xp: number; coins: number };
  opponentName: string;
  playerOfTheMatch: string;
} | null> {
  const stored = await loadStoredResult(matchId);
  if (!stored) return null;

  const isHome = stored.homeUserId === userId;
  const isAway = stored.awayUserId === userId;
  if (!isHome && !isAway) return null;
  if (isHome && stored.claimedByHome) return null;
  if (isAway && stored.claimedByAway) return null;

  if (isHome) stored.claimedByHome = true;
  else stored.claimedByAway = true;
  memoryStore.set(matchId, stored);
  await storeMatchResult(REDIS_KEY_PREFIX + matchId, JSON.stringify(stored));

  const side: "home" | "away" = isHome ? "home" : "away";
  const result: "win" | "loss" | "draw" =
    stored.winner === "draw" ? "draw" : stored.winner === side ? "win" : "loss";

  return {
    side,
    userScore: isHome ? stored.homeScore : stored.awayScore,
    opponentScore: isHome ? stored.awayScore : stored.homeScore,
    userPossession: isHome ? stored.homePossession : stored.awayPossession,
    opponentPossession: isHome ? stored.awayPossession : stored.homePossession,
    userShots: isHome ? stored.homeShots : stored.awayShots,
    opponentShots: isHome ? stored.awayShots : stored.homeShots,
    userShotsOnTarget: isHome ? stored.homeShotsOnTarget : stored.awayShotsOnTarget,
    opponentShotsOnTarget: isHome ? stored.awayShotsOnTarget : stored.homeShotsOnTarget,
    result,
    rewards: isHome ? stored.homeRewards : stored.awayRewards,
    opponentName: "PvP Opponent",
    playerOfTheMatch: stored.playerOfTheMatch,
  };
}
