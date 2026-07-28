/**
 * Player Position & Upgrade Utilities
 *
 * Maps specific football positions (CB, CM, ST, etc.) to the broad
 * squad categories used in TCC: GK, DEF, MID, FWD.
 * Also provides stat calculation helpers.
 *
 * POSITION_CATEGORIES: specific position → broad category (e.g. "CB" → "DEF")
 * POSITION_GROUPS:     broad category → array of specific positions (e.g. "DEF" → ["CB", "LB", "RB", ...])
 */

export const POSITION_CATEGORIES: Record<string, string> = {
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

/** Reverse mapping: broad category → all specific positions that belong to it */
export const POSITION_GROUPS: Record<string, string[]> = {
  GK: ["GK"],
  DEF: ["CB", "LB", "RB", "LWB", "RWB", "SW"],
  MID: ["CDM", "CM", "CAM", "LM", "RM"],
  FWD: ["CF", "ST", "LW", "RW", "LF", "RF"],
};

/** Check if a player's positions indicate they are a goalkeeper */
export function isGK(positions: string[] | undefined | null): boolean {
  if (!positions || positions.length === 0) return false;
  return positions.includes("GK");
}

/**
 * GK-specific stats that map to DB fields.
 * Used to switch display from field-player stats to GK stats when the player is a GK.
 */
export const GK_STATS_CONFIG = [
  { key: "goalkeeping_diving", label: "Diving", short: "DIV", emoji: "🧤" },
  { key: "goalkeeping_handling", label: "Handling", short: "HND", emoji: "🤲" },
  { key: "goalkeeping_kicking", label: "Kicking", short: "KIC", emoji: "🦶" },
  { key: "goalkeeping_positioning", label: "Positioning", short: "POS", emoji: "📍" },
  { key: "goalkeeping_reflexes", label: "Reflexes", short: "REF", emoji: "⚡" },
  { key: "goalkeeping_speed", label: "Speed", short: "SPD", emoji: "🏃" },
] as const;

/** Field player stats (used when player is NOT a GK) */
export const FIELD_STATS_CONFIG = [
  { key: "pace", label: "Pace", short: "PAC", emoji: "🏃" },
  { key: "shooting", label: "Shooting", short: "SHO", emoji: "🎯" },
  { key: "passing", label: "Passing", short: "PAS", emoji: "👟" },
  { key: "dribbling", label: "Dribbling", short: "DRI", emoji: "⚡" },
  { key: "defending", label: "Defending", short: "DEF", emoji: "🛡️" },
  { key: "physic", label: "Physical", short: "PHY", emoji: "💪" },
] as const;

/** Get the appropriate stats config based on whether the player is a GK */
export function getStatsConfig(positions: string[] | undefined | null) {
  return isGK(positions) ? GK_STATS_CONFIG : FIELD_STATS_CONFIG;
}

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
 * Handles both field players (pace, shooting, etc.) and GK (goalkeeping_diving, etc.)
 */
export function calculateEffectiveOverall(
  basePlayer: { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physic: number } & Record<string, number>,
  upgrades: Record<string, number> = {},
  positions?: string[] | null,
): number {
  const isPlayerGK = isGK(positions);
  const statKeys = isPlayerGK
    ? ["goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking", "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed"] as const
    : ["pace", "shooting", "passing", "dribbling", "defending", "physic"] as const;

  let total = 0;
  for (const stat of statKeys) {
    const base = basePlayer[stat] || 0;
    const upg = upgrades[stat] || 0;
    total += base + upg;
  }
  return Math.round(total / statKeys.length);
}
