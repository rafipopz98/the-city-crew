"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Zap, Swords, User, Check, Save, X, ArrowUpDown, Star } from "lucide-react";
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

  const squadRating =
    squadSlots.filter(Boolean).length > 0
      ? Math.round(
          squadSlots.filter(Boolean).reduce((sum, p) => sum + (p?.overall || 0), 0) /
            squadSlots.filter(Boolean).length,
        )
      : 0;

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
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white">
              {isOnboarding ? "Build Your Squad" : "Squad"}
            </h1>
            <p className="text-gray-500 text-sm">Assign 5 players to their positions</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#e09225]/10 border border-[#e09225]/20 text-[10px] text-[#e09225] font-bold tracking-wider">
                {FORMATION_NAME}
              </span>
              <span className="text-[10px] text-gray-600">{FORMATION_LABEL}</span>
              <span className="text-[10px] text-gray-600">•</span>
              <div className="flex items-center gap-1">
                {POSITIONS.map((pos, i) => (
                  <span key={i} className="text-[10px] font-bold" style={{ color: POSITION_COLORS[pos] }}>
                    {pos}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {!isOnboarding && (
            <button
              onClick={() => router.push("/game/collection")}
              className="shrink-0 text-xs text-[#e09225] hover:text-[#e09225]/80 font-medium transition-colors"
            >
              My Players →
            </button>
          )}
        </div>

        {/* Squad Slots - Detailed List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider font-medium">Player Selection</h2>
            <span className="text-xs text-gray-600">
              {squadSlots.filter(Boolean).length}/5 assigned
            </span>
          </div>
          {squadSlots.map((player, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Slot card */}
              <div className={`rounded-xl border overflow-hidden transition-all
                ${showPicker === i ? "border-[#e09225]/40 ring-1 ring-[#e09225]/20" : player ? "border-white/10 bg-white/[0.03]" : "border-dashed border-white/15 bg-white/[0.01]"}
              `}>
                {/* Main row */}
                <div className="flex items-center gap-3 p-3">
                  {/* Position badge */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${POSITION_COLORS[POSITIONS[i]]}15` }}
                  >
                    <div className="text-center">
                      <div className="text-base font-extrabold leading-none" style={{ color: POSITION_COLORS[POSITIONS[i]] }}>
                        {POSITIONS[i]}
                      </div>
                      <div className="text-[7px] text-gray-500 uppercase leading-tight">
                        {POSITION_LABELS[POSITIONS[i]].slice(0, 4)}
                      </div>
                    </div>
                  </div>

                  {/* Player info or empty state */}
                  {player ? (
                    <div
                      className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => setShowPicker(showPicker === i ? null : i)}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
                        {player.image_url ? (
                          <img src={player.image_url} alt={player.short_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm truncate">{player.short_name}</p>
                          {player.rarity && (
                            <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0"
                              style={{
                                backgroundColor: player.rarity === "Legendary" ? "rgba(251,191,36,0.15)" :
                                  player.rarity === "Epic" ? "rgba(168,85,247,0.15)" :
                                  player.rarity === "Rare" ? "rgba(59,130,246,0.15)" :
                                  player.rarity === "Mythic" ? "rgba(234,179,8,0.15)" :
                                  "rgba(107,114,128,0.15)",
                                color: player.rarity === "Legendary" ? "#fbbf24" :
                                  player.rarity === "Epic" ? "#a855f7" :
                                  player.rarity === "Rare" ? "#3b82f6" :
                                  player.rarity === "Mythic" ? "#eab308" :
                                  "#9ca3af",
                              }}
                            >
                              {player.rarity}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-[11px] truncate">{player.long_name || player.short_name}</p>
                      </div>
                      <div className="text-lg font-extrabold" style={{ color: POSITION_COLORS[POSITIONS[i]] }}>
                        {player.overall}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowPicker(showPicker === i ? null : i)}
                      className="flex-1 flex items-center gap-2 cursor-pointer py-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/10">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Assign a player</p>
                        <p className="text-gray-600 text-[10px]">Tap to select from your collection</p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {player && (
                      <button
                        onClick={() => handleRemovePlayer(i)}
                        className="w-7 h-7 rounded-lg bg-red-500/5 text-red-400/60 hover:bg-red-500/15 hover:text-red-400 flex items-center justify-center transition"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowPicker(showPicker === i ? null : i)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition
                        ${showPicker === i
                          ? "bg-[#e09225]/15 text-[#e09225]"
                          : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                        }`}
                      title="Change"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Player Picker */}
                {showPicker === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-3 max-h-52 overflow-y-auto space-y-1">
                      {getAvailablePlayers(i).length === 0 ? (
                        <div className="text-center py-6">
                          <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-500 text-xs mb-2">
                            No available players
                          </p>
                          <button
                            onClick={() => router.push("/game/shop")}
                            className="text-xs text-[#e09225] font-medium hover:underline"
                          >
                            Buy from shop →
                          </button>
                        </div>
                      ) : (
                        getAvailablePlayers(i).map((op: any) => {
                          const p = op.playerId;
                          if (!p) return null;
                          const primaryPos = p.positions?.[0] || "";
                          const posMatch = getPositionCategory(primaryPos) === POSITIONS[i];
                          const isSelected = squadSlots[i]?._id?.toString() === p._id?.toString();
                          return (
                            <button
                              key={op._id}
                              onClick={() => handleAssignPlayer(i, op)}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition border
                                ${isSelected
                                  ? "bg-[#e09225]/10 border-[#e09225]/20"
                                  : "hover:bg-white/5 border-transparent"
                                }
                              `}
                            >
                              <div className="w-9 h-9 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
                                {p.image_url ? (
                                  <img src={p.image_url} alt={p.short_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-white text-sm font-medium truncate">{p.short_name}</p>
                                  {posMatch && (
                                    <span className="text-[8px] text-green-400 bg-green-500/10 px-1 py-0.5 rounded font-bold uppercase">Best</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span
                                    className="font-bold"
                                    style={{ color: posMatch ? POSITION_COLORS[POSITIONS[i]] : "#f59e0b" }}
                                  >
                                    {primaryPos}
                                  </span>
                                  <span className="text-gray-600">•</span>
                                  <span className="text-gray-500 capitalize">{p.rarity}</span>
                                  <span className="text-gray-600">•</span>
                                  <span className="text-white font-bold">{p.overall}</span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-[#e09225] shrink-0" />
                              )}
                              {!posMatch && !isSelected && (
                                <div className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium shrink-0">
                                  {getPrimaryCategory(primaryPos)}
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {ownedPlayers.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium mb-1">You don&apos;t own any players yet</p>
            <p className="text-gray-600 text-xs mb-4">Buy player packs from the shop to build your squad</p>
            <button
              onClick={() => router.push("/game/shop")}
              className="px-6 py-2.5 bg-[#e09225] text-[#0a1628] font-bold rounded-xl text-sm hover:bg-[#e09225]/90 transition"
            >
              Go to Shop
            </button>
          </motion.div>
        )}

        {/* Squad Summary */}
        {squadSlots.filter(Boolean).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Rating */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-xl bg-[#e09225]/10 border border-[#e09225]/20 flex flex-col items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-[#e09225]" />
                  <p className="text-lg font-extrabold text-[#e09225] leading-none mt-0.5">
                    {squadRating || "-"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Squad Rating</p>
                  <p className="text-sm text-gray-500 truncate">
                    {squadSlots.filter(Boolean).length}/5 players
                    {squadSlots.filter(Boolean).length === 5 && (
                      <span className="text-green-400 ml-2">✓ Ready</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 sm:order-last">
                {squadSlots.map((p, i) => (
                  <div
                    key={i}
                    className={`w-8 sm:w-10 h-1.5 rounded-full transition-all ${
                      p ? "bg-[#e09225]" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saveSquad.isPending || squadSlots.filter(Boolean).length < 5}
                className="w-full sm:w-auto px-6 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
