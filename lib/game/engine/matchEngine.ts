/**
 * TCC Manager - Match Engine
 *
 * 5v5 attribute-based simulation engine.
 * Uses player attributes to determine match outcomes.
 * Positions matter - playing out of position reduces effectiveness.
 */

import { POSITION_GROUPS, playerMatchesCategory } from "@/lib/game/utils/positionMapping";

export interface MatchPlayer {
  _id: string;
  player_id?: number;
  short_name: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  /**
   * Real specific positions (e.g. ["ST"], ["CB", "LB"]) from the player's
   * card data — ground truth for out-of-position checks. Only present for
   * real DB players (bot-match squads); synthetic PvP/bot-opponent players
   * don't have this and fall back to a stat-based guess instead.
   */
  positions?: string[];
  // All attributes available
  attacking_finishing?: number;
  mentality_positioning?: number;
  mentality_vision?: number;
  goalkeeping_diving?: number;
  goalkeeping_reflexes?: number;
  goalkeeping_positioning?: number;
  movement_sprint_speed?: number;
  power_shot_power?: number;
  power_stamina?: number;
  movement_reactions?: number;
}

export interface MatchEvent {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "foul" | "card" | "var_check" | "offside" | "controversial" | "half_time" | "full_time" | "possession";
  description: string;
  playerName: string;
  isUserEvent: boolean;
  /** PvP-compatible side indicator: "user", "opponent", or "" for neutral events */
  actorName: string;
}

export interface MatchResult {
  userScore: number;
  opponentScore: number;
  userPossession: number;
  opponentPossession: number;
  userShots: number;
  opponentShots: number;
  userShotsOnTarget: number;
  opponentShotsOnTarget: number;
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
  playerOfTheMatch: { playerId: string; shortName: string; team: "user" | "opponent" };
  duration_seconds: number;
}

export interface SquadWithPlayers {
  players: MatchPlayer[];
  name?: string;
}

// ─── Position Effectiveness ─────────────────────────────────────────────────
// Broad categories adjacent to each slot — a real MID playing DEF is a
// smaller mismatch than a real FWD playing DEF, so it's penalized less.
const ADJACENT_CATEGORIES: Record<string, string[]> = {
  DEF: ["MID"],
  MID: ["DEF", "FWD"],
  FWD: ["MID"],
};

// Exported so the squad-builder UI can preview the exact same effectiveness
// a player will get in an actual match, instead of a naive flat average.
export function getPositionEffectiveness(player: MatchPlayer, assignedPosition: string): number {
  // Ground truth when we have it: the player's real positions (e.g. a
  // striker's ["ST"]) never change just because we dragged them into a
  // different slot — unlike the old check, this can't be tricked into
  // reporting a striker as a natural goalkeeper by assigning them to GK.
  if (player.positions && player.positions.length > 0) {
    if (playerMatchesCategory(player.positions, assignedPosition)) return 1.0;

    if (assignedPosition === "GK") {
      // A real outfield player has essentially no goalkeeping ability,
      // regardless of how good their outfield stats are.
      return (player.goalkeeping_diving ?? 0) > 50 ? 0.6 : 0.3;
    }

    const isAdjacent = ADJACENT_CATEGORIES[assignedPosition]?.some((cat) =>
      playerMatchesCategory(player.positions, cat),
    );
    return isAdjacent ? 0.85 : 0.65;
  }

  // No real position data available (synthetic bot-opponent/PvP players) —
  // fall back to inferring a rough archetype from raw attribute thresholds.
  const naturalPositions = getNaturalPositions(player);

  if (assignedPosition === "GK") {
    if (naturalPositions.includes("GK")) return 1.0;
    if (player.goalkeeping_diving && player.goalkeeping_diving > 50) return 0.6;
    return 0.3;
  }

  if (naturalPositions.includes(assignedPosition)) return 1.0;

  const isRelated = ADJACENT_CATEGORIES[assignedPosition]?.some((cat) =>
    naturalPositions.includes(cat),
  );
  if (isRelated) return 0.85;

  return 0.65;
}

function getNaturalPositions(player: MatchPlayer): string[] {
  // Infer from attributes
  const pos: string[] = [];
  if (player.position === "GK" || (player.goalkeeping_diving ?? 0) > 60) pos.push("GK");
  if (player.defending > 70 && player.physic > 70) pos.push("DEF");
  if (player.passing > 70 && player.dribbling > 70) pos.push("MID");
  if (player.shooting > 70 && player.pace > 70) pos.push("FWD");

  // Fallback based on assigned position
  if (pos.length === 0) pos.push(player.position);

  return pos;
}

// ─── Squad Rating Calculation ───────────────────────────────────────────────
export function calculateSquadRating(squad: SquadWithPlayers): {
  overall: number;
  attack: number;
  midfield: number;
  defense: number;
  goalkeeping: number;
} {
  let attackSum = 0,
    attackCount = 0;
  let midfieldSum = 0,
    midfieldCount = 0;
  let defenseSum = 0,
    defenseCount = 0;
  let goalkeepingSum = 0,
    goalkeepingCount = 0;

  for (const player of squad.players) {
    const eff = getPositionEffectiveness(player, player.position);
    const effectiveOverall = Math.round(player.overall * eff);

    switch (player.position) {
      case "FWD":
        attackSum += effectiveOverall;
        attackCount++;
        break;
      case "MID":
        midfieldSum += effectiveOverall;
        midfieldCount++;
        break;
      case "DEF":
        defenseSum += effectiveOverall;
        defenseCount++;
        break;
      case "GK":
        goalkeepingSum += effectiveOverall;
        goalkeepingCount++;
        break;
    }
  }

  const attack = attackCount > 0 ? attackSum / attackCount : 50;
  const midfield = midfieldCount > 0 ? midfieldSum / midfieldCount : 50;
  const defense = defenseSum > 0 ? defenseSum / defenseCount : 50;
  const goalkeeping = goalkeepingCount > 0 ? goalkeepingSum / goalkeepingCount : 50;

  const overall = Math.round((attack + midfield + defense + goalkeeping) / 4);

  return { overall, attack, midfield, defense, goalkeeping };
}

// ─── Opponent Generator ────────────────────────────────────────────────────
function generateOpponentSquad(userRating: number): SquadWithPlayers {
  // Generate opponent with similar strength (with slight variance)
  const variance = Math.floor(Math.random() * 15) - 7; // -7 to +7
  const opponentRating = Math.max(40, Math.min(99, userRating + variance));

  const positions: ("GK" | "DEF" | "MID" | "FWD")[] = ["GK", "DEF", "MID", "MID", "FWD"];

  const players: MatchPlayer[] = positions.map((pos, i) => {
    const posRating = opponentRating + Math.floor(Math.random() * 10) - 5;
    const baseRating = Math.max(40, Math.min(99, posRating));

    return {
      _id: `opponent-${i}`,
      short_name: generateOpponentName(),
      overall: baseRating,
      pace: generateAttribute(baseRating, 15),
      shooting: pos === "FWD" ? generateAttribute(baseRating + 5, 15) : generateAttribute(baseRating - 10, 15),
      passing: pos === "MID" ? generateAttribute(baseRating + 5, 15) : generateAttribute(baseRating - 5, 15),
      dribbling: generateAttribute(baseRating, 15),
      defending: pos === "DEF" || pos === "GK" ? generateAttribute(baseRating + 5, 15) : generateAttribute(baseRating - 15, 15),
      physic: generateAttribute(baseRating, 15),
      position: pos,
      attacking_finishing: pos === "FWD" ? generateAttribute(baseRating + 5, 15) : generateAttribute(baseRating - 15, 15),
      mentality_positioning: generateAttribute(baseRating, 15),
      mentality_vision: generateAttribute(baseRating, 15),
      goalkeeping_diving: pos === "GK" ? generateAttribute(baseRating + 10, 10) : 10,
      goalkeeping_reflexes: pos === "GK" ? generateAttribute(baseRating + 10, 10) : 10,
      goalkeeping_positioning: pos === "GK" ? generateAttribute(baseRating + 5, 10) : 10,
      movement_sprint_speed: generateAttribute(baseRating, 20),
      power_shot_power: generateAttribute(baseRating, 15),
      power_stamina: generateAttribute(baseRating, 15),
      movement_reactions: generateAttribute(baseRating, 15),
    };
  });

  return { players, name: generateTeamName() };
}

