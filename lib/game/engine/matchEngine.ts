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

  // Calculate team strengths
  const userStrength = 
    userRating.attack * 0.25 +
    userRating.midfield * 0.25 +
    userRating.defense * 0.25 +
    userRating.goalkeeping * 0.25;

  const opponentStrength =
    opponentRating.attack * 0.25 +
    opponentRating.midfield * 0.25 +
    opponentRating.defense * 0.25 +
    opponentRating.goalkeeping * 0.25;

  // Possession based on midfield battle
  const userMidBonus = userRating.midfield / (userRating.midfield + opponentRating.midfield);
  const userPossession = Math.round(30 + userMidBonus * 40); // 30-70 range

  // ─── Simulation Loop (20 "minutes" of action) ──────────────────────────
  const totalMinutes = 20;
  const userAttacker = userSquad.players.find((p) => p.position === "FWD");
  const opponentAttacker = opponent.players.find((p) => p.position === "FWD");
  const userGK = userSquad.players.find((p) => p.position === "GK");
  const opponentGK = opponent.players.find((p) => p.position === "GK");

  events.push({
    minute: 1,
    type: "possession",
    description: `The match begins! ${userSquad.name || "Your Team"} vs ${opponent.name || "Opponent"}`,
    playerName: "",
    isUserEvent: true,
  });

  const randMinute = () => Math.floor(Math.random() * (totalMinutes - 2)) + 2;

  for (let m = 0; m < 6; m++) {
    const minute = randMinute();
    const isUserAttack = Math.random() * 100 < userPossession;

    if (isUserAttack) {
      userShots++;
      const shotOnTarget = Math.random() * 100 < 60 + userRating.attack * 0.1;
      if (shotOnTarget) {
        userShotsOnTarget++;
        const saveChance = opponentRating.goalkeeping * 0.4 + (opponentGK?.goalkeeping_reflexes ?? 50) * 0.6;
        const goalChance = userRating.attack * 0.6 + (userAttacker?.attacking_finishing ?? 75) * 0.4;
        const isGoal = Math.random() * 100 < (goalChance / (goalChance + saveChance)) * 60;

        if (isGoal) {
          userScore++;
          events.push({
            minute,
            type: "goal",
            description: `GOAL! ${userAttacker?.short_name || "Your player"} fires home!`,
            playerName: userAttacker?.short_name || "Player",
            isUserEvent: true,
          });
        } else {
          events.push({
            minute,
            type: "save",
            description: `Great save by the opponent's keeper!`,
            playerName: opponentGK?.short_name || "Keeper",
            isUserEvent: false,
          });
        }
      } else {
        events.push({
          minute,
          type: "chance",
          description: `${userAttacker?.short_name || "Your player"} shoots wide.`,
          playerName: userAttacker?.short_name || "Player",
          isUserEvent: true,
        });
      }
    } else {
      opponentShots++;
      const shotOnTarget = Math.random() * 100 < 60 + opponentRating.attack * 0.1;
      if (shotOnTarget) {
        opponentShotsOnTarget++;
        const saveChance = userRating.goalkeeping * 0.4 + (userGK?.goalkeeping_reflexes ?? 50) * 0.6;
        const goalChance = opponentRating.attack * 0.6 + (opponentAttacker?.attacking_finishing ?? 75) * 0.4;
        const isGoal = Math.random() * 100 < (goalChance / (goalChance + saveChance)) * 60;

        if (isGoal) {
          opponentScore++;
          events.push({
            minute,
            type: "goal",
            description: `GOAL! ${opponentAttacker?.short_name || "Opponent"} equalises!`,
            playerName: opponentAttacker?.short_name || "Opponent",
            isUserEvent: false,
          });
        } else {
          events.push({
            minute,
            type: "save",
            description: `Your keeper makes a crucial save!`,
            playerName: userGK?.short_name || "Your Keeper",
            isUserEvent: true,
          });
        }
      } else {
        events.push({
          minute,
          type: "chance",
          description: `${opponentAttacker?.short_name || "Opponent"} misses the target.`,
          playerName: opponentAttacker?.short_name || "Opponent",
          isUserEvent: false,
        });
      }
    }
  }

  // Half time
  events.push({
    minute: 10,
    type: "half_time",
    description: `HALF TIME: ${userScore} - ${opponentScore}`,
    playerName: "",
    isUserEvent: true,
  });

  // Second half attacks
  for (let m = 0; m < 5; m++) {
    const minute = randMinute() + 10;
    const isUserAttack = Math.random() * 100 < userPossession;

    if (isUserAttack) {
      userShots++;
      const shotOnTarget = Math.random() * 100 < 60 + userRating.attack * 0.1;
      if (shotOnTarget) {
        userShotsOnTarget++;
        const saveChance = opponentRating.goalkeeping * 0.4 + (opponentGK?.goalkeeping_reflexes ?? 50) * 0.6;
        const goalChance = userRating.attack * 0.6 + (userAttacker?.attacking_finishing ?? 75) * 0.4;
        const isGoal = Math.random() * 100 < (goalChance / (goalChance + saveChance)) * 60;

        if (isGoal) {
          userScore++;
          events.push({
            minute: Math.min(minute, totalMinutes - 1),
            type: "goal",
            description: `GOAL! ${userAttacker?.short_name || "Your player"} scores! What a strike!`,
            playerName: userAttacker?.short_name || "Player",
            isUserEvent: true,
          });
        } else {
          events.push({
            minute: Math.min(minute, totalMinutes - 1),
            type: "save",
            description: `The keeper denies ${userAttacker?.short_name || "your player"}!`,
            playerName: opponentGK?.short_name || "Keeper",
            isUserEvent: false,
          });
        }
      } else {
        events.push({
          minute: Math.min(minute, totalMinutes - 1),
          type: "chance",
          description: `${userAttacker?.short_name || "Your player"} fires just over the bar!`,
          playerName: userAttacker?.short_name || "Player",
          isUserEvent: true,
        });
      }
    } else {
      opponentShots++;
      const shotOnTarget = Math.random() * 100 < 60 + opponentRating.attack * 0.1;
      if (shotOnTarget) {
        opponentShotsOnTarget++;
        const saveChance = userRating.goalkeeping * 0.4 + (userGK?.goalkeeping_reflexes ?? 50) * 0.6;
        const goalChance = opponentRating.attack * 0.6 + (opponentAttacker?.attacking_finishing ?? 75) * 0.4;
        const isGoal = Math.random() * 100 < (goalChance / (goalChance + saveChance)) * 60;

        if (isGoal) {
          opponentScore++;
          events.push({
            minute: Math.min(minute, totalMinutes - 1),
            type: "goal",
            description: `GOAL! The opponent scores!`,
            playerName: opponentAttacker?.short_name || "Opponent",
            isUserEvent: false,
          });
        } else {
          events.push({
            minute: Math.min(minute, totalMinutes - 1),
            type: "save",
            description: `Your GK pulls off a fantastic save!`,
            playerName: userGK?.short_name || "Your Keeper",
            isUserEvent: true,
          });
        }
      } else {
        events.push({
          minute: Math.min(minute, totalMinutes - 1),
          type: "chance",
          description: `The opponent wastes a good opportunity.`,
          playerName: opponentAttacker?.short_name || "Opponent",
          isUserEvent: false,
        });
      }
    }
  }

  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);

  // Full time
  events.push({
    minute: totalMinutes,
    type: "full_time",
    description: `FULL TIME: ${userScore} - ${opponentScore}`,
    playerName: "",
    isUserEvent: true,
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
    duration_seconds: 20 + Math.floor(Math.random() * 10),
  };
}

// ─── Rewards Calculation ────────────────────────────────────────────────────
export function calculateRewards(result: "win" | "loss" | "draw", userRating: number): { xp: number; coins: number } {
  const baseXP = 5;
  const baseCoins = 5;

  switch (result) {
    case "win":
      return {
        xp: baseXP + Math.floor(userRating / 20) + Math.floor(Math.random() * 5),
        coins: Math.floor(baseCoins * 1.5) + Math.floor(Math.random() * 15),
      };
    case "draw":
      return {
        xp: baseXP + Math.floor(userRating / 40) + Math.floor(Math.random() * 3),
        coins: Math.floor(baseCoins * 0.75) + Math.floor(Math.random() * 8),
      };
    case "loss":
      return {
        xp: Math.floor(baseXP / 2) + Math.floor(Math.random() * 3),
        coins: Math.floor(baseCoins / 2) + Math.floor(Math.random() * 4),
      };
  }
}
