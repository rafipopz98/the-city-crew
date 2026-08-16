/**
 * Loads a user's real squad and converts it into MatchPlayer[] for the
 * match engine — base card stats + purchased upgrades folded in via
 * calculateEffectiveOverall, real specific positions passed through so the
 * engine's out-of-position penalty works off real data instead of guesses.
 *
 * Shared by bot matches (app/api/game/match/start + /continue) and PvP
 * (lib/game/socket/handler.ts) so all match execution runs through the
 * exact same authoritative pipeline — server-loaded by userId, never
 * trusting client-supplied stats/positions/ratings for match outcomes.
 */

import { connectDB } from "@/lib/db/mongoose";
import { GameSquadModel } from "@/lib/game/models/GameSquad";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { calculateEffectiveOverall } from "@/lib/game/utils/positionMapping";
import type { MatchPlayer } from "@/lib/game/engine/matchEngine";

type SlotPosition = "GK" | "DEF" | "MID" | "FWD";

function toMatchPlayer(basePlayer: any, upgrades: Record<string, number>, position: SlotPosition): MatchPlayer {
  const p = basePlayer;
  const applyUpgrade = (base: number, key: string) =>
    Math.min(99, (base || 0) + (upgrades[key] || 0));

  return {
    _id: p._id.toString(),
    player_id: p.player_id,
    short_name: p.short_name,
    overall: calculateEffectiveOverall(p, upgrades, p.positions),
    pace: applyUpgrade(p.pace, "pace"),
    shooting: applyUpgrade(p.shooting, "shooting"),
    passing: applyUpgrade(p.passing, "passing"),
    dribbling: applyUpgrade(p.dribbling, "dribbling"),
    defending: applyUpgrade(p.defending, "defending"),
    physic: applyUpgrade(p.physic, "physic"),
    position,
    positions: p.positions,
    attacking_finishing: p.attacking_finishing,
    mentality_positioning: p.mentality_positioning,
    mentality_vision: p.mentality_vision,
    goalkeeping_diving: p.goalkeeping_diving,
    goalkeeping_reflexes: p.goalkeeping_reflexes,
    goalkeeping_positioning: p.goalkeeping_positioning,
    movement_sprint_speed: p.movement_sprint_speed,
    power_shot_power: p.power_shot_power,
    power_stamina: p.power_stamina,
    movement_reactions: p.movement_reactions,
  };
}

/** Loads a user's currently-active saved squad. */
export async function loadSquadMatchPlayers(userId: string): Promise<MatchPlayer[] | null> {
  await connectDB();

  const squad = await GameSquadModel.findOne({ userId, is_active: true })
    .populate("players.playerId")
    .populate("players.ownedPlayerId");

  if (!squad || squad.players.length !== 5) return null;

  return squad.players.map((sp: any) =>
    toMatchPlayer(sp.playerId, sp.ownedPlayerId?.upgrades || {}, sp.position),
  );
}

/**
 * Builds MatchPlayer[] from an ad-hoc selection of owned players — used for
 * halftime substitutions/formation changes, which may differ from the
 * user's saved active squad. Every ownedPlayerId is verified to actually
 * belong to userId (never trust a client-submitted playerId/stats
 * directly), and duplicates are rejected.
 */
export async function buildMatchPlayersFromSelection(
  userId: string,
  selection: { ownedPlayerId: string; position: SlotPosition }[],
): Promise<MatchPlayer[] | null> {
  if (selection.length !== 5) return null;

  const ids = selection.map((s) => s.ownedPlayerId);
  if (new Set(ids).size !== ids.length) return null; // duplicate player in two slots

  await connectDB();

  const owned = await GameOwnedPlayerModel.find({
    _id: { $in: ids },
    userId,
  }).populate("playerId");

  if (owned.length !== 5) return null; // some id didn't belong to this user

  const ownedById = new Map(owned.map((op: any) => [op._id.toString(), op]));

  const players: MatchPlayer[] = [];
  for (const s of selection) {
    const op = ownedById.get(s.ownedPlayerId);
    if (!op || !(op as any).playerId) return null;
    players.push(toMatchPlayer((op as any).playerId, (op as any).upgrades || {}, s.position));
  }
  return players;
}
