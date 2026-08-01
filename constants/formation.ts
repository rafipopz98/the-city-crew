// Shared formation utilities used by BuildXI, admin match editing, and the
// match-hub lineup pitch.

export const FORMATION_LIST = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "4-1-4-1",
  "4-3-2-1",
  "4-1-2-1-2",
  "3-4-3",
  "3-5-2",
  "3-2-4-1",
  "5-3-2",
  "5-4-1",
  "4-5-1",
  "4-4-1-1",
  "4-2-2-2",
  "4-2-4",
  "3-4-2-1",
  "3-4-1-2",
  "4-3-1-2",
  "5-2-3",
  "5-2-2-1",
  "4-2-1-3",
  "4-1-2-3",
  "3-1-4-2",
  "4-1-3-2",
  "4-1-2-2-1",
  "3-3-4",
  "3-3-3-1",
  "5-3-1-1",
  "3-3-2-2",
  "3-5-1-1",
  "2-3-2-3",
  "Free form",
];

// Formations that work for slot-based lineups (excludes "Free form")
export const SLOT_FORMATIONS = FORMATION_LIST.filter((f) => f !== "Free form");

// Generates 11 slot coordinates (percent-based) for a formation.
// Index 0 is the GK, then each formation row top → bottom.
export const generateCoords = (formation: string): [number, number][] => {
  if (formation === "Free form") return [];
  const parts = formation.split("-").map(Number);
  const coords: [number, number][] = [];
  coords.push([50, 88]); // GK
  const rowCount = parts.length;
  parts.forEach((count, i) => {
    const y = 72 - (i / (rowCount - 1)) * 60;
    for (let j = 0; j < count; j++) {
      coords.push([(100 / (count + 1)) * (j + 1), y]);
    }
  });
  return coords;
};

// Row label per slot index for a formation (GK, DEF, MID, FWD…)
export const formationSlotLabels = (formation: string): string[] => {
  if (formation === "Free form") return [];
  const parts = formation.split("-").map(Number);
  const labels: string[] = ["GK"];
  parts.forEach((count, i) => {
    const label =
      i === 0 ? "DEF" : i === parts.length - 1 ? "FWD" : "MID";
    for (let j = 0; j < count; j++) labels.push(label);
  });
  return labels;
};
