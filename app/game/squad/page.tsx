"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Zap, Swords, User, Trophy, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { useSquad, useSaveSquad } from "@/lib/game/hooks/useGameQuery";
import { SkeletonSquadSlots } from "@/app/game/_components";
import { playerMatchesCategory, getPositionCategory, getPrimaryCategory } from "@/lib/game/utils/positionMapping";
import { ErrorState } from "@/app/game/_components";

const POSITIONS = ["GK", "DEF", "MID", "MID", "FWD"] as const;
const FORMATION_NAME = "1-1-2-1";
const FORMATION_LABEL = "Classic";

const POSITION_LABELS: Record<string, string> = {
  GK: "Goalkeeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward",
};
const POSITION_COLORS: Record<string, string> = {
  GK: "#f59e0b", DEF: "#3b82f6", MID: "#10b981", FWD: "#ef4444",
};

export default function SquadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const { data, isLoading, isError, error, refetch } = useSquad();
  const saveSquad = useSaveSquad();

  const ownedPlayers = data?.ownedPlayers || [];
  const existingSquad = data?.squad;

  const [squadSlots, setSquadSlots] = useState<(any | null)[]>([null, null, null, null, null]);
  const [showPicker, setShowPicker] = useState<number | null>(null);

  // Load squad from existing data
  useEffect(() => {
    if (existingSquad?.players) {
      const slots: (any | null)[] = [null, null, null, null, null];
      existingSquad.players.forEach((p: any) => {
        for (let i = 0; i < POSITIONS.length; i++) {
          if (POSITIONS[i] === p.position && slots[i] === null) {
            slots[i] = p.playerId;
            break;
          }
        }
      });
      setSquadSlots(slots);
    }
  }, [existingSquad]);

  // On first load with no squad, auto-assign best-fit players
  useEffect(() => {
    if (!isLoading && !existingSquad?.players?.length && ownedPlayers.length > 0) {
      const slots: (any | null)[] = [null, null, null, null, null];
      const usedPlayerIds = new Set();

      // For each position, find the best available player using position category matching
      POSITIONS.forEach((pos, i) => {
        const candidates = ownedPlayers
          .filter((op: any) => {
            const p = op.playerId;
            return p && playerMatchesCategory(p.positions, pos) && !usedPlayerIds.has(p._id?.toString());
          })
          .sort((a: any, b: any) => (b.playerId?.overall || 0) - (a.playerId?.overall || 0));

        if (candidates.length > 0) {
          const best = candidates[0];
          slots[i] = best.playerId;
          usedPlayerIds.add(best.playerId._id.toString());
        }
      });

      // Fill remaining empty slots with highest OVR unassigned
      const remaining = ownedPlayers
        .filter((op: any) => {
          const p = op.playerId;
          return p && !usedPlayerIds.has(p._id?.toString());
        })
        .sort((a: any, b: any) => (b.playerId?.overall || 0) - (a.playerId?.overall || 0));

      let ri = 0;
      for (let i = 0; i < slots.length && ri < remaining.length; i++) {
        if (!slots[i]) {
          slots[i] = remaining[ri].playerId;
          ri++;
        }
      }

      setSquadSlots(slots);
    }
  }, [isLoading, existingSquad, ownedPlayers]);

  const handleAssignPlayer = (slotIndex: number, playerData: any) => {
    const player = playerData.playerId || playerData;
    setSquadSlots((prev) => {
      const newSlots = [...prev];
      // Remove from other slots if already placed
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i]?._id?.toString() === player._id?.toString()) {
          newSlots[i] = null;
        }
      }
      newSlots[slotIndex] = player;
      return newSlots;
    });
    setShowPicker(null);
  };

  const handleRemovePlayer = (slotIndex: number) => {
    setSquadSlots((prev) => {
      const newSlots = [...prev];
      newSlots[slotIndex] = null;
      return newSlots;
    });
  };

  const handleSave = async () => {
    const emptySlots = squadSlots.filter((s) => !s).length;
    if (emptySlots > 0) {
      toast.error(`Please fill all ${emptySlots} empty position(s)`);
      return;
    }

    try {
      const players = squadSlots.map((player, i) => {
        const owned = ownedPlayers.find(
          (op: any) => op.playerId?._id?.toString() === player._id?.toString(),
        );
        return {
          ownedPlayerId: owned?._id || "",
          playerId: player._id,
          position: POSITIONS[i],
          slot: i,
        };
      });

      await saveSquad.mutateAsync(players);
      toast.success("Squad saved!");
      if (isOnboarding) {
        router.push("/game/home");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save squad");
    }
  };

  const getAvailablePlayers = (slotIndex: number) => {
    return ownedPlayers.filter((op: any) => {
      const p = op.playerId;
      if (!p) return false;
      const inOtherSlot = squadSlots.some(
        (s, i) => i !== slotIndex && s?._id?.toString() === p._id?.toString(),
      );
      return !inOtherSlot;
    });
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-48 bg-white/5 rounded" />
          </div>
          <SkeletonSquadSlots />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load squad"
        message={error?.message || "Could not fetch your squad data"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {isOnboarding ? "Build Your Squad" : "Squad"}
            </h1>
            <p className="text-gray-500 text-sm">
              Assign 5 players to their positions
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium">
                {FORMATION_NAME}
              </span>
              <span className="text-[10px] text-gray-600">{FORMATION_LABEL}</span>
              <span className="text-[10px] text-gray-600">•</span>
              <span className="text-[10px] text-gray-500">
                GK • DEF • MID • MID • FWD
              </span>
            </div>
          </div>
          {!isOnboarding && (
            <button
              onClick={() => router.push("/game/collection")}
              className="text-sm text-[#e09225] hover:underline"
            >
              View Collection
            </button>
          )}
        </div>

        {/* Squad Slots */}
        <div className="space-y-3">
          {squadSlots.map((player, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border overflow-hidden ${
                player ? "border-white/10" : "border-dashed border-white/20"
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Position Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${POSITION_COLORS[POSITIONS[i]]}20` }}
                >
                  <div className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: POSITION_COLORS[POSITIONS[i]] }}
                    >
                      {POSITIONS[i]}
                    </div>
                    <div className="text-[8px] text-gray-500 uppercase">
                      {POSITION_LABELS[POSITIONS[i]].slice(0, 4)}
                    </div>
                  </div>
                </div>

                {/* Player Info or Empty */}
                {player ? (
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden shrink-0">
                      {player.image_url && (
                        <img src={player.image_url} alt={player.short_name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{player.short_name}</p>
                      <p className="text-gray-500 text-xs">{player.long_name}</p>
                    </div>
                    <div className="text-lg font-bold text-white">{player.overall}</div>
                    <button
                      onClick={() => handleRemovePlayer(i)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowPicker(showPicker === i ? null : i)}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="text-gray-500 text-sm">Tap to assign player</p>
                  </div>
                )}

                {/* Change button */}
                {player && (
                  <button
                    onClick={() => setShowPicker(showPicker === i ? null : i)}
                    className="text-xs text-[#e09225] hover:underline shrink-0"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Player Picker */}
              {showPicker === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-white/5 bg-white/2"
                >
                  <div className="p-3 max-h-48 overflow-y-auto space-y-1">
                    {getAvailablePlayers(i).length === 0 && (
                      <p className="text-gray-500 text-xs text-center py-4">
                        No available players. Buy more from the shop!
                      </p>
                    )}
                    {getAvailablePlayers(i).map((op: any) => {
                      const p = op.playerId;
                      if (!p) return null;
                      const primaryPos = p.positions?.[0] || "";
                      return (
                        <button
                          key={op._id}
                          onClick={() => handleAssignPlayer(i, op)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden shrink-0">
                            {p.image_url && <img src={p.image_url} alt={p.short_name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-white text-sm font-medium truncate">{p.short_name}</p>
                            <p className="text-gray-500 text-[10px]">
                              <span className={getPositionCategory(primaryPos) === POSITIONS[i] ? "text-green-400" : "text-amber-400"}>
                                {primaryPos}
                              </span>
                              {' '}• {p.rarity} • {p.overall} OVR
                            </p>
                          </div>
                          {squadSlots[i]?._id?.toString() === p._id?.toString() && (
                            <Check className="w-4 h-4 text-green-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {ownedPlayers.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">You don't own any players yet</p>
            <button
              onClick={() => router.push("/game/shop")}
              className="px-6 py-2 bg-[#e09225] text-[#0a1628] font-bold rounded-xl text-sm"
            >
              Go to Shop
            </button>
          </motion.div>
        )}

        {/* Squad Summary */}
        {squadSlots.filter(Boolean).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Squad Rating</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(
                    squadSlots.filter(Boolean).reduce((sum, p) => sum + (p?.overall || 0), 0) /
                      Math.max(1, squadSlots.filter(Boolean).length),
                  ) || "-"}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saveSquad.isPending || squadSlots.filter(Boolean).length < 5}
                className="px-6 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saveSquad.isPending ? (
                  <div className="w-5 h-5 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isOnboarding ? "Confirm Squad" : "Save Squad"}
                  </>
                )}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {squadSlots.map((p, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    p ? "bg-[#e09225]" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
