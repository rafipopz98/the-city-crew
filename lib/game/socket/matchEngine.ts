/**
 * PvP Match Engine for Socket-based matches.
 * Delegates to the main simulateMatch engine which supports:
 * - VAR, offside & controversial decisions
 * - Fouls, cards, penalties, corners
 * - Full stat tracking (yellows, reds, fouls, penalties, corners)
 * - Rich event descriptions with player names and positions
 */

import {
  simulateMatch,
  type MatchPlayer,
  type MatchResult,
} from "@/lib/game/engine/matchEngine";

/** Generate a synthetic MatchPlayer from a name, position and base rating */
function makeMatchPlayer(name: string, position: string, baseRating: number, index: number): MatchPlayer {
  const variance = Math.floor(Math.random() * 10) - 5;
  const rating = Math.max(40, Math.min(99, baseRating + variance));
  const pos = position as MatchPlayer["position"];
  return {
    _id: `pvp-${index}`,
    short_name: name,
    overall: rating,
    pace: rating + Math.floor(Math.random() * 8) - 4,
    shooting: pos === "FWD" ? rating + 5 : rating - 5,
    passing: pos === "MID" ? rating + 5 : rating - 3,
    dribbling: rating + Math.floor(Math.random() * 8) - 4,
    defending: pos === "DEF" || pos === "GK" ? rating + 5 : rating - 10,
    physic: rating + Math.floor(Math.random() * 8) - 4,
    position: pos,
    attacking_finishing: pos === "FWD" ? rating + 5 : rating - 10,
    mentality_positioning: rating,
    mentality_vision: rating,
    goalkeeping_diving: pos === "GK" ? rating + 10 : 20,
    goalkeeping_reflexes: pos === "GK" ? rating + 10 : 20,
    goalkeeping_positioning: pos === "GK" ? rating + 5 : 20,
    movement_sprint_speed: pos === "FWD" ? rating + 5 : rating,
    power_shot_power: rating,
    power_stamina: rating,
    movement_reactions: rating,
  };
}

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

export function simulatePvPMatch(
  homeRating: number,
  awayRating: number,
  homePlayerNames?: string[],
  awayPlayerNames?: string[],
  homePlayerPositions?: string[],
  awayPlayerPositions?: string[],
): PvPResult {
  // Build synthetic MatchPlayer arrays from the provided names & positions
  const homePlayers: MatchPlayer[] = (homePlayerNames || []).map((name, i) =>
    makeMatchPlayer(name, (homePlayerPositions && homePlayerPositions[i]) || "MID", homeRating, i)
  );
  const awayPlayers: MatchPlayer[] = (awayPlayerNames || []).map((name, i) =>
    makeMatchPlayer(name, (awayPlayerPositions && awayPlayerPositions[i]) || "MID", awayRating, i + 100)
  );

  // If either squad is empty, add placeholder players
  if (homePlayers.length === 0) {
    for (let i = 0; i < 5; i++) {
      homePlayers.push(makeMatchPlayer(`Home Player ${i + 1}`, ["GK", "DEF", "MID", "MID", "FWD"][i], homeRating, i));
    }
  }
  if (awayPlayers.length === 0) {
    for (let i = 0; i < 5; i++) {
      awayPlayers.push(makeMatchPlayer(`Away Player ${i + 1}`, ["GK", "DEF", "MID", "MID", "FWD"][i], awayRating, i + 100));
    }
  }

  // Run the main match engine — includes VAR, offside, fouls, cards, corners, etc.
  const result: MatchResult = simulateMatch(
    { players: homePlayers, name: "Home" },
    { players: awayPlayers, name: "Away" },
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
