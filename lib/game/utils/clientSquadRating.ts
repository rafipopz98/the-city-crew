/**
 * The one correct way to compute a squad's overall rating on the client —
 * upgrades folded in via calculateEffectiveOverall, then the engine's own
 * calculateSquadRating applies position-effectiveness once. Several pages
 * had their own ad-hoc flat-average-of-raw-overalls calculation (no
 * upgrades, no position penalty) that disagreed with this, which is why
 * the same two players' ratings could look different depending on which
 * screen you were looking at them from.
 */

import { calculateSquadRating } from "@/lib/game/engine/matchEngine";
import { calculateEffectiveOverall } from "@/lib/game/utils/positionMapping";

export function computeClientSquadRating(
  squad: { players?: { playerId: any; position: string }[] } | null | undefined,
  ownedPlayers: any[],
): number {
  if (!squad?.players?.length) return 0;

  const getUpgrades = (playerId?: string) => {
    const owned = ownedPlayers.find((op: any) => op.playerId?._id?.toString() === playerId);
    return owned?.upgrades || {};
  };

  const matchPlayers = squad.players
    .filter((sp) => sp.playerId)
    .map((sp) => {
      const p = sp.playerId;
      const upgrades = getUpgrades(p._id?.toString());
      return {
        ...p,
        position: sp.position,
        overall: calculateEffectiveOverall(p, upgrades, p.positions),
      };
    });

  if (matchPlayers.length === 0) return 0;
  return calculateSquadRating({ players: matchPlayers as any }).overall;
}
