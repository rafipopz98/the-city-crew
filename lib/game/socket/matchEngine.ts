/**
 * PvP Match Engine for Socket-based matches.
 * Simulates a match between two real players based on their squad ratings.
 * Uses actual player names and positions for realistic event descriptions.
 * Only attacking players (FWD) score goals.
 */

interface MatchEvent {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "half_time" | "full_time" | "possession";
  description: string;
  actorName: string;
}

interface PlayerInfo {
  name: string;
  position: string; // GK, DEF, MID, FWD
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random outfield player (not GK) from the given players */
function pickOutfieldPlayer(players: PlayerInfo[]): PlayerInfo {
  const outfield = players.filter((p) => p.position !== "GK");
  if (outfield.length === 0) return players[0] || { name: "Player", position: "MID" };
  return outfield[Math.floor(Math.random() * outfield.length)];
}

/**
 * Pick a goal scorer using weighted probabilities:
 * - FWD: 60% chance (most likely to score)
 * - MID: 30% chance
 * - DEF: 10% chance
 * - GK: 0% (never scores)
 * Falls back to any outfield player.
 */
function pickGoalScorer(players: PlayerInfo[]): PlayerInfo {
  const outfield = players.filter((p) => p.position !== "GK");
  if (outfield.length === 0) return players[0] || { name: "Player", position: "MID" };

  const roll = Math.random() * 100;
  let cumulative = 0;

  // Try FWD first (60%)
  cumulative += 60;
  if (roll < cumulative) {
    const forwards = outfield.filter((p) => p.position === "FWD");
    if (forwards.length > 0) return forwards[Math.floor(Math.random() * forwards.length)];
  }

  // Try MID (30%)
  cumulative += 30;
  if (roll < cumulative) {
    const mids = outfield.filter((p) => p.position === "MID");
    if (mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];
  }

  // DEF (10%) — or fallback to any outfield if we don't have that position
  const defs = outfield.filter((p) => p.position === "DEF");
  if (defs.length > 0) return defs[Math.floor(Math.random() * defs.length)];

  // Fallback: any remaining outfield player
  return outfield[Math.floor(Math.random() * outfield.length)];
}

/** Get the goalkeeper name */
function getGK(players: PlayerInfo[]): string {
  const gk = players.find((p) => p.position === "GK");
  return gk?.name || "Keeper";
}

/** Get a random defender name */
function getDefender(players: PlayerInfo[]): string {
  const defs = players.filter((p) => p.position === "DEF");
  if (defs.length > 0) return defs[Math.floor(Math.random() * defs.length)].name;
  return pickOutfieldPlayer(players).name;
}

/**
 * Pick the kick-off taker: a FWD > MID > DEF (never GK).
 * This ensures the match starts with a realistic player taking the first kick.
 */
function pickKickoffTaker(players: PlayerInfo[]): PlayerInfo {
  // FWD first — most realistic for kick-off
  const forwards = players.filter((p) => p.position === "FWD");
  if (forwards.length > 0) return forwards[Math.floor(Math.random() * forwards.length)];

  // Fall back to MID
  const mids = players.filter((p) => p.position === "MID");
  if (mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];

  // Last resort: DEF (still better than GK taking the kick-off)
  const defs = players.filter((p) => p.position === "DEF");
  if (defs.length > 0) return defs[Math.floor(Math.random() * defs.length)];

  // Should never reach here, but just in case:
  return pickOutfieldPlayer(players);
}

/** Get a random midfielder name */
function getMidfielder(players: PlayerInfo[]): string {
  const mids = players.filter((p) => p.position === "MID");
  if (mids.length > 0) return mids[Math.floor(Math.random() * mids.length)].name;
  return pickOutfieldPlayer(players).name;
}

// ─── Off-target shots (chances) — shooter missed, no GK involved ──────────
const homeChanceDescs = [
  (p: string) => `${p} cuts inside and fires just wide of the post!`,
  (p: string) => `${p} bursts into the box but blazes over the bar!`,
  (p: string) => `${p} tries a long-range effort — just past the post!`,
  (p: string) => `${p} heads toward goal from the corner — off target!`,
  (p: string) => `${p} with a powerful strike — high and wide!`,
  (p: string) => `${p} creates space and lets fly — no goal!`,
  (p: string) => `Great build-up play! ${p} shoots but it's off balance — wide.`,
  (p: string) => `${p} volleys from close range — straight at the keeper!`,
  (p: string) => `${p} with a free kick — curls over the wall but just over!`,
  (p: string) => `${p} is put through on goal but drags it wide!`,
];

const awayChanceDescs = [
  (p: string) => `${p} breaks through but shoots straight at the keeper!`,
  (p: string) => `${p} with a snapshot — just wide of the far post!`,
  (p: string) => `${p} has a go from distance — it's rising over the bar!`,
  (p: string) => `${p} tries to chip the keeper — too high!`,
  (p: string) => `${p} races onto a through ball but scuffs the shot!`,
  (p: string) => `${p} cuts back onto their strong foot — dragged wide!`,
  (p: string) => `${p} with a curling effort — doesn't dip enough!`,
  (p: string) => `${p} spins and shoots — easy pickings for the keeper.`,
  (p: string) => `${p} has a pop from the edge — whistles just past the post!`,
  (p: string) => `${p} slips past the defender but shoots weakly.`,
];

// ─── GK saves — ONLY goalkeeper makes saves (no outfield player saves!) ────
const homeSaveDescs = [
  (gk: string, p: string) => `What a save! ${gk} denies ${p} with a strong hand!`,
  (gk: string, p: string) => `${gk} is down quickly to smother ${p}'s shot!`,
  (gk: string, p: string) => `${gk} makes a sharp save to keep out ${p}!`,
  (gk: string, p: string) => `Brilliant reflexes from ${gk}! ${p} is denied!`,
  (gk: string, p: string) => `${gk} tips ${p}'s curling shot around the post!`,
  (gk: string, p: string) => `${gk} comes out and bravely blocks at ${p}'s feet!`,
];

const awaySaveDescs = [
  (gk: string, p: string) => `Superb stop! ${gk} denies ${p} from close range!`,
  (gk: string, p: string) => `${gk} spreads wide and blocks ${p}'s effort!`,
  (gk: string, p: string) => `${gk} stands tall and beats away ${p}'s powerful strike!`,
  (gk: string, p: string) => `Great anticipation from ${gk} to save ${p}'s attempt!`,
  (gk: string, p: string) => `${gk} gets down well to parry ${p}'s drive!`,
  (gk: string, p: string) => `${gk} acrobatically tips over ${p}'s header!`,
];

// ─── Defender blocks — defender stops the ball with body (not hands!) ─────
const homeBlockDescs = [
  (d: string, p: string) => `Vital block! ${d} throws a body in front of ${p}'s shot!`,
  (d: string, p: string) => `${d} slides across to block ${p}'s goal-bound effort!`,
  (d: string, p: string) => `Last-ditch tackling from ${d} to deny ${p}!`,
  (d: string, p: string) => `${d} gets across brilliantly to block the shot!`,
];

const awayBlockDescs = [
  (d: string, p: string) => `${d} makes a crucial block to deny ${p}!`,
  (d: string, p: string) => `Superb defending! ${d} hurls themself in front of ${p}'s strike!`,
  (d: string, p: string) => `${d} reads the play perfectly and blocks ${p}'s attempt!`,
  (d: string, p: string) => `${d} puts their body on the line to block!`,
];

const homeGoalDescs = [
  (p: string) => `GOAL! ${p} finds the bottom corner with a clinical finish! 🎯`,
  (p: string) => `GOAL! ${p} heads home from a pinpoint cross! 👑`,
  (p: string) => `GOAL! ${p} smashes it into the roof of the net! 💥`,
  (p: string) => `GOAL! ${p} slots it past the keeper with composure! 🥶`,
  (p: string) => `GOAL! ${p} rifles a shot into the top bins! 🚀`,
  (p: string) => `GOAL! ${p} turns and fires — unstoppable! 🔥`,
  (p: string) => `GOAL! ${p} pounces on the rebound and scores! ⚡`,
  (p: string) => `GOAL! ${p} curls a beauty into the far corner! 🎯`,
];

const awayGoalDescs = [
  (p: string) => `GOAL! ${p} strikes on the counter and scores! ⚡`,
  (p: string) => `GOAL! ${p} with a cool finish — 1-on-1 with the keeper! 🥶`,
  (p: string) => `GOAL! ${p} volleys home from a corner kick! 👑`,
  (p: string) => `GOAL! ${p} rifles a low shot into the corner! 🎯`,
  (p: string) => `GOAL! ${p} takes aim from range and picks out the top corner! 🚀`,
  (p: string) => `GOAL! ${p} slides in to meet the cross — perfect connection! 🔥`,
  (p: string) => `GOAL! ${p} with a sublime lob over the stranded keeper! 🤯`,
  (p: string) => `GOAL! ${p} drills it home from a set-piece routine! ⚡`,
];

interface PvPResult {
  homeScore: number;
  awayScore: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
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
  const events: MatchEvent[] = [];
  let homeScore = 0, awayScore = 0;
  let homeShots = 0, awayShots = 0;
  let homeShotsOnTarget = 0, awayShotsOnTarget = 0;