function generateAttribute(base: number, variance: number): number {
  return Math.max(20, Math.min(99, base + Math.floor(Math.random() * variance) - Math.floor(variance / 2)));
}

const OPPONENT_NAMES = [
  "Alex", "Jordan", "Morgan", "Casey", "Riley", "Taylor", "Avery",
  "Quinn", "Harper", "Parker", "Reese", "Skyler", "Dakota", "Emerson",
  "Sawyer", "Rowan", "Finley", "Charlie", "Jamie", "Sam",
];

let nameIndex = 0;
function generateOpponentName(): string {
  const name = OPPONENT_NAMES[nameIndex % OPPONENT_NAMES.length];
  nameIndex++;
  return name;
}

const TEAM_NAMES = [
  "FC United", "City Stars", "Red Devils", "Blue Lions", "Golden Eagles",
  "Silver Hawks", "Iron Wolves", "Thunder FC", "Storm Riders", "Phoenix FC",
  "Atlas United", "Titan FC", "Elite XI", "Victory FC", "Legend United",
];

function generateTeamName(): string {
  return TEAM_NAMES[Math.floor(Math.random() * TEAM_NAMES.length)];
}

// ─── PvP-style rich description helpers ───────────────────────────────────

/** Pick a random outfield player (not GK) */
function pickOutfieldPlayer(players: MatchPlayer[]): MatchPlayer {
  const outfield = players.filter((p) => p.position !== "GK");
  if (outfield.length === 0) return players[0];
  return outfield[Math.floor(Math.random() * outfield.length)];
}

/**
 * Pick a goal scorer with weighted probabilities:
 * FWD 60% > MID 30% > DEF 10% > GK 0%
 */
function pickGoalScorer(players: MatchPlayer[]): MatchPlayer {
  const outfield = players.filter((p) => p.position !== "GK");
  if (outfield.length === 0) return players[0];

  const roll = Math.random() * 100;
  let cumulative = 0;

  cumulative += 60;
  if (roll < cumulative) {
    const forwards = outfield.filter((p) => p.position === "FWD");
    if (forwards.length > 0) return forwards[Math.floor(Math.random() * forwards.length)];
  }

  cumulative += 30;
  if (roll < cumulative) {
    const mids = outfield.filter((p) => p.position === "MID");
    if (mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];
  }

  const defs = outfield.filter((p) => p.position === "DEF");
  if (defs.length > 0) return defs[Math.floor(Math.random() * defs.length)];

  return outfield[Math.floor(Math.random() * outfield.length)];
}

function getGK(players: MatchPlayer[]): MatchPlayer {
  return players.find((p) => p.position === "GK") || players[0];
}

function getDefender(players: MatchPlayer[]): MatchPlayer {
  const defs = players.filter((p) => p.position === "DEF");
  if (defs.length > 0) return defs[Math.floor(Math.random() * defs.length)];
  return pickOutfieldPlayer(players);
}

/**
 * Pick the kick-off taker: FWD > MID > DEF (never GK).
 */
function pickKickoffTaker(players: MatchPlayer[]): MatchPlayer {
  const forwards = players.filter((p) => p.position === "FWD");
  if (forwards.length > 0) return forwards[Math.floor(Math.random() * forwards.length)];
  const mids = players.filter((p) => p.position === "MID");
  if (mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];
  return getDefender(players);
}

// Rich description templates (identical style to PvP socket engine)
const userChanceDescs = [
  (p: string) => `${p} cuts inside and fires just wide of the post!`,
  (p: string) => `${p} bursts into the box but blazes over the bar!`,
  (p: string) => `${p} tries a long-range effort — just past the post!`,
  (p: string) => `${p} heads toward goal from the corner — off target!`,
  (p: string) => `${p} with a powerful strike — high and wide!`,
  (p: string) => `${p} creates space and lets fly — no goal!`,
  (p: string) => `Great build-up play! ${p} shoots but it's off balance — wide.`,
  (p: string) => `${p} volleys from close range — straight at the keeper!`,
  (p: string) => `${p} nutmegs a defender but drags the shot wide! 🥴`,
  (p: string) => `${p} skips past two defenders — the shot lacks power, easy stop.`,
  (p: string) => `${p} goes for the spectacular overhead kick — way off target!`,
  (p: string) => `${p} cuts onto the left foot and curls it just over the bar!`,
  (p: string) => `${p} charges into the box but the angle is too tight — wide.`,
  (p: string) => `${p} takes a touch too many and the chance evaporates!`,
  (p: string) => `Corner comes in — ${p} rises highest but nods it wide!`,
  (p: string) => `${p} with a clever backheel flick — not enough power!`,
  (p: string) => `Quick free kick! ${p}'s effort crashes into the wall!`,
  (p: string) => `${p} lets fly from 25 yards — screaming just wide!`,
];

const oppChanceDescs = [
  (p: string) => `${p} breaks through but shoots straight at the keeper!`,
  (p: string) => `${p} with a snapshot — just wide of the far post!`,
  (p: string) => `${p} has a go from distance — it's rising over the bar!`,
  (p: string) => `${p} tries to chip the keeper — too high!`,
  (p: string) => `${p} races onto a through ball but scuffs the shot!`,
  (p: string) => `${p} cuts back onto their strong foot — dragged wide!`,
  (p: string) => `${p} spins and shoots — easy pickings for the keeper.`,
  (p: string) => `${p} has a pop from the edge — whistles just past the post!`,
  (p: string) => `${p} receives a cut-back and blazes over from six yards!`,
  (p: string) => `${p} is through on goal but hesitates — the chance is gone!`,
  (p: string) => `${p} chests it down and volleys — straight into the stands!`,
  (p: string) => `${p} goes for power over placement — it's row Z!`,
  (p: string) => `${p} tries to curl one into the far corner — just misses!`,
  (p: string) => `Corner swung in — ${p}'s glancing header goes wide!`,
  (p: string) => `${p} is fed through on goal but the keeper reads it all the way.`,
  (p: string) => `${p} hits a dipping volley — clears the bar by inches!`,
  (p: string) => `${p} shifts onto the right foot and hammers it over!`,
  (p: string) => `The cross finds ${p} unmarked — but the header is off target!`,
];

