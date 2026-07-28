"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Swords, User, Check, Save, Star, Zap, Shield, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useSquad, useSaveSquad } from "@/lib/game/hooks/useGameQuery";
import { SkeletonSquadSlots, getRarityTheme } from "@/app/game/_components";
import { playerMatchesCategory, getPrimaryCategory } from "@/lib/game/utils/positionMapping";
import { ErrorState } from "@/app/game/_components";

// ─── Constants ─────────────────────────────────────────────────────────────
const POSITIONS = ["GK", "DEF", "MID", "MID", "FWD"] as const;

const POSITION_META: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  GK: { label: "Goalkeeper", color: "#f59e0b", icon: Shield },
  DEF: { label: "Defender", color: "#3b82f6", icon: Shield },
  MID: { label: "Midfielder", color: "#10b981", icon: Zap },
  FWD: { label: "Forward", color: "#ef4444", icon: Swords },
};

const PITCH_LAYOUT = [
  { pos: "GK", x: 50, y: 16 },
  { pos: "DEF", x: 50, y: 36 },
  { pos: "MID", x: 28, y: 58 },
  { pos: "MID", x: 72, y: 58 },
  { pos: "FWD", x: 50, y: 80 },
];

const PITCH_LINES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4],
];

// ═══════════════════════════════════════════════════════════════════════════
// ─── PITCH VIEW ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function PitchView({
  slots,
  selectedSlot,
  onSlotClick,
  onRemove,
}: {
  slots: (any | null)[];
  selectedSlot: number | null;
  onSlotClick: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="relative w-full aspect-[2/3] sm:aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 select-none">
      {/* Grass gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a0a] via-[#0d3310] to-[#091f09]" />
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)`,
      }} />

      {/* Pitch markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <rect x="3.5" y="3.5" width="93" height="93" rx="1.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <line x1="3.5" y1="50" x2="96.5" y2="50" stroke="rgba(255,255,255,0.07)" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.08)" />
        <rect x="22" y="3.5" width="56" height="18" rx="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
        <rect x="22" y="78.5" width="56" height="18" rx="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
        <rect x="34" y="3.5" width="32" height="7" rx="0.8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
        <rect x="34" y="89.5" width="32" height="7" rx="0.8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
        <rect x="40" y="1" width="20" height="2.5" rx="0.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
        <rect x="40" y="96.5" width="20" height="2.5" rx="0.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {PITCH_LINES.map(([from, to], li) => {
          const fromP = PITCH_LAYOUT[from];
          const toP = PITCH_LAYOUT[to];
          const show = !!slots[from] && !!slots[to];
          return (
            <line
              key={li}
              x1={fromP.x} y1={fromP.y} x2={toP.x} y2={toP.y}
              stroke={show ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)"}
              strokeWidth={show ? 0.6 : 0.3}
              strokeDasharray={show ? "none" : "2,3"}
            />
          );
        })}
      </svg>

      {/* Player positions */}
      {PITCH_LAYOUT.map((pp, i) => {
        const player = slots[i];
        const meta = POSITION_META[pp.pos];
        const isSelected = selectedSlot === i;
        const occupied = !!player;

        return (
          <button
            key={i}
            onClick={() => onSlotClick(i)}
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group"
            style={{ left: `${pp.x}%`, top: `${pp.y}%` }}
          >
            {occupied ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center relative"
              >
                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  className={`absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500/80 border border-black/40 flex items-center justify-center transition-all duration-200 z-10 hover:bg-red-500 ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                  }`}
                  title="Remove"
                >
                  <Trash2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                </button>

                {/* Player circle */}
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-[2.5px] transition-all duration-300 ${
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  }`}
                  style={{
                    borderColor: isSelected ? "#e09225" : meta.color,
                    boxShadow: isSelected
                      ? `0 0 20px ${meta.color}60, 0 0 40px ${meta.color}30`
                      : `0 0 12px ${meta.color}30`,
                  }}
                >
                  {player.image_url ? (
                    <img src={player.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/50">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-black border-[1.5px] border-black"
                    style={{ backgroundColor: meta.color, color: "#000" }}
                  >
                    {player.overall}
                  </div>
                </div>

                <span className="mt-1 text-[9px] sm:text-[10px] font-bold text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-[68px] sm:max-w-[80px] text-center">
                  {player.short_name}
                </span>
              </motion.div>
            ) : (
              <div className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isSelected ? "scale-110" : "opacity-50 group-hover:opacity-80"
              }`}>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-[#e09225] bg-[#e09225]/10" : "border-dashed border-white/20 bg-black/40"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black" style={{ color: isSelected ? "#e09225" : meta.color }}>
                    {pp.pos}
                  </span>
                </div>
                <span className="text-[7px] sm:text-[8px] text-white/30 font-medium">{meta.label}</span>
              </div>
            )}
          </button>
        );
      })}

      {/* Formation label */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/50 border border-white/5 text-[8px] text-white/30 font-bold tracking-widest backdrop-blur-sm">
        1-1-2-1
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── BENCH PLAYER CARD ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function BenchPlayerCard({
  player,
  onClick,
  disabled,
}: {
  player: any;
  onClick: () => void;
  disabled: boolean;
}) {
  const p = player.playerId || player;
  if (!p) return null;
  const primaryPos = p.positions?.[0] || "";
  const posMeta = POSITION_META[getPrimaryCategory(p.positions)];
  const theme = getRarityTheme(p.rarity);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`flex items-center gap-2 p-2 rounded-xl border transition-all shrink-0 ${
        disabled
          ? "bg-[#0a1628]/50 border-white/5 opacity-40 cursor-default"
          : "bg-[#0a1628] border-white/10 hover:border-white/20 hover:bg-[#0d1d30] cursor-pointer active:scale-[0.98]"
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/10">
          {p.image_url ? (
            <img src={p.image_url} alt={p.short_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/40">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-black border border-black"
          style={{ backgroundColor: posMeta?.color || "#9ca3af", color: "#000" }}
        >
          {primaryPos.slice(0, 2)}
        </div>
      </div>
      <div className="text-left min-w-0 max-w-[80px] sm:max-w-[100px]">
        <p className="text-[11px] font-semibold text-white truncate">{p.short_name}</p>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-extrabold" style={{ color: posMeta?.color || "#9ca3af" }}>
            {p.overall}
          </span>
          <span className="text-[7px] text-gray-500 uppercase">· {p.rarity}</span>
        </div>
        <div className="flex gap-1.5 mt-0.5">
          {["PAC", "SHO", "PAS"].map((stat) => (
            <span key={stat} className="text-[6px] text-gray-600 bg-white/[0.04] px-1 py-0.5 rounded font-bold">
              {stat}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── BENCH SECTION ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function BenchSection({
  players,
  assignedIds,
  selectedSlot,
  onAssign,
}: {
  players: any[];
  assignedIds: Set<string>;
  selectedSlot: number | null;
  onAssign: (player: any) => void;
}) {
  const router = useRouter();
  const targetPos = selectedSlot !== null ? POSITIONS[selectedSlot] : null;
  const hasSelection = selectedSlot !== null;

  const sorted = useMemo(() => {
    return [...players]
      .filter((op) => {
        const p = op.playerId;
        return p && !assignedIds.has(p._id?.toString());
      })
      .sort((a, b) => {
        const aP = a.playerId;
        const bP = b.playerId;
        if (!aP || !bP) return 0;
        if (!targetPos) return (bP.overall || 0) - (aP.overall || 0);
        const aMatch = playerMatchesCategory(aP.positions, targetPos);
        const bMatch = playerMatchesCategory(bP.positions, targetPos);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return (bP.overall || 0) - (aP.overall || 0);
      });
  }, [players, assignedIds, targetPos]);

  if (players.length === 0) {
    return (
      <div className="text-center py-6">
        <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-500 text-xs mb-2">No players available</p>
        <button
          onClick={() => router.push("/game/shop")}
          className="text-xs text-[#e09225] font-medium hover:underline"
        >
          Buy from shop →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium flex items-center gap-2">
          <User className="w-3.5 h-3.5" />
          Bench
          <span className="text-[9px] text-gray-600 normal-case font-normal">({sorted.length} available)</span>
        </h3>
        {hasSelection && targetPos && (
          <span className="text-[10px] text-[#e09225] font-medium">
            Selecting for {POSITION_META[targetPos].label}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center gap-2 text-gray-600 text-sm py-4">
          <Check className="w-4 h-4 text-green-500" />
          All players are assigned
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          {sorted.map((op: any) => {
            const p = op.playerId;
            if (!p) return null;
            return (
              <BenchPlayerCard
                key={op._id}
                player={p}
                onClick={() => onAssign(p)}
                disabled={!hasSelection}
              />
            );
          })}
        </div>
      )}

      {/* Hint: select a position first */}
      {!hasSelection && (
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e09225] animate-pulse" />
          Tap a position on the pitch above, then tap a player here
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SQUAD STATS BAR ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function SquadStatsBar({
  slots,
  filledCount,
  squadRating,
  onSave,
  isPending,
  isOnboarding,
}: {
  slots: (any | null)[];
  filledCount: number;
  squadRating: number;
  onSave: () => void;
  isPending: boolean;
  isOnboarding: boolean;
}) {
  const allFilled = filledCount === 5;

  return (
    <div className="bg-[#0a1628] rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          {/* Rating */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e09225]/20 to-[#e09225]/5 border border-[#e09225]/20 flex flex-col items-center justify-center">
              <Star className="w-3.5 h-3.5 text-[#e09225]" />
              <span className="text-base font-extrabold text-[#e09225] leading-none -mt-0.5">
                {squadRating || "—"}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg. Rating</p>
              <p className="text-xs text-gray-600">{filledCount}/5 filled</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-1">
              {slots.map((p, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                      p ? "bg-gradient-to-r from-[#e09225] to-[#e09225]/70" : "bg-white/5"
                    }`}
                  />
                  <span
                    className="text-[7px] font-bold"
                    style={{ color: p ? POSITION_META[POSITIONS[i]].color : "rgba(255,255,255,0.1)" }}
                  >
                    {POSITIONS[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={onSave}
            disabled={isPending || !allFilled}
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-[#e09225] to-[#d4821a] text-[#0a1628] font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>{isOnboarding ? "Confirm" : "Save"}</>
            )}
          </button>
        </div>

        {!allFilled && (
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <Plus className="w-3 h-3" />
            Fill all 5 positions to save your squad
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export default function SquadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const { data, isLoading, isError, error, refetch } = useSquad();
  const saveSquad = useSaveSquad();

  const ownedPlayers = data?.ownedPlayers || [];
  const existingSquad = data?.squad;

  const [squadSlots, setSquadSlots] = useState<(any | null)[]>([null, null, null, null, null]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Load existing squad
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

  // Auto-assign on first load
  useEffect(() => {
    if (!isLoading && !existingSquad?.players?.length && ownedPlayers.length > 0) {
      const slots: (any | null)[] = [null, null, null, null, null];
      const used = new Set<string>();

      POSITIONS.forEach((pos, i) => {
        const candidates = ownedPlayers
          .filter((op: any) => {
            const p = op.playerId;
            return p && playerMatchesCategory(p.positions, pos) && !used.has(p._id?.toString());
          })
          .sort((a: any, b: any) => (b.playerId?.overall || 0) - (a.playerId?.overall || 0));
        if (candidates.length > 0) {
          const best = candidates[0];
          slots[i] = best.playerId;
          used.add(best.playerId._id.toString());
        }
      });

      const remaining = ownedPlayers
        .filter((op: any) => {
          const p = op.playerId;
          return p && !used.has(p._id?.toString());
        })
        .sort((a: any, b: any) => (b.playerId?.overall || 0) - (a.playerId?.overall || 0));

      for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue;
        const pos = POSITIONS[i];
        const match = remaining.findIndex((op: any) => op.playerId && playerMatchesCategory(op.playerId.positions, pos));
        if (match !== -1) {
          slots[i] = remaining[match].playerId;
          used.add(remaining[match].playerId._id.toString());
          remaining.splice(match, 1);
        }
      }
      setSquadSlots(slots);
    }
  }, [isLoading, existingSquad, ownedPlayers]);

  const handleSlotClick = useCallback((i: number) => {
    setSelectedSlot((prev) => (prev === i ? null : i));
  }, []);

  const handleRemoveFromSlot = useCallback((i: number) => {
    setSquadSlots((prev) => {
      const newSlots = [...prev];
      newSlots[i] = null;
      return newSlots;
    });
    setSelectedSlot(null);
  }, []);

  const handleAssignFromBench = useCallback((playerData: any) => {
    if (selectedSlot === null) return;
    setSquadSlots((prev) => {
      const newSlots = [...prev];
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i]?._id?.toString() === playerData._id?.toString()) {
          newSlots[i] = null;
        }
      }
      newSlots[selectedSlot] = playerData;
      return newSlots;
    });
    setSelectedSlot(null);
  }, [selectedSlot]);

  const handleSave = useCallback(async () => {
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
      if (isOnboarding) router.push("/game/home");
    } catch (err: any) {
      toast.error(err.message || "Failed to save squad");
    }
  }, [squadSlots, ownedPlayers, saveSquad, isOnboarding, router]);

  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    squadSlots.forEach((p) => {
      if (p?._id) ids.add(p._id.toString());
    });
    return ids;
  }, [squadSlots]);

  const filledCount = squadSlots.filter(Boolean).length;
  const squadRating = filledCount > 0
    ? Math.round(squadSlots.filter(Boolean).reduce((sum, p) => sum + (p?.overall || 0), 0) / filledCount)
    : 0;

  // ── Loading ──
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

  // ── Error ──
  if (isError) {
    return (
      <ErrorState title="Failed to load squad" message={error?.message || "Could not fetch your squad data"} onRetry={() => refetch()} />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-20">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#e09225]" />
              {isOnboarding ? "Build Your Squad" : "Squad"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {filledCount}/5 players assigned
            </p>
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

        {/* ── Pitch ── */}
        <PitchView
          slots={squadSlots}
          selectedSlot={selectedSlot}
          onSlotClick={handleSlotClick}
          onRemove={handleRemoveFromSlot}
        />

        {/* ── Bench ── */}
        <BenchSection
          players={ownedPlayers}
          assignedIds={assignedIds}
          selectedSlot={selectedSlot}
          onAssign={handleAssignFromBench}
        />

        {/* ── Squad Stats + Save ── */}
        <SquadStatsBar
          slots={squadSlots}
          filledCount={filledCount}
          squadRating={squadRating}
          onSave={handleSave}
          isPending={saveSquad.isPending}
          isOnboarding={isOnboarding}
        />

        {/* ── Empty state ── */}
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
            <p className="text-gray-600 text-xs mb-4">Buy players from the shop to build your squad</p>
            <button
              onClick={() => router.push("/game/shop")}
              className="px-6 py-2.5 bg-[#e09225] text-[#0a1628] font-bold rounded-xl text-sm hover:bg-[#e09225]/90 transition"
            >
              Go to Shop
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
