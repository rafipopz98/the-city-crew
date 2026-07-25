/**
 * PvP Match Engine for Socket-based matches.
 * Simulates a match between two real players based on their squad ratings.
 */

interface MatchEvent {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "half_time" | "full_time" | "possession";
  description: string;
  actorName: string;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomName(homeNames?: string[], awayNames?: string[], side?: "home" | "away"): string {
  const names = side === "home" && homeNames?.length
    ? homeNames
    : side === "away" && awayNames?.length
      ? awayNames
      : [
          "De Bruyne", "Haaland", "Foden", "Rodri", "Silva",
          "Grealish", "Doku", "Alvarez", "Kovacic", "Nunes",
          "Gvardiol", "Dias", "Stones", "Ake", "Akanji",
          "Lewis", "Walker", "Ederson", "Ortega", "Carson",
        ];
  return names[Math.floor(Math.random() * names.length)];
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
): PvPResult {
  const events: MatchEvent[] = [];
  let homeScore = 0, awayScore = 0;
  let homeShots = 0, awayShots = 0;
  let homeShotsOnTarget = 0, awayShotsOnTarget = 0;

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
    description: `The match kicks off!`,
    actorName: "",
  });

  // Simulate ~8-12 events
  const attackCount = randomBetween(8, 12);
  const timer = [3, 8, 12, 18, 24, 30, 35, 42, 50, 55, 65, 72, 78, 82, 88];

  for (let i = 0; i < attackCount; i++) {
    const minute = timer[i] || randomBetween(2, 24);
    const isHomeAttack = Math.random() * 100 < homePossession;

    if (isHomeAttack) {
      homeShots++;
      const onTarget = Math.random() < 0.5 + homeAdvantage * 0.2;
      if (onTarget) {
        homeShotsOnTarget++;
        const scores = Math.random() < 0.35 + homeAdvantage * 0.15;
        if (scores) {
          homeScore++;
          events.push({
            minute,
            type: "goal",
            description: `GOAL! ${getRandomName(homePlayerNames, awayPlayerNames, "home")} scores for the home team!`,
            actorName: "home",
          });
        } else {
          events.push({
            minute,
            type: "save",
            description: `Great save! The away keeper denies the home team.`,
            actorName: "away",
          });
        }
      } else {
        events.push({
          minute,
          type: "chance",
          description: `Home team attacks but the shot goes wide.`,
          actorName: "home",
        });
      }
    } else {
      awayShots++;
      const onTarget = Math.random() < 0.5 - homeAdvantage * 0.2;
      if (onTarget) {
        awayShotsOnTarget++;
        const scores = Math.random() < 0.35 - homeAdvantage * 0.15;
        if (scores) {
          awayScore++;
          events.push({
            minute,
            type: "goal",
            description: `GOAL! ${getRandomName(homePlayerNames, awayPlayerNames, "away")} equalises for the away team!`,
            actorName: "away",
          });
        } else {
          events.push({
            minute,
            type: "save",
            description: `Brilliant save! Home keeper is at full stretch!`,
            actorName: "home",
          });
        }
      } else {
        events.push({
          minute,
          type: "chance",
          description: `Away team with a chance... but it's off target.`,
          actorName: "away",
        });
      }
    }
  }

  // Half time
  events.push({
    minute: 45,
    type: "half_time",
    description: `HALF TIME: ${homeScore} - ${awayScore}`,
    actorName: "",
  });

  // Second half (fewer events)
  for (let i = 0; i < 4; i++) {
    const minute = timer[i + 6] || randomBetween(50, 88);
    const isHomeAttack = Math.random() * 100 < homePossession;

    if (isHomeAttack) {
      homeShots++;
      const onTarget = Math.random() < 0.5 + homeAdvantage * 0.2;
      if (onTarget) {
        homeShotsOnTarget++;
        if (Math.random() < 0.3 + homeAdvantage * 0.15) {
          homeScore++;
          events.push({
            minute,
            type: "goal",
            description: `GOAL! The home team takes the lead!`,
            actorName: "home",
          });
        } else {
          events.push({
            minute,
            type: "save",
            description: `What a save! The away keeper keeps it out!`,
            actorName: "away",
          });
        }
      } else {
        events.push({
          minute,
          type: "chance",
          description: `Home team shoots... just over the bar!`,
          actorName: "home",
        });
      }
    } else {
      awayShots++;
      const onTarget = Math.random() < 0.5 - homeAdvantage * 0.2;
      if (onTarget) {
        awayShotsOnTarget++;
        if (Math.random() < 0.3 - homeAdvantage * 0.15) {
          awayScore++;
          events.push({
            minute,
            type: "goal",
            description: `GOAL! The away team strikes back!`,
            actorName: "away",
          });
        } else {
          events.push({
            minute,
            type: "save",
            description: `Home keeper comes up with a massive save!`,
            actorName: "home",
          });
        }
      } else {
        events.push({
          minute,
          type: "chance",
          description: `Away team wastes a good opportunity.`,
          actorName: "away",
        });
      }
    }
  }

  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);

  events.push({
    minute: 90,
    type: "full_time",
    description: `FULL TIME: ${homeScore} - ${awayScore}`,
    actorName: "",
  });

  // Determine winner
  const winner = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";

  // POTM - the team that scored more or random
  const potm = homeScore >= awayScore ? `${getRandomName()} (Home)` : `${getRandomName()} (Away)`;

  // Rewards (winning gets more)
  const baseXp = 8;
  const baseCoins = 10;

  const homeRewards = {
    xp: baseXp + (winner === "home" ? 2 : winner === "draw" ? 1 : 0) + randomBetween(0, 2),
    coins: baseCoins + (winner === "home" ? 10 : winner === "draw" ? 5 : 2) + randomBetween(0, 5),
  };

  const awayRewards = {
    xp: baseXp + (winner === "away" ? 2 : winner === "draw" ? 1 : 0) + randomBetween(0, 2),
    coins: baseCoins + (winner === "away" ? 10 : winner === "draw" ? 5 : 2) + randomBetween(0, 5),
  };

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