const userSaveDescs = [
  (gk: string, p: string) => `What a save! ${gk} denies ${p} with a strong hand!`,
  (gk: string, p: string) => `${gk} is down quickly to smother ${p}'s shot!`,
  (gk: string, p: string) => `${gk} makes a sharp save to keep out ${p}!`,
  (gk: string, p: string) => `Brilliant reflexes from ${gk}! ${p} is denied!`,
  (gk: string, p: string) => `${gk} tips ${p}'s curling shot around the post!`,
  (gk: string, p: string) => `MAGNIFICENT! ${gk} claw's ${p}'s header off the line!`,
  (gk: string, p: string) => `${gk} spreads himself big and blocks ${p}'s effort!`,
  (gk: string, p: string) => `${gk} dives full stretch to push it wide — world class! 🧤`,
  (gk: string, p: string) => `${gk} rushes off his line and smothers at ${p}'s feet!`,
  (gk: string, p: string) => `${gk} gets a strong wrist to it — behind for a corner!`,
  (gk: string, p: string) => `${gk} parries ${p}'s thunderous drive — that stings the palms!`,
  (gk: string, p: string) => `${gk} stands tall and punches the cross clear!`,
  (gk: string, p: string) => `${gk} reads the situation perfectly and claims the ball!`,
  (gk: string, p: string) => `Incredible double save from ${gk}! First from ${p}, then the follow-up!`,
  (gk: string, p: string) => `${gk} is off his line in a flash to deny ${p} one-on-one!`,
];

const oppSaveDescs = [
  (gk: string, p: string) => `Superb stop! ${gk} denies ${p} from close range!`,
  (gk: string, p: string) => `${gk} spreads wide and blocks ${p}'s effort!`,
  (gk: string, p: string) => `${gk} stands tall and beats away ${p}'s powerful strike!`,
  (gk: string, p: string) => `Great anticipation from ${gk} to save ${p}'s attempt!`,
  (gk: string, p: string) => `${gk} gets down well to parry ${p}'s drive!`,
  (gk: string, p: string) => `${gk} shows incredible reflexes to tip it wide! 🙌`,
  (gk: string, p: string) => `${gk} flings himself to the left and pushes it away!`,
  (gk: string, p: string) => `${gk} is equal to ${p}'s fierce strike — beaten away!`,
  (gk: string, p: string) => `${gk} claims the cross under pressure from ${p}!`,
  (gk: string, p: string) => `${gk} dives at ${p}'s feet to smother the chance!`,
  (gk: string, p: string) => `${gk} gets a crucial touch to divert it onto the bar!`,
  (gk: string, p: string) => `${gk} reacts superbly to turn it around the post!`,
  (gk: string, p: string) => `${gk} comes flying off his line and punches clear!`,
  (gk: string, p: string) => `${gk} gets two strong hands to it and holds on!`,
  (gk: string, p: string) => `A stunning fingertip save from ${gk} denies ${p}!`,
];

const userBlockDescs = [
  (d: string, p: string) => `Vital block! ${d} throws a body in front of ${p}'s shot!`,
  (d: string, p: string) => `${d} slides across to block ${p}'s goal-bound effort!`,
  (d: string, p: string) => `Last-ditch tackling from ${d} to deny ${p}!`,
  (d: string, p: string) => `${d} gets across brilliantly to block the shot!`,
  (d: string, p: string) => `${d} hurls himself at the ball — heroic defending! 🛡️`,
  (d: string, p: string) => `${d} makes a goal-line clearance — inches away!`,
  (d: string, p: string) => `${d} reads ${p}'s run perfectly and steps in to intercept!`,
  (d: string, p: string) => `${d} tracks back superbly and nicks the ball away!`,
  (d: string, p: string) => `${d} flies in with a perfectly timed tackle!`,
  (d: string, p: string) => `${d} puts his body on the line to deflect it wide!`,
  (d: string, p: string) => `${d} shepherds ${p} away from goal — brilliant defending!`,
  (d: string, p: string) => `${d} comes across to cover and makes the clearance!`,
];

const oppBlockDescs = [
  (d: string, p: string) => `${d} makes a crucial block to deny ${p}!`,
  (d: string, p: string) => `Superb defending! ${d} hurls themself in front of ${p}'s strike!`,
  (d: string, p: string) => `${d} reads the play perfectly and blocks ${p}'s attempt!`,
  (d: string, p: string) => `${d} puts their body on the line to block!`,
  (d: string, p: string) => `${d} slides in with a perfectly timed challenge!`,
  (d: string, p: string) => `${d} gets a foot in to deflect it behind for a corner!`,
  (d: string, p: string) => `${d} uses strength to muscle ${p} off the ball!`,
  (d: string, p: string) => `${d} intercepts the through ball — reads it perfectly!`,
  (d: string, p: string) => `${d} recovers with a brilliant last-man tackle!`,
  (d: string, p: string) => `${d} heads the goal-bound effort off the line!`,
  (d: string, p: string) => `${d} tracks ${p} all the way and makes a clean tackle!`,
  (d: string, p: string) => `${d} steps out of the defensive line to catch ${p} offside!`,
];

const userGoalDescs = [
  (p: string) => `GOAL! ${p} finds the bottom corner with a clinical finish! 🎯`,
  (p: string) => `GOAL! ${p} heads home from a pinpoint cross! 👑`,
  (p: string) => `GOAL! ${p} smashes it into the roof of the net! 💥`,
  (p: string) => `GOAL! ${p} slots it past the keeper with composure! 🥶`,
  (p: string) => `GOAL! ${p} rifles a shot into the top bins! 🚀`,
  (p: string) => `GOAL! ${p} turns and fires — unstoppable! 🔥`,
  (p: string) => `GOAL! ${p} volleys home first time — absolute beauty! 🎨`,
  (p: string) => `GOAL! ${p} curls it into the far corner — the keeper had no chance! 🌀`,
  (p: string) => `GOAL! ${p} applies a delicate chip over the advancing keeper! 🥄`,
  (p: string) => `GOAL! ${p} drills a low shot through a sea of legs! 🦵`,
  (p: string) => `GOAL! ${p} bursts into the box and slots it coolly! 💪`,
  (p: string) => `GOAL! ${p} with a towering header — unstoppable! 📐`,
  (p: string) => `GOAL! ${p} pounces on the rebound and tucks it away! 🏃`,
  (p: string) => `GOAL! ${p} bends it like a free-kick specialist — wall and keeper beaten! 🌟`,
  (p: string) => `GOAL! ${p} controls on the chest and volleys home — what a finish! 🎪`,
  (p: string) => `GOAL! ${p} meets the cross with a thumping header! 💫`,
  (p: string) => `GOAL! ${p} weaves through the defence and slides it home! 🧙`,
  (p: string) => `GOAL! ${p} smashes it on the half-volley — the net bulges! ⚡`,
  (p: string) => `GOAL! ${p} rounds the keeper and taps it into the empty net! 🕺`,
  (p: string) => `GOAL! ${p} with a backheel flick — audacious and brilliant! 🎭`,
];

const oppGoalDescs = [
  (p: string) => `GOAL! ${p} strikes on the counter and scores! ⚡`,
  (p: string) => `GOAL! ${p} with a cool finish — 1-on-1 with the keeper! 🥶`,
  (p: string) => `GOAL! ${p} volleys home from a corner kick! 👑`,
  (p: string) => `GOAL! ${p} rifles a low shot into the corner! 🎯`,
  (p: string) => `GOAL! ${p} takes aim from range and picks out the top corner! 🚀`,
  (p: string) => `GOAL! ${p} drills it home from a set-piece routine! ⚡`,
  (p: string) => `GOAL! ${p} latches onto a through ball and finishes first time! 💨`,
  (p: string) => `GOAL! ${p} beats the offside trap and slides it past the keeper! 🏃`,
  (p: string) => `GOAL! ${p} powers a header down into the ground and in! 💫`,
  (p: string) => `GOAL! ${p} picks his spot from 20 yards — unstoppable! 🎯`,
  (p: string) => `GOAL! ${p} steals in at the back post to tap it home! 🥷`,
  (p: string) => `GOAL! ${p} with a glancing header that nestles in the far corner! 📐`,
  (p: string) => `GOAL! ${p} hammers it on the turn — the keeper rooted! 🔥`,
  (p: string) => `GOAL! ${p} bundles it over the line from a goal-mouth scramble! 💥`,
  (p: string) => `GOAL! ${p} cuts inside and curls one into the far corner! 🌀`,
  (p: string) => `GOAL! ${p} collects a loose ball and lashes it home! 💪`,
  (p: string) => `GOAL! ${p} lobs the keeper from an impossible angle! 🥄`,
  (p: string) => `GOAL! ${p} nutmegs the defender and slots it home! 🥴`,
  (p: string) => `GOAL! ${p} rises highest to meet the corner — power header! 👑`,
  (p: string) => `GOAL! ${p} is in the right place at the right time — tap-in! 🚶`,
];

