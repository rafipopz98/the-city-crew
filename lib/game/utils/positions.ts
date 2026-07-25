/**
 * Game position utilities for TCC Manager
 */

export type GamePosition = "GK" | "DEF" | "MID" | "FWD";

export const GAME_POSITIONS: GamePosition[] = ["GK", "DEF", "MID", "FWD"];

export const POSITION_LABELS: Record<GamePosition, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

export const POSITION_COLORS: Record<GamePosition, string> = {
  GK: "#f59e0b", // amber
  DEF: "#3b82f6", // blue
  MID: "#10b981", // emerald
  FWD: "#ef4444", // red
};

export const POSITION_SHORT: Record<GamePosition, string> = {
  GK: "GK",
  DEF: "DEF",
  MID: "MID",
  FWD: "FWD",
};

/**
 * Squad slot configuration:
 * 5 players: 1 GK, 1 DEF, 2 MID, 1 FWD
 */
export const SQUAD_FORMATIONS = [
  {
    name: "1-1-2-1",
    label: "Classic",
    slots: ["GK", "DEF", "MID", "MID", "FWD"] as GamePosition[],
  },
  {
    name: "1-2-1-1",
    label: "Defensive",
    slots: ["GK", "DEF", "DEF", "MID", "FWD"] as GamePosition[],
  },
  {
    name: "1-1-3-0",
    label: "Midfield Heavy",
    slots: ["GK", "DEF", "MID", "MID", "MID"] as GamePosition[],
  },
  {
    name: "1-0-2-2",
    label: "Attacking",
    slots: ["GK", "MID", "MID", "FWD", "FWD"] as GamePosition[],
  },
];

export const DEFAULT_FORMATION = SQUAD_FORMATIONS[0];

export function getDefaultSlots(): GamePosition[] {
  return [...DEFAULT_FORMATION.slots];
}

export function formatOverall(overall: number): string {
  return overall.toString();
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    Basic: "#9ca3af",
    Common: "#6b7280",
    Uncommon: "#22c55e",
    Rare: "#06b6d4",
    Epic: "#a855f7",
    Legendary: "#f59e0b",
  };
  return colors[rarity] || "#9ca3af";
}

export function getRarityBadgeClass(rarity: string): string {
  const classes: Record<string, string> = {
    Basic: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    Common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    Uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
    Rare: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return classes[rarity] || classes.Basic;
}
