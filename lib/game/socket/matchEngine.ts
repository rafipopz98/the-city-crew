/**
 * PvP Match Engine for Socket-based matches.
 * Delegates to the main simulateMatch engine which supports:
 * - VAR, offside & controversial decisions
 * - Fouls, cards, penalties, corners
 * - Full stat tracking (yellows, reds, fouls, penalties, corners)
 * - Rich event descriptions with player names and positions
 *
 * Takes real MatchPlayer[] for both sides (loaded server-side from each
 * user's actual active squad via loadSquadMatchPlayers, upgrades already
 * folded in) — previously this fabricated every player's stats from a
 * single client-reported rating number plus randomness, so real squads,
 * positions, and paid-for upgrades had zero effect on PvP outcomes.
 */

import {
  simulateFirstHalf,
  simulateSecondHalf,
  type MatchPlayer,
  type MatchHalfState,
  type MatchResult,
} from "@/lib/game/engine/matchEngine";

interface MatchEvent {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "foul" | "card" | "var_check" | "offside" | "controversial" | "half_time" | "full_time" | "possession";
  description: string;
  actorName: string;
}

interface PvPResult {
  homeScore: number;
  awayScore: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  userFouls: number;
  opponentFouls: number;
  userYellowCards: number;
  opponentYellowCards: number;
  userRedCards: number;
  opponentRedCards: number;
  userPenalties: number;
  opponentPenalties: number;
  userCorners: number;
  opponentCorners: number;
  events: MatchEvent[];
  playerOfTheMatch: string;
  winner: "home" | "away" | "draw";
  homeRewards: { xp: number; coins: number };
  awayRewards: { xp: number; coins: number };
}

/** Starts a PvP match — first half only, pausing for the halftime window. */
export function simulatePvPFirstHalf(
  homePlayers: MatchPlayer[],
  awayPlayers: MatchPlayer[],
): MatchHalfState {
  return simulateFirstHalf(
    { players: homePlayers, name: "Home" },
    { players: awayPlayers, name: "Away" },
  );
}

/**
 * Finishes a PvP match from halftime state, translating the engine's
 * user/opponent perspective into PvP's home/away terminology. Pass
 * updatedHomePlayers/updatedAwayPlayers if either side made
 * substitutions/changed formation at halftime.
 */
export function finishPvPSecondHalf(
  state: MatchHalfState,
  updatedHomePlayers?: MatchPlayer[],
  updatedAwayPlayers?: MatchPlayer[],
): PvPResult {
  const result: MatchResult = simulateSecondHalf(
    state,
    updatedHomePlayers ? { players: updatedHomePlayers, name: state.userSquad.name } : undefined,
    updatedAwayPlayers ? { players: updatedAwayPlayers, name: state.opponent.name } : undefined,
  );

  // Map user/opponent → home/away for PvP
  const homeScore = result.userScore;
  const awayScore = result.opponentScore;
  const homePossession = result.userPossession;
  const awayPossession = result.opponentPossession;
  const homeShots = result.userShots;
  const awayShots = result.opponentShots;
  const homeShotsOnTarget = result.userShotsOnTarget;
  const awayShotsOnTarget = result.opponentShotsOnTarget;

  // Map events — translate actorName "user" → "home", "opponent" → "away"
  const events: MatchEvent[] = result.events.map((e) => ({
    minute: e.minute,
    type: e.type as MatchEvent["type"],
    description: e.description,
    actorName: e.actorName === "user" ? "home" : e.actorName === "opponent" ? "away" : e.actorName,
  }));

  // Determine winner
  const winner = homeScore > awayScore ? "home" as const : homeScore < awayScore ? "away" as const : "draw" as const;

  // POTM from user/opponent → home/away
  const potm = result.playerOfTheMatch.shortName || "Unknown";

  // Rewards (PvP-style: more generous than bot matches)
  const matchFee = 5;

  const calcRewards = (isWinner: boolean, isDraw: boolean, scored: number, conceded: number) => {
    const xp = isWinner ? 5 : isDraw ? 3 : 1;
    let coins: number;
    if (isWinner) {
      coins = 20 + scored * 10 - conceded * 2 + (conceded === 0 ? 15 : 0);
    } else if (isDraw) {
      coins = matchFee;
    } else {
      coins = 0;
    }
    return { xp, coins };
  };

  const homeRewards = calcRewards(winner === "home", winner === "draw", homeScore, awayScore);
  const awayRewards = calcRewards(winner === "away", winner === "draw", awayScore, homeScore);

  return {
    homeScore,
    awayScore,
    homePossession,
    awayPossession,
    homeShots,
    awayShots,
    homeShotsOnTarget,
    awayShotsOnTarget,
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
    events,
    playerOfTheMatch: potm,
    winner,
    homeRewards,
    awayRewards,
  };
}