// ─── Foul, Card & Set-Piece Description Arrays ──────────────────────────────

const foulDescs = [
  (f: string, v: string) => `${f} bundles over ${v} — free kick given.`,
  (f: string, v: string) => `${f} catches ${v} with a late tackle!`,
  (f: string, v: string) => `${f} pulls back ${v} by the shirt — the ref spots it!`,
  (f: string, v: string) => `${f} slides in recklessly and takes out ${v}!`,
  (f: string, v: string) => `${f} clips ${v}'s ankles from behind — clear foul.`,
  (f: string, v: string) => `Crunching challenge! ${f} leaves ${v} in a heap.`,
  (f: string, v: string) => `${f} body-checks ${v} off the ball — cynical!`,
  (f: string, v: string) => `${f} trips ${v} as he bursts into the box!`,
  (f: string, v: string) => `${f} hauls down ${v} on the counter-attack!`,
  (f: string, v: string) => `${f} jumps in wildly and catches ${v}'s shin!`,
  (f: string, v: string) => `${f} shoves ${v} in the back — unnecessary.`,
  (f: string, v: string) => `${f} stretches his leg out and brings ${v} down!`,
  (f: string, v: string) => `${f} manhandles ${v} at the corner flag — foul!`,
  (f: string, v: string) => `${f} scythes through the back of ${v} — booked!`,
];

const yellowDescs = [
  (p: string) => `🥟 Yellow card! ${p} goes into the book for that challenge.`,
  (p: string) => `🟡 ${p} is cautioned — the ref shows a yellow!`,
  (p: string) => `Yellow card waved at ${p} — that was reckless.`,
  (p: string) => `${p} is the first name in the book — deservedly so.`,
  (p: string) => `Into the book goes ${p} for persistent fouling.`,
  (p: string) => `🟡 ${p} gets a yellow — one more and they're off!`,
];

const redDescs = [
  (p: string) => `🟥 RED CARD! ${p} is sent off! That's a horror tackle!`,
  (p: string) => `🔴 Straight red! ${p} has to go — no debate there!`,
  (p: string) => `🟥 ${p} is shown the red — violent conduct! He's off!`,
  (p: string) => `That's a red! ${p} denied a clear goal-scoring opportunity!`,
];

const freeKickDescs = [
  (p: string) => `${p} swings the free kick into the box — cleared!`,
  (p: string) => `${p} takes the free kick quickly and finds a teammate!`,
  (p: string) => `${p}'s free kick curls over the wall — just over the bar!`,
  (p: string) => `${p} lines it up and bends it around the wall — the keeper saves!`,
  (p: string) => `${p} lays the free kick off short — the move breaks down.`,
];

const penaltyAwardedDescs = [
  (p: string) => `PENALTY! ${p} was hauled down in the box! It's a spot kick! 🎯`,
  (p: string) => `PENALTY! The ref points to the spot — ${p} fouled in the box!`,
  (p: string) => `It's a penalty! ${p} is tripped as he shaped to shoot!`,
];

const penaltyScoredDescs = [
  (p: string) => `GOAL! ${p} sends the keeper the wrong way from the spot! 🥅`,
  (p: string) => `GOAL! ${p} drills the penalty low into the corner — unstoppable! 🎯`,
  (p: string) => `GOAL! ${p} keeps his composure and slots home the penalty! 🥶`,
  (p: string) => `GOAL! ${p} blasts the penalty down the middle — the keeper dived! 💥`,
];

const penaltyMissedDescs = [
  (p: string) => `PENALTY MISSED! ${p} skies it over the bar — what a let off! 😱`,
  (p: string) => `SAVED! The keeper guesses right and denies ${p} from the spot! 🧤`,
  (p: string) => `${p}'s penalty is tipped onto the post — inches away from going in!`,
  (p: string) => `PENALTY SAVED! The keeper stands tall and beats it away! 🙌`,
  (p: string) => `${p} slips as he takes it — the penalty trickles wide! 😰`,
];

// ─── VAR, Offside & Controversial Decision Description Arrays ──────────────

const varCheckStartDescs = [
  () => `🔍 VAR CHECK — the referee is being called to the monitor!`,
  () => `📺 The referee signals for a VAR review — this could be crucial!`,
  () => `🖥️ VAR is checking the incident — everyone holds their breath...`,
  () => `The ref puts his hand to his earpiece — VAR has something to say! 📞`,
  () => `⏸️ Play is paused. VAR is reviewing the decision. The crowd waits...`,
];

const varConfirmDescs = [
  (p: string) => `✅ VAR CHECK COMPLETE — the goal stands! Ref points to the centre circle!`,
  (p: string) => `✅ After review, the goal is GOOD! No infringement.`,
  (p: string) => `VAR confirms — ${p}'s finish was legitimate. Goal VALID! ✅`,
  (p: string) => `Ref checks the screen and nods — GOAL STANDS! ${p} celebrates again! 🎉`,
];

const varOverturnGoalDescs = [
  (p: string) => `❌ VAR OVERTURNS! ${p}'s goal is DISALLOWED! Unbelievable drama!`,
  (p: string) => `VAR CALL! ${p} was offside in the buildup — goal disallowed! 🥅❌`,
  (p: string) => `❌ Handball by ${p}! NO GOAL! The referee reverses his decision!`,
  (p: string) => `STUNNING VAR DRAMA! Goal ruled out for a foul in the buildup! 😱`,
  (p: string) => `VAR spots an offside — ${p} was MILLIMETRES off! Goal chalked off! 📏`,
  (p: string) => `No goal! VAR shows ${p} handled the ball! Ref changes his mind! 🙈`,
];

const varOverturnPenaltyDescs = [
  (p: string) => `❌ VAR OVERTURNS THE PENALTY! ${p} went down too easily — free kick out!`,
  (p: string) => `VAR CALL! The foul was OUTSIDE the box — penalty reversed! 📐`,
  (p: string) => `❌ Replay shows ${p} got the ball first! No penalty!`,
  (p: string) => `VAR intervenes — no penalty! The challenge was a clean tackle! 🏃`,
];

const varOverturnRedDescs = [
  (p: string) => `🟡 VAR DOWNGRADE! ${p}'s red card reduced to yellow — wasn't that bad!`,
  (p: string) => `VAR review complete! ${p}'s red overturned — yellow card instead! 🟡`,
  (p: string) => `Not a red card offense — ${p} stays on after VAR review! 😤`,
];