  // Build player info arrays
  const homePlayers: PlayerInfo[] = (homePlayerNames || []).map((name, i) => ({
    name,
    position: (homePlayerPositions && homePlayerPositions[i]) || "MID",
  }));
  const awayPlayers: PlayerInfo[] = (awayPlayerNames || []).map((name, i) => ({
    name,
    position: (awayPlayerPositions && awayPlayerPositions[i]) || "MID",
  }));

  // Possession based on relative ratings
  const total = homeRating + awayRating;
  const homePossession = Math.round(30 + (homeRating / total) * 40);
  const awayPossession = 100 - homePossession;

  // Strength difference influences outcome
  const ratingDiff = homeRating - awayRating;
  const homeAdvantage = 0.5 + (ratingDiff / 100);

  events.push({
    minute: 1,
    type: "possession",
    description: `The match kicks off! ${pickKickoffTaker(homePlayers).name} gets us underway!`,
    actorName: "",
  });

  // ── FIRST HALF ─────────────────────────────────────────────────────────
  // All first-half events use minutes 3-42 (all before halftime at 45)
  const firstHalfTimer = [3, 8, 12, 18, 24, 30, 35, 42];
  const firstHalfEvents = randomBetween(6, 8); // 6-8 events in first half

  for (let i = 0; i < firstHalfEvents; i++) {
    const minute = firstHalfTimer[i] || randomBetween(3, 42);
    const isHomeAttack = Math.random() * 100 < homePossession;

    if (isHomeAttack) {
      homeShots++;
      const onTarget = Math.random() < 0.5 + homeAdvantage * 0.2;
      if (onTarget) {
        homeShotsOnTarget++;
        const scores = Math.random() < 0.35 + homeAdvantage * 0.15;
        if (scores) {
          homeScore++;
          const scorer = pickGoalScorer(homePlayers);
          const desc = homeGoalDescs[Math.floor(Math.random() * homeGoalDescs.length)](scorer.name);
          events.push({ minute, type: "goal", description: desc, actorName: "home" });
        } else {
          // Shot saved by GK (only GK makes saves!)
          const shooter = pickOutfieldPlayer(homePlayers);
          const gk = getGK(awayPlayers);
          const desc = awaySaveDescs[Math.floor(Math.random() * awaySaveDescs.length)](gk, shooter.name);
          events.push({ minute, type: "save", description: desc, actorName: "away" });
        }
      } else {
        // Off target — sometimes it's a block by a defender (not a save!)
        if (Math.random() < 0.3) {
          const shooter = pickOutfieldPlayer(homePlayers);
          const def = getDefender(awayPlayers);
          const desc = awayBlockDescs[Math.floor(Math.random() * awayBlockDescs.length)](def, shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "away" });
        } else {
          const shooter = pickOutfieldPlayer(homePlayers);
          const desc = homeChanceDescs[Math.floor(Math.random() * homeChanceDescs.length)](shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "home" });
        }
      }
    } else {
      awayShots++;
      const onTarget = Math.random() < 0.5 - homeAdvantage * 0.2;
      if (onTarget) {
        awayShotsOnTarget++;
        const scores = Math.random() < 0.35 - homeAdvantage * 0.15;
        if (scores) {
          awayScore++;
          const scorer = pickGoalScorer(awayPlayers);
          const desc = awayGoalDescs[Math.floor(Math.random() * awayGoalDescs.length)](scorer.name);
          events.push({ minute, type: "goal", description: desc, actorName: "away" });
        } else {
          const shooter = pickOutfieldPlayer(awayPlayers);
          const gk = getGK(homePlayers);
          const desc = homeSaveDescs[Math.floor(Math.random() * homeSaveDescs.length)](gk, shooter.name);
          events.push({ minute, type: "save", description: desc, actorName: "home" });
        }
      } else {
        if (Math.random() < 0.3) {
          const shooter = pickOutfieldPlayer(awayPlayers);
          const def = getDefender(homePlayers);
          const desc = homeBlockDescs[Math.floor(Math.random() * homeBlockDescs.length)](def, shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "home" });
        } else {
          const shooter = pickOutfieldPlayer(awayPlayers);
          const desc = awayChanceDescs[Math.floor(Math.random() * awayChanceDescs.length)](shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "away" });
        }
      }
    }
  }

  // ── HALF TIME — score only counts first half events (minutes < 45) ────
  const homeName = homePlayers[0]?.name || "Home";
  const awayName = awayPlayers[0]?.name || "Away";
  events.push({
    minute: 45,
    type: "half_time",
    description: `HALF TIME: ${homeScore} - ${awayScore}. ${homeName}'s team ${homeScore >= awayScore ? "leading" : homeScore < awayScore ? "trailing" : "level"} at the break.`,
    actorName: "",
  });

  // ── SECOND HALF (minutes 50-88) ───────────────────────────────────────
  const secondHalfTimer = [50, 55, 62, 68, 74, 78, 82, 88];
  const secondHalfEvents = randomBetween(4, 6); // 4-6 events in second half

  for (let i = 0; i < secondHalfEvents; i++) {
    const minute = secondHalfTimer[i] || randomBetween(50, 88);
    const isHomeAttack = Math.random() * 100 < homePossession;

    if (isHomeAttack) {
      homeShots++;
      const onTarget = Math.random() < 0.5 + homeAdvantage * 0.2;
      if (onTarget) {
        homeShotsOnTarget++;
        if (Math.random() < 0.3 + homeAdvantage * 0.15) {
          homeScore++;
          const scorer = pickGoalScorer(homePlayers);
          const desc = homeGoalDescs[Math.floor(Math.random() * homeGoalDescs.length)](scorer.name);
          events.push({ minute, type: "goal", description: desc, actorName: "home" });
        } else {
          const shooter = pickOutfieldPlayer(homePlayers);
          const gk = getGK(awayPlayers);
          const desc = awaySaveDescs[Math.floor(Math.random() * awaySaveDescs.length)](gk, shooter.name);
          events.push({ minute, type: "save", description: desc, actorName: "away" });
        }
      } else {
        if (Math.random() < 0.3) {
          const shooter = pickOutfieldPlayer(homePlayers);
          const def = getDefender(awayPlayers);
          const desc = awayBlockDescs[Math.floor(Math.random() * awayBlockDescs.length)](def, shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "away" });
        } else {
          const shooter = pickOutfieldPlayer(homePlayers);
          const desc = homeChanceDescs[Math.floor(Math.random() * homeChanceDescs.length)](shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "home" });
        }
      }
    } else {
      awayShots++;
      const onTarget = Math.random() < 0.5 - homeAdvantage * 0.2;
      if (onTarget) {
        awayShotsOnTarget++;
        if (Math.random() < 0.3 - homeAdvantage * 0.15) {
          awayScore++;
          const scorer = pickGoalScorer(awayPlayers);
          const desc = awayGoalDescs[Math.floor(Math.random() * awayGoalDescs.length)](scorer.name);
          events.push({ minute, type: "goal", description: desc, actorName: "away" });
        } else {
          const shooter = pickOutfieldPlayer(awayPlayers);
          const gk = getGK(homePlayers);
          const desc = homeSaveDescs[Math.floor(Math.random() * homeSaveDescs.length)](gk, shooter.name);
          events.push({ minute, type: "save", description: desc, actorName: "home" });
        }
      } else {
        if (Math.random() < 0.3) {
          const shooter = pickOutfieldPlayer(awayPlayers);
          const def = getDefender(homePlayers);
          const desc = homeBlockDescs[Math.floor(Math.random() * homeBlockDescs.length)](def, shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "home" });
        } else {
          const shooter = pickOutfieldPlayer(awayPlayers);
          const desc = awayChanceDescs[Math.floor(Math.random() * awayChanceDescs.length)](shooter.name);
          events.push({ minute, type: "chance", description: desc, actorName: "away" });
        }
      }
    }
  }

  events.push({
    minute: 90,
    type: "full_time",
    description: `FULL TIME: ${homeScore} - ${awayScore}. ${homeName} ${homeScore > awayScore ? "win" : homeScore < awayScore ? "lose" : "draw"} in a thrilling contest!`,
    actorName: "",
  });

  // Determine winner
  const winner = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";

  // POTM - pick from the winning team's goal scorer(s), or a random player
  const winningPlayers = winner === "home" ? homePlayers : winner === "away" ? awayPlayers : [...homePlayers, ...awayPlayers];
  const potm = winningPlayers.length > 0
    ? winningPlayers[Math.floor(Math.random() * winningPlayers.length)].name
    : "Unknown";

  // ── Rewards (coin-based with bonus system) ──────────────────────────────
  const matchFee = 5;

  const calcRewards = (isWinner: boolean, isDraw: boolean, scored: number, conceded: number) => {
    const xp = isWinner ? 5 : isDraw ? 3 : 1;

    let coins: number;
    if (isWinner) {
      coins = 20 + scored * 10 - conceded * 2 + (conceded === 0 ? 15 : 0);
    } else if (isDraw) {
      coins = matchFee; // refund
    } else {
      coins = 0; // fee is lost
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
    events,
    playerOfTheMatch: potm,
    winner,
    homeRewards,
    awayRewards,
  };
}
