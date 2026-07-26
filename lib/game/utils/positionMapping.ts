/**
 * Player Position & Upgrade Utilities
 *
 * Maps specific football positions (CB, CM, ST, etc.) to the broad
 * squad categories used in TCC: GK, DEF, MID, FWD.
 * Also provides stat calculation helpers.
 */

const POSITION_CATEGORIES: Record<string, string> = {
  GK: "GK",

  // Defenders
  CB: "DEF",
  LB: "DEF",
  RB: "DEF",
  LWB: "DEF",
  RWB: "DEF",
  SW: "DEF",

  // Midfielders
  CDM: "MID",
  CM: "MID",
  CAM: "MID",
  LM: "MID",
  RM: "MID",

  // Forwards
  CF: "FWD",
  ST: "FWD",
  LW: "FWD",
  RW: "FWD",
  LF: "FWD",
  RF: "FWD",
};

/**
 * Convert a specific position (e.g. "CB", "CM", "ST") to its broad category.
 * Returns the input as-is if no mapping exists.
 */
export function getPositionCategory(pos: string): string {
  return POSITION_CATEGORIES[pos] || pos;
}

/**
 * Check if a player (who may have multiple specific positions like ["CB", "LB"])
 * belongs to the given broad category (e.g. "DEF").
 */
export function playerMatchesCategory(
  playerPositions: string[] | undefined,
  category: string,
): boolean {
  if (!playerPositions || playerPositions.length === 0) return false;
  return playerPositions.some(
    (pos) => getPositionCategory(pos.trim()) === category,
  );
}

/**
 * Get the primary category for a player's first position.
 * e.g. "CB" → "DEF", "ST" → "FWD"
 */
export function getPrimaryCategory(
  playerPositions: string[] | undefined,
): string {
  if (!playerPositions || playerPositions.length === 0) return "";
  return getPositionCategory(playerPositions[0].trim());
}

/**
 * Calculate the effective overall rating from base stats + upgrade levels.
 * Used by the upgrade system and squad display.
 */
export function calculateEffectiveOverall(
  basePlayer: { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physic: number },
  upgrades: Record<string, number> = {},
): number {
  const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"] as const;
  let total = 0;
  for (const stat of stats) {
    const base = basePlayer[stat] || 0;
    const upg = upgrades[stat] || 0;
    total += base + upg;
  }
  return Math.round(total / stats.length);
}