const offsideDescs = [
  (p: string) => `🚩 Offside! ${p} caught offside — free kick to the defending team.`,
  (p: string) => `The flag goes up! ${p} timed the run too early — offside! 🚩`,
  (p: string) => `🚩 ${p} is flagged — tight call, but the linesman got it right. 📏`,
  (p: string) => `The linesman raises the flag — ${p} was a step ahead of the defence!`,
  (p: string) => `Controversial offside! ${p} looked LEVEL — the crowd is furious! 😤`,
  (p: string) => `🚩 Offside against ${p} — but replays show he was ONSIDE! Terrible decision! 😡`,
  (p: string) => `Waste of a chance — ${p} was clearly offside. 🚩`,
];

const controversialDescs = [
  (p: string) => `🤔 ${p} goes down in the box — ref waves play on! No penalty!`,
  (p: string) => `DIVE! ${p} hits the deck too easily — yellow for simulation! 🟡`,
  (p: string) => `The ref misses a clear foul on ${p} — the crowd is LIVID! 😡`,
  (p: string) => `${p} catches an opponent with a stray arm — the ref didn't see it! 👀`,
  (p: string) => `${p} is screaming for a foul — replays show definite contact! Ref says no!`,
  (p: string) => `Massive shout for handball! ${p}'s arm was up — ref waves it away! 🖐️`,
  (p: string) => `The referee plays advantage but ${p} had a clear opening — controversial! 🤷`,
  (p: string) => `The ref has a word with ${p} — could easily have been a yellow there! 😬`,
  (p: string) => `${p} goes down clutching his face — ref isn't buying it! Get up! 🎭`,
  (p: string) => `Should that have been a foul? ${p} cannot believe the ref didn't give it! 🗣️`,
];

/** Pick a player likely to commit a foul: DEF > MID > FWD > GK */
function pickFouler(players: MatchPlayer[]): MatchPlayer {
  const defs = players.filter(p => p.position === "DEF");
  if (defs.length > 0 && Math.random() < 0.55) return defs[Math.floor(Math.random() * defs.length)];
  const mids = players.filter(p => p.position === "MID");
  if (mids.length > 0 && Math.random() < 0.6) return mids[Math.floor(Math.random() * mids.length)];
  return pickOutfieldPlayer(players);
}

/**
 * Wrap a goal event with a VAR review.
 * Pushes the goal celebration, then rolls for a VAR check (~25%).
 * If VAR overturns (~30% of reviews), the score is decremented back
 * and a disallowed goal event is added — maximum drama.
 */
function handleGoalWithVAR(
  minute: number,
  isUserGoal: boolean,
  scorerName: string,
  goalDescs: ((p: string) => string)[],
  events: MatchEvent[],
  userScore: { current: number },
  opponentScore: { current: number },
): void {
  // Score first — this makes the VAR reversal hurt more
  if (isUserGoal) userScore.current++;
  else opponentScore.current++;

  events.push({
    minute, type: "goal",
    description: goalDescs[Math.floor(Math.random() * goalDescs.length)](scorerName),
    playerName: scorerName, isUserEvent: isUserGoal, actorName: isUserGoal ? "user" : "opponent",
  });

  // ~25% chance of VAR review for goals
  if (Math.random() < 0.25) {
    events.push({
      minute, type: "var_check",
      description: varCheckStartDescs[Math.floor(Math.random() * varCheckStartDescs.length)](),
      playerName: "", isUserEvent: false, actorName: "",
    });

    // VAR overturns ~30% of reviewed goals
    if (Math.random() < 0.3) {
      // Reverse the score
      if (isUserGoal) userScore.current--;
      else opponentScore.current--;

      events.push({
        minute, type: "var_check",
        description: varOverturnGoalDescs[Math.floor(Math.random() * varOverturnGoalDescs.length)](scorerName),
        playerName: scorerName, isUserEvent: isUserGoal, actorName: isUserGoal ? "user" : "opponent",
      });
    } else {
      events.push({
        minute, type: "var_check",
        description: varConfirmDescs[Math.floor(Math.random() * varConfirmDescs.length)](scorerName),
        playerName: scorerName, isUserEvent: isUserGoal, actorName: isUserGoal ? "user" : "opponent",
      });
    }
  }
}

/** ~8% chance to inject an offside call, consuming the iteration. */
function maybeInjectOffside(
  minute: number,
  events: MatchEvent[],
  offsidePlayer: MatchPlayer,
  isUserOffside: boolean,
): boolean {
  if (Math.random() > 0.08) return false;
  events.push({
    minute, type: "offside",
    description: offsideDescs[Math.floor(Math.random() * offsideDescs.length)](offsidePlayer.short_name),
    playerName: offsidePlayer.short_name, isUserEvent: isUserOffside, actorName: isUserOffside ? "user" : "opponent",
  });
  return true;
}

/** ~5% chance to inject a controversial referee decision, consuming the iteration. */
function maybeInjectControversial(
  minute: number,
  events: MatchEvent[],
  player: MatchPlayer,
  isUserPlayer: boolean,
): boolean {
  if (Math.random() > 0.05) return false;
  events.push({
    minute, type: "controversial",
    description: controversialDescs[Math.floor(Math.random() * controversialDescs.length)](player.short_name),
    playerName: player.short_name, isUserEvent: isUserPlayer, actorName: isUserPlayer ? "user" : "opponent",
  });
  return true;
}

