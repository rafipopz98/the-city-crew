/**
 * TCC Manager - Match Engine
 *
 * 5v5 attribute-based simulation engine.
 * Uses player attributes to determine match outcomes.
 * Positions matter - playing out of position reduces effectiveness.
 */

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
  type: "attack" | "chance" | "goal" | "save" | "foul" | "card" | "half_time" | "full_time" | "possession";
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
  events: MatchEvent[];
  playerOfTheMatch: { playerId: string; shortName: string; team: "user" | "opponent" };
  duration_seconds: number;
}

interface SquadWithPlayers {
  players: MatchPlayer[];
  name?: string;
}

// ─── Position Effectiveness ─────────────────────────────────────────────────
function getPositionEffectiveness(player: MatchPlayer, assignedPosition: string): number {
  const naturalPositions = getNaturalPositions(player);

  if (assignedPosition === "GK") {
    // Only GK-rated players should play GK
    if (naturalPositions.includes("GK")) return 1.0;
    if (player.goalkeeping_diving && player.goalkeeping_diving > 50) return 0.6;
    return 0.3;
  }

  if (naturalPositions.includes(assignedPosition)) return 1.0;

  // Check related positions
  const related: Record<string, string[]> = {
    DEF: ["CDM", "LB", "RB", "LWB", "RWB"],
    MID: ["CM", "CDM", "CAM", "LM", "RM"],
    FWD: ["ST", "CF", "LW", "RW", "LF", "RF"],
  };

  const isRelated = naturalPositions.some((np) => related[assignedPosition]?.includes(np));
  if (isRelated) return 0.85;

  // Out of position penalty
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
function calculateSquadRating(squad: SquadWithPlayers): {
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
];

const userSaveDescs = [
  (gk: string, p: string) => `What a save! ${gk} denies ${p} with a strong hand!`,
  (gk: string, p: string) => `${gk} is down quickly to smother ${p}'s shot!`,
  (gk: string, p: string) => `${gk} makes a sharp save to keep out ${p}!`,
  (gk: string, p: string) => `Brilliant reflexes from ${gk}! ${p} is denied!`,
  (gk: string, p: string) => `${gk} tips ${p}'s curling shot around the post!`,
];

const oppSaveDescs = [
  (gk: string, p: string) => `Superb stop! ${gk} denies ${p} from close range!`,
  (gk: string, p: string) => `${gk} spreads wide and blocks ${p}'s effort!`,
  (gk: string, p: string) => `${gk} stands tall and beats away ${p}'s powerful strike!`,
  (gk: string, p: string) => `Great anticipation from ${gk} to save ${p}'s attempt!`,
  (gk: string, p: string) => `${gk} gets down well to parry ${p}'s drive!`,
];

const userBlockDescs = [
  (d: string, p: string) => `Vital block! ${d} throws a body in front of ${p}'s shot!`,
  (d: string, p: string) => `${d} slides across to block ${p}'s goal-bound effort!`,
  (d: string, p: string) => `Last-ditch tackling from ${d} to deny ${p}!`,
  (d: string, p: string) => `${d} gets across brilliantly to block the shot!`,
];

const oppBlockDescs = [
  (d: string, p: string) => `${d} makes a crucial block to deny ${p}!`,
  (d: string, p: string) => `Superb defending! ${d} hurls themself in front of ${p}'s strike!`,
  (d: string, p: string) => `${d} reads the play perfectly and blocks ${p}'s attempt!`,
  (d: string, p: string) => `${d} puts their body on the line to block!`,
];

const userGoalDescs = [
  (p: string) => `GOAL! ${p} finds the bottom corner with a clinical finish! 🎯`,
  (p: string) => `GOAL! ${p} heads home from a pinpoint cross! 👑`,
  (p: string) => `GOAL! ${p} smashes it into the roof of the net! 💥`,
  (p: string) => `GOAL! ${p} slots it past the keeper with composure! 🥶`,
  (p: string) => `GOAL! ${p} rifles a shot into the top bins! 🚀`,
  (p: string) => `GOAL! ${p} turns and fires — unstoppable! 🔥`,
];

const oppGoalDescs = [
  (p: string) => `GOAL! ${p} strikes on the counter and scores! ⚡`,
  (p: string) => `GOAL! ${p} with a cool finish — 1-on-1 with the keeper! 🥶`,
  (p: string) => `GOAL! ${p} volleys home from a corner kick! 👑`,
  (p: string) => `GOAL! ${p} rifles a low shot into the corner! 🎯`,
  (p: string) => `GOAL! ${p} takes aim from range and picks out the top corner! 🚀`,
  (p: string) => `GOAL! ${p} drills it home from a set-piece routine! ⚡`,
];

// ─── Match Simulation ───────────────────────────────────────────────────────
export function simulateMatch(
  userSquad: SquadWithPlayers,
  opponentSquad?: SquadWithPlayers,
): MatchResult {
  const userRating = calculateSquadRating(userSquad);
  const opponent = opponentSquad || generateOpponentSquad(userRating.overall);
  const opponentRating = calculateSquadRating(opponent);

  const events: MatchEvent[] = [];
  let userScore = 0,
    opponentScore = 0;
  let userShots = 0,
    opponentShots = 0;
  let userShotsOnTarget = 0,
    opponentShotsOnTarget = 0;

  // Possession based on midfield battle
  const userMidBonus = userRating.midfield / (userRating.midfield + opponentRating.midfield);
  const userPossession = Math.round(30 + userMidBonus * 40);

  const homeName = userSquad.name || "Your Team";
  const awayName = opponent.name || "Opponent";

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
  const firstHalfMinutes = [3, 8, 12, 18, 24, 30, 35, 42];
  const firstHalfEvents = Math.floor(Math.random() * 4) + 6; // 6-9

  for (let i = 0; i < firstHalfEvents; i++) {
    const minute = firstHalfMinutes[i] || Math.floor(Math.random() * 40) + 2;
    const isUserAttack = Math.random() * 100 < userPossession;

    if (isUserAttack) {
      userShots++;
      const onTarget = Math.random() < 0.55;
      if (onTarget) {
        userShotsOnTarget++;
        const scorer = pickGoalScorer(userPlayers);
        const scores = Math.random() < 0.35 + (userRating.attack / (userRating.attack + opponentRating.goalkeeping)) * 0.15;
        if (scores) {
          userScore++;
          events.push({
            minute, type: "goal",
            description: userGoalDescs[Math.floor(Math.random() * userGoalDescs.length)](scorer.short_name),
            playerName: scorer.short_name, isUserEvent: true, actorName: "user",
          });
        } else {
          const shooter = pickOutfieldPlayer(userPlayers);
          const gk = getGK(oppPlayers);
          events.push({
            minute, type: "save",
            description: oppSaveDescs[Math.floor(Math.random() * oppSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: false, actorName: "opponent",
          });
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
          opponentScore++;
          events.push({
            minute, type: "goal",
            description: oppGoalDescs[Math.floor(Math.random() * oppGoalDescs.length)](scorer.short_name),
            playerName: scorer.short_name, isUserEvent: false, actorName: "opponent",
          });
        } else {
          const shooter = pickOutfieldPlayer(oppPlayers);
          const gk = getGK(userPlayers);
          events.push({
            minute, type: "save",
            description: userSaveDescs[Math.floor(Math.random() * userSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: true, actorName: "user",
          });
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
    description: `HALF TIME: ${userScore} - ${opponentScore}. ${homeName} ${userScore >= opponentScore ? "lead" : "trail"} at the break.`,
    playerName: "",
    isUserEvent: true,
    actorName: "",
  });

  // ── SECOND HALF ────────────────────────────────────────────────────────
  const secondHalfMinutes = [50, 55, 62, 68, 74, 78, 82, 88];
  const secondHalfEvents = Math.floor(Math.random() * 3) + 4; // 4-6

  for (let i = 0; i < secondHalfEvents; i++) {
    const minute = secondHalfMinutes[i] || Math.floor(Math.random() * 35) + 50;
    const isUserAttack = Math.random() * 100 < userPossession;

    if (isUserAttack) {
      userShots++;
      const onTarget = Math.random() < 0.55;
      if (onTarget) {
        userShotsOnTarget++;
        const scorer = pickGoalScorer(userPlayers);
        const scores = Math.random() < 0.3;
        if (scores) {
          userScore++;
          events.push({
            minute, type: "goal",
            description: userGoalDescs[Math.floor(Math.random() * userGoalDescs.length)](scorer.short_name),
            playerName: scorer.short_name, isUserEvent: true, actorName: "user",
          });
        } else {
          const shooter = pickOutfieldPlayer(userPlayers);
          const gk = getGK(oppPlayers);
          events.push({
            minute, type: "save",
            description: oppSaveDescs[Math.floor(Math.random() * oppSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: false, actorName: "opponent",
          });
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
          opponentScore++;
          events.push({
            minute, type: "goal",
            description: oppGoalDescs[Math.floor(Math.random() * oppGoalDescs.length)](scorer.short_name),
            playerName: scorer.short_name, isUserEvent: false, actorName: "opponent",
          });
        } else {
          const shooter = pickOutfieldPlayer(oppPlayers);
          const gk = getGK(userPlayers);
          events.push({
            minute, type: "save",
            description: userSaveDescs[Math.floor(Math.random() * userSaveDescs.length)](gk.short_name, shooter.short_name),
            playerName: gk.short_name, isUserEvent: true, actorName: "user",
          });
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
    description: `FULL TIME: ${userScore} - ${opponentScore}. ${homeName} ${userScore > opponentScore ? "win" : userScore < opponentScore ? "lose" : "draw"}!`,
    playerName: "",
    isUserEvent: true,
    actorName: "",
  });

  // ─── Player of the Match ────────────────────────────────────────────────
  const result = userScore > opponentScore ? "win" : userScore < opponentScore ? "loss" : "draw";

  const userPOTM = userSquad.players.reduce((best, p) => {
    const score = p.overall * 0.5 + p.shooting * 0.2 + p.passing * 0.15 + p.defending * 0.15;
    return score > (best.score || 0) ? { player: p, score } : best;
  }, { player: userSquad.players[0], score: 0 });

  const potm = result === "loss"
    ? { playerId: opponent.players[0]?._id || "", shortName: opponent.players[0]?.short_name || "Opponent", team: "opponent" as const }
    : { playerId: userPOTM.player?._id || "", shortName: userPOTM.player?.short_name || "Player", team: "user" as const };

  return {
    userScore,
    opponentScore,
    userPossession,
    opponentPossession: 100 - userPossession,
    userShots,
    opponentShots,
    userShotsOnTarget,
    opponentShotsOnTarget,
    events,
    playerOfTheMatch: potm,
    duration_seconds: 25 + Math.floor(Math.random() * 10),
  };
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