/** Inject a foul/card/penalty/free-kick event sequence. Returns true if the whole iteration should be consumed (no shot). */
function maybeInjectFoul(
  minute: number,
  isUserAttack: boolean,
  userPlayers: MatchPlayer[],
  oppPlayers: MatchPlayer[],
  events: MatchEvent[],
  userScore: { current: number },
  opponentScore: { current: number },
  stats: {
    userFouls: number; opponentFouls: number;
    userYellowCards: number; opponentYellowCards: number;
    userRedCards: number; opponentRedCards: number;
    userPenalties: number; opponentPenalties: number;
  },
): boolean {
  // ~14% chance per event iteration to become a foul
  if (Math.random() > 0.14) return false;

  const isUserFouler = !isUserAttack; // the DEFENDING team fouls the ATTACKING team
  const fouler = isUserFouler ? pickFouler(userPlayers) : pickFouler(oppPlayers);
  const victim = isUserFouler ? pickOutfieldPlayer(oppPlayers) : pickOutfieldPlayer(userPlayers);
  const inBox = Math.random() < 0.3;
  const isYellow = Math.random() < 0.22;
  const isRed = !isYellow && Math.random() < 0.04;

  // Push foul event
  events.push({
    minute, type: "foul",
    description: foulDescs[Math.floor(Math.random() * foulDescs.length)](fouler.short_name, victim.short_name),
    playerName: fouler.short_name, isUserEvent: isUserFouler, actorName: isUserFouler ? "user" : "opponent",
  });
  if (isUserFouler) stats.userFouls++; else stats.opponentFouls++;

  // Yellow card
  if (isYellow) {
    events.push({
      minute, type: "card",
      description: yellowDescs[Math.floor(Math.random() * yellowDescs.length)](fouler.short_name),
      playerName: fouler.short_name, isUserEvent: isUserFouler, actorName: isUserFouler ? "user" : "opponent",
    });
    if (isUserFouler) stats.userYellowCards++; else stats.opponentYellowCards++;
  }

  // Red card (very rare)
  if (isRed) {
    events.push({
      minute, type: "card",
      description: redDescs[Math.floor(Math.random() * redDescs.length)](fouler.short_name),
      playerName: fouler.short_name, isUserEvent: isUserFouler, actorName: isUserFouler ? "user" : "opponent",
    });
    if (isUserFouler) stats.userRedCards++; else stats.opponentRedCards++;
    // VAR review for red cards (~35% chance)
    if (Math.random() < 0.35) {
      events.push({
        minute, type: "var_check",
        description: varCheckStartDescs[Math.floor(Math.random() * varCheckStartDescs.length)](),
        playerName: "", isUserEvent: false, actorName: "",
      });
      // VAR overturns ~40% of reviewed reds → downgrades to yellow
      if (Math.random() < 0.4) {
        // Remove the red by replacing the last card event's description to mark it overturned
        // Instead, push a downgrade event
        events.push({
          minute, type: "var_check",
          description: varOverturnRedDescs[Math.floor(Math.random() * varOverturnRedDescs.length)](fouler.short_name),
          playerName: fouler.short_name, isUserEvent: isUserFouler, actorName: isUserFouler ? "user" : "opponent",
        });
      } else {
        events.push({
          minute, type: "var_check",
          description: `✅ VAR confirms the red card — ${fouler.short_name} has to go! 🟥`,
          playerName: fouler.short_name, isUserEvent: isUserFouler, actorName: isUserFouler ? "user" : "opponent",
        });
      }
    }
  }

  if (inBox) {
    // Penalty!
    const penaltyMinute = Math.min(minute + 1, 90); // stagger by 1' for the spot kick
    const penaltyTaker = isUserFouler ? pickGoalScorer(oppPlayers) : pickGoalScorer(userPlayers);
    events.push({
      minute, type: "foul",
      description: penaltyAwardedDescs[Math.floor(Math.random() * penaltyAwardedDescs.length)](victim.short_name),
      playerName: victim.short_name, isUserEvent: !isUserFouler, actorName: !isUserFouler ? "user" : "opponent",
    });
    if (!isUserFouler) stats.userPenalties++; else stats.opponentPenalties++;
    // VAR review for penalties (~30% chance)
    let penaltyOverturned = false;
    if (Math.random() < 0.3) {
      events.push({
        minute: Math.min(minute + 1, 90), type: "var_check",
        description: varCheckStartDescs[Math.floor(Math.random() * varCheckStartDescs.length)](),
        playerName: "", isUserEvent: false, actorName: "",
      });
      // VAR overturns ~25% of reviewed penalties
      if (Math.random() < 0.25) {
        penaltyOverturned = true;
        events.push({
          minute: Math.min(minute + 1, 90), type: "var_check",
          description: varOverturnPenaltyDescs[Math.floor(Math.random() * varOverturnPenaltyDescs.length)](victim.short_name),
          playerName: victim.short_name, isUserEvent: !isUserFouler, actorName: !isUserFouler ? "user" : "opponent",
        });
      } else {
        events.push({
          minute: Math.min(minute + 1, 90), type: "var_check",
          description: `✅ VAR confirms the penalty — spot kick stands! 🎯`,
          playerName: victim.short_name, isUserEvent: false, actorName: "",
        });
      }
    }

    if (!penaltyOverturned) {
      // 75% chance to score penalty
      if (Math.random() < 0.75) {
        if (!isUserFouler) userScore.current++;
        else opponentScore.current++;
        events.push({
          minute: penaltyMinute, type: "goal",
          description: penaltyScoredDescs[Math.floor(Math.random() * penaltyScoredDescs.length)](penaltyTaker.short_name),
          playerName: penaltyTaker.short_name, isUserEvent: !isUserFouler, actorName: !isUserFouler ? "user" : "opponent",
        });
      } else {
        events.push({
          minute: penaltyMinute, type: "save",
          description: penaltyMissedDescs[Math.floor(Math.random() * penaltyMissedDescs.length)](penaltyTaker.short_name),
          playerName: penaltyTaker.short_name, isUserEvent: false, actorName: "",
        });
      }
    }
  } else {
    // Free kick outside the box
    const fkMinute = Math.min(minute + 1, 90); // stagger by 1'
    const fkTaker = isUserFouler ? pickGoalScorer(oppPlayers) : pickGoalScorer(userPlayers);
    // 20% chance the free kick leads to a goal
    if (Math.random() < 0.2) {
      if (!isUserFouler) userScore.current++;
      else opponentScore.current++;
      events.push({
        minute: fkMinute, type: "goal",
        description: userGoalDescs[Math.floor(Math.random() * userGoalDescs.length)](fkTaker.short_name),
        playerName: fkTaker.short_name, isUserEvent: !isUserFouler, actorName: !isUserFouler ? "user" : "opponent",
      });
    } else {
      events.push({
        minute: fkMinute, type: "chance",
        description: freeKickDescs[Math.floor(Math.random() * freeKickDescs.length)](fkTaker.short_name),
        playerName: fkTaker.short_name, isUserEvent: !isUserFouler, actorName: !isUserFouler ? "user" : "opponent",
      });
    }
  }

  return true; // consumed this event iteration — no further shot logic
}

// ─── Halftime-splittable Match Simulation ──────────────────────────────────
// Carries everything needed to resume a match after halftime — including a
// possibly-updated squad (substitutions/formation change) — as a plain,
// serializable object so it can round-trip through an API response/request
// or sit in server-side storage between the two halves.
export interface MatchHalfState {
  userSquad: SquadWithPlayers;
  opponent: SquadWithPlayers;
  events: MatchEvent[];
  userScore: number;
  opponentScore: number;
  userShots: number;
  opponentShots: number;
  userShotsOnTarget: number;
  opponentShotsOnTarget: number;
  stats: {
    userFouls: number; opponentFouls: number;
    userYellowCards: number; opponentYellowCards: number;
    userRedCards: number; opponentRedCards: number;
    userPenalties: number; opponentPenalties: number;
    userCorners: number; opponentCorners: number;
  };
}

/**
 * Simulates the first half only, stopping right after the half_time event.
 * Returns the running state needed to resume — the caller can offer a
 * substitution/formation-change window here before calling
 * simulateSecondHalf, and that change will genuinely affect the second
 * half's ratings/possession/outcome (not just be cosmetic).
 */
export function simulateFirstHalf(
  userSquad: SquadWithPlayers,
  opponentSquad?: SquadWithPlayers,
): MatchHalfState {
  const userRating = calculateSquadRating(userSquad);
  const opponent = opponentSquad || generateOpponentSquad(userRating.overall);
  const opponentRating = calculateSquadRating(opponent);

  const events: MatchEvent[] = [];
  const userScore = { current: 0 };
  const opponentScore = { current: 0 };
  let userShots = 0,
    opponentShots = 0;
  let userShotsOnTarget = 0,
    opponentShotsOnTarget = 0;

  // Discipline & set-piece stats (mutable — passed by reference to sub-fns)
  const stats = {
    userFouls: 0, opponentFouls: 0,
    userYellowCards: 0, opponentYellowCards: 0,
    userRedCards: 0, opponentRedCards: 0,
    userPenalties: 0, opponentPenalties: 0,
    userCorners: 0, opponentCorners: 0,
  };

  // Possession blends midfield (60%) + overall squad quality (40%) with amplified differences + home advantage
  const midRatio = userRating.midfield / (userRating.midfield + opponentRating.midfield);
  const overallRatio = userRating.overall / (userRating.overall + opponentRating.overall);
  const blendedRatio = midRatio * 0.6 + overallRatio * 0.4;
  // Amplify: shift the ratio away from 0.5 so small advantages are more visible
  const amplified = (blendedRatio - 0.5) * 1.8 + 0.5;
  const clamped = Math.max(0.15, Math.min(0.85, amplified));
  // Map to 20-80 range + tiny home advantage
  const userPossession = Math.round(20 + clamped * 60) + 2;

  const homeName = userSquad.name || "Your Team";

  // Build player info arrays for weighted selection
  const userPlayers = userSquad.players;
  const oppPlayers = opponent.players;

  const kickoffTaker = pickKickoffTaker(userSquad.players);
  events.push({
    minute: 1,
    type: "possession",
    description: `The match kicks off! ${kickoffTaker.short_name} gets us underway! ⚡`,
    playerName: kickoffTaker.short_name,
    isUserEvent: true,
    actorName: "user",
  });

  // ── FIRST HALF ─────────────────────────────────────────────────────────
  const firstHalfEvents = Math.floor(Math.random() * 4) + 6; // 6-9

  for (let i = 0; i < firstHalfEvents; i++) {
    const minute = Math.floor(Math.random() * 43) + 2; // 2-44
    const isUserAttack = Math.random() * 100 < userPossession;

    // Check for foul before regular play
    if (maybeInjectFoul(minute, isUserAttack, userPlayers, oppPlayers, events, userScore, opponentScore, stats)) continue;

    // Offside check (~8%) — forwards get caught offside more
    const attackingPlayers = isUserAttack ? userPlayers : oppPlayers;
    if (maybeInjectOffside(minute, events, pickGoalScorer(attackingPlayers), isUserAttack)) continue;

    // Controversial decision (~5%)
    if (maybeInjectControversial(minute, events, pickOutfieldPlayer(attackingPlayers), isUserAttack)) continue;

    if (isUserAttack) {
      userShots++;
      const onTarget = Math.random() < 0.55;
      if (onTarget) {
        userShotsOnTarget++;
        const scorer = pickGoalScorer(userPlayers);
        const scores = Math.random() < 0.35 + (userRating.attack / (userRating.attack + opponentRating.goalkeeping)) * 0.15;
        if (scores) {
          handleGoalWithVAR(minute, true, scorer.short_name, userGoalDescs, events, userScore, opponentScore);
        } else {
          const shooter = pickOutfieldPlayer(userPlayers);
          const gk = getGK(oppPlayers);
          events.push({
            minute, type: "save",
            description: oppSaveDescs[Math.floor(Math.random() * oppSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: false, actorName: "opponent",
          });
          // ~35% chance the save concedes a corner for the attacker
          if (Math.random() < 0.35) stats.userCorners++;
        }
      } else {
        const shooter = pickOutfieldPlayer(userPlayers);
        if (Math.random() < 0.3) {
          const def = getDefender(oppPlayers);
          events.push({
            minute, type: "chance",
            description: oppBlockDescs[Math.floor(Math.random() * oppBlockDescs.length)](def.short_name, shooter.short_name),
            playerName: def.short_name, isUserEvent: false, actorName: "opponent",
          });
          // ~35% chance the block deflects behind for a corner
          if (Math.random() < 0.35) stats.userCorners++;
        } else {
          events.push({
            minute, type: "chance",
            description: userChanceDescs[Math.floor(Math.random() * userChanceDescs.length)](shooter.short_name),
            playerName: shooter.short_name, isUserEvent: true, actorName: "user",
          });
        }
      }
    } else {
      opponentShots++;
      const onTarget = Math.random() < 0.45;
      if (onTarget) {
        opponentShotsOnTarget++;
        const scorer = pickGoalScorer(oppPlayers);
        const scores = Math.random() < 0.3 + (opponentRating.attack / (opponentRating.attack + userRating.goalkeeping)) * 0.15;
        if (scores) {
          handleGoalWithVAR(minute, false, scorer.short_name, oppGoalDescs, events, userScore, opponentScore);
        } else {
          const shooter = pickOutfieldPlayer(oppPlayers);
          const gk = getGK(userPlayers);
          events.push({
            minute, type: "save",
            description: userSaveDescs[Math.floor(Math.random() * userSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: true, actorName: "user",
          });
          // ~35% chance the save concedes a corner for the attacker
          if (Math.random() < 0.35) stats.opponentCorners++;
        }
      } else {
        const shooter = pickOutfieldPlayer(oppPlayers);
        if (Math.random() < 0.3) {
          const def = getDefender(userPlayers);
          events.push({
            minute, type: "chance",
            description: userBlockDescs[Math.floor(Math.random() * userBlockDescs.length)](def.short_name, shooter.short_name),
            playerName: def.short_name, isUserEvent: true, actorName: "user",
          });
          // ~35% chance the block deflects behind for a corner
          if (Math.random() < 0.35) stats.opponentCorners++;
        } else {
          events.push({
            minute, type: "chance",
            description: oppChanceDescs[Math.floor(Math.random() * oppChanceDescs.length)](shooter.short_name),
            playerName: shooter.short_name, isUserEvent: false, actorName: "opponent",
          });
        }
      }
    }
  }

  // Half time
  events.push({
    minute: 45,
    type: "half_time",
    description: `HALF TIME: ${userScore.current} - ${opponentScore.current}. ${homeName} ${userScore.current >= opponentScore.current ? "lead" : "trail"} at the break.`,
    playerName: "",
    isUserEvent: true,
    actorName: "",
  });

  return {
    userSquad,
    opponent,
    events,
    userScore: userScore.current,
    opponentScore: opponentScore.current,
    userShots,
    opponentShots,
    userShotsOnTarget,
    opponentShotsOnTarget,
    stats,
  };
}

/**
 * Resumes and finishes a match from the state returned by
 * simulateFirstHalf. Pass `updatedUserSquad` / `updatedOpponentSquad` if
 * either side made substitutions or changed formation at halftime —
 * ratings and possession are recalculated from them, so the change
 * genuinely affects the second half rather than being cosmetic.
 */
export function simulateSecondHalf(
  state: MatchHalfState,
  updatedUserSquad?: SquadWithPlayers,
  updatedOpponentSquad?: SquadWithPlayers,
): MatchResult {
  const userSquad = updatedUserSquad || state.userSquad;
  const opponent = updatedOpponentSquad || state.opponent;
  const userRating = calculateSquadRating(userSquad);
  const opponentRating = calculateSquadRating(opponent);

  const events = [...state.events]; // copy — don't mutate the caller's state.events in place
  const userScore = { current: state.userScore };
  const opponentScore = { current: state.opponentScore };
  let userShots = state.userShots;
  let opponentShots = state.opponentShots;
  let userShotsOnTarget = state.userShotsOnTarget;
  let opponentShotsOnTarget = state.opponentShotsOnTarget;
  const stats = state.stats;

  const homeName = userSquad.name || "Your Team";

  // Recompute possession the same way as the first half — a substitution
  // or formation change should be able to shift it, not just be cosmetic.
  const midRatio = userRating.midfield / (userRating.midfield + opponentRating.midfield);
  const overallRatio = userRating.overall / (userRating.overall + opponentRating.overall);
  const blendedRatio = midRatio * 0.6 + overallRatio * 0.4;
  const amplified = (blendedRatio - 0.5) * 1.8 + 0.5;
  const clamped = Math.max(0.15, Math.min(0.85, amplified));
  const userPossession = Math.round(20 + clamped * 60) + 2;

  const userPlayers = userSquad.players;
  const oppPlayers = opponent.players;

  // ── SECOND HALF ────────────────────────────────────────────────────────
  const secondHalfEvents = Math.floor(Math.random() * 3) + 4; // 4-6

  for (let i = 0; i < secondHalfEvents; i++) {
    const minute = Math.floor(Math.random() * 43) + 46; // 46-89
    const isUserAttack = Math.random() * 100 < userPossession;

    // Check for foul before regular play
    if (maybeInjectFoul(minute, isUserAttack, userPlayers, oppPlayers, events, userScore, opponentScore, stats)) continue;

    // Offside check (~8%) — forwards get caught offside more
    const attackingPlayers = isUserAttack ? userPlayers : oppPlayers;
    if (maybeInjectOffside(minute, events, pickGoalScorer(attackingPlayers), isUserAttack)) continue;

    // Controversial decision (~5%)
    if (maybeInjectControversial(minute, events, pickOutfieldPlayer(attackingPlayers), isUserAttack)) continue;

    if (isUserAttack) {
      userShots++;
      const onTarget = Math.random() < 0.55;
      if (onTarget) {
        userShotsOnTarget++;
        const scorer = pickGoalScorer(userPlayers);
        const scores = Math.random() < 0.3;
        if (scores) {
          handleGoalWithVAR(minute, true, scorer.short_name, userGoalDescs, events, userScore, opponentScore);
        } else {
          const shooter = pickOutfieldPlayer(userPlayers);
          const gk = getGK(oppPlayers);
          events.push({
            minute, type: "save",
            description: oppSaveDescs[Math.floor(Math.random() * oppSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: false, actorName: "opponent",
          });
          // ~35% chance the save concedes a corner for the attacker
          if (Math.random() < 0.35) stats.userCorners++;
        }
      } else {
        const shooter = pickOutfieldPlayer(userPlayers);
        if (Math.random() < 0.3) {
          const def = getDefender(oppPlayers);
          events.push({
            minute, type: "chance",
            description: oppBlockDescs[Math.floor(Math.random() * oppBlockDescs.length)](def.short_name, shooter.short_name),
            playerName: def.short_name, isUserEvent: false, actorName: "opponent",
          });
          // ~35% chance the block deflects behind for a corner
          if (Math.random() < 0.35) stats.userCorners++;
        } else {
          events.push({
            minute, type: "chance",
            description: userChanceDescs[Math.floor(Math.random() * userChanceDescs.length)](shooter.short_name),
            playerName: shooter.short_name, isUserEvent: true, actorName: "user",
          });
        }
      }
    } else {
      opponentShots++;
      const onTarget = Math.random() < 0.45;
      if (onTarget) {
        opponentShotsOnTarget++;
        const scorer = pickGoalScorer(oppPlayers);
        const scores = Math.random() < 0.25;
        if (scores) {
          handleGoalWithVAR(minute, false, scorer.short_name, oppGoalDescs, events, userScore, opponentScore);
        } else {
          const shooter = pickOutfieldPlayer(oppPlayers);
          const gk = getGK(userPlayers);
          events.push({
            minute, type: "save",
            description: userSaveDescs[Math.floor(Math.random() * userSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: true, actorName: "user",
          });
          // ~35% chance the save concedes a corner for the attacker
          if (Math.random() < 0.35) stats.opponentCorners++;
        }
      } else {
        const shooter = pickOutfieldPlayer(oppPlayers);
        if (Math.random() < 0.3) {
          const def = getDefender(userPlayers);
          events.push({
            minute, type: "chance",
            description: userBlockDescs[Math.floor(Math.random() * userBlockDescs.length)](def.short_name, shooter.short_name),
            playerName: def.short_name, isUserEvent: true, actorName: "user",
          });
          // ~35% chance the block deflects behind for a corner
          if (Math.random() < 0.35) stats.opponentCorners++;
        } else {
          events.push({
            minute, type: "chance",
            description: oppChanceDescs[Math.floor(Math.random() * oppChanceDescs.length)](shooter.short_name),
            playerName: shooter.short_name, isUserEvent: false, actorName: "opponent",
          });
        }
      }
    }
  }

  // Full time
  events.push({
    minute: 90,
    type: "full_time",
    description: `FULL TIME: ${userScore.current} - ${opponentScore.current}. ${homeName} ${userScore.current > opponentScore.current ? "win" : userScore.current < opponentScore.current ? "lose" : "draw"}!`,
    playerName: "",
    isUserEvent: true,
    actorName: "",
  });

  // Sort all events by minute ascending
  events.sort((a, b) => a.minute - b.minute);

  // ─── Player of the Match ────────────────────────────────────────────────
  const finalUserScore = userScore.current;
  const finalOppScore = opponentScore.current;
  const result = finalUserScore > finalOppScore ? "win" : finalUserScore < finalOppScore ? "loss" : "draw";

  const userPOTM = userSquad.players.reduce((best, p) => {
    const score = p.overall * 0.5 + p.shooting * 0.2 + p.passing * 0.15 + p.defending * 0.15;
    return score > (best.score || 0) ? { player: p, score } : best;
  }, { player: userSquad.players[0], score: 0 });

  const potm = result === "loss"
    ? { playerId: opponent.players[0]?._id || "", shortName: opponent.players[0]?.short_name || "Opponent", team: "opponent" as const }
    : { playerId: userPOTM.player?._id || "", shortName: userPOTM.player?.short_name || "Player", team: "user" as const };

  return {
    userScore: userScore.current,
    opponentScore: opponentScore.current,
    userPossession,
    opponentPossession: 100 - userPossession,
    userShots,
    opponentShots,
    userShotsOnTarget,
    opponentShotsOnTarget,
    userFouls: stats.userFouls,
    opponentFouls: stats.opponentFouls,
    userYellowCards: stats.userYellowCards,
    opponentYellowCards: stats.opponentYellowCards,
    userRedCards: stats.userRedCards,
    opponentRedCards: stats.opponentRedCards,
    userPenalties: stats.userPenalties,
    opponentPenalties: stats.opponentPenalties,
    userCorners: stats.userCorners,
    opponentCorners: stats.opponentCorners,
    events,
    playerOfTheMatch: potm,
    duration_seconds: 25 + Math.floor(Math.random() * 10),
  };
}

/**
 * Full match in one call, no halftime pause — composes
 * simulateFirstHalf + simulateSecondHalf. Kept for callers that don't need
 * (or don't yet support) a mid-match substitution window.
 */
export function simulateMatch(
  userSquad: SquadWithPlayers,
  opponentSquad?: SquadWithPlayers,
): MatchResult {
  const halfState = simulateFirstHalf(userSquad, opponentSquad);
  return simulateSecondHalf(halfState);
}

// ─── Rewards Calculation ────────────────────────────────────────────────────
const MATCH_FEE = 5;

export { MATCH_FEE };

/**
 * Calculate match rewards based on result, scores, and squad rating.
 *
 * Coins (halved for bot matches — PvP uses full values in socket engine):
 *   Win:  10 base + (goalsScored × 5) – (goalsConceded × 1) + (cleanSheet ? 7 : 0)
 *   Draw: 2  (returns 2 of the 5 entry fee)
 *   Loss: 0  (fee is lost → net -5)
 *
 * XP:
 *   Win:  3
 *   Draw: 2
 *   Loss: 1
 */
export function calculateRewards(
  result: "win" | "loss" | "draw",
  userRating: number,
  userScore: number = 0,
  opponentScore: number = 0,
): { xp: number; coins: number } {
  let coins: number;

  switch (result) {
    case "win": {
      const goalsBonus = userScore * 5;
      const concededPenalty = opponentScore * 1;
      const cleanSheetBonus = opponentScore === 0 ? 7 : 0;
      coins = 10 + goalsBonus - concededPenalty + cleanSheetBonus;
      break;
    }
    case "draw": {
      coins = 2; // partial refund
      break;
    }
    case "loss": {
      coins = 0; // fee is lost
      break;
    }
  }

  const xp = (() => {
    switch (result) {
      case "win":  return 3;
      case "draw": return 2;
      case "loss": return 1;
    }
  })();

  return { xp, coins };
}
