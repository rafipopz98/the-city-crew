"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, User, Star, Zap, Shield, Users, Check, ArrowLeft,
  X, Search,
} from "lucide-react";
import { toast } from "sonner";
import { useSquad, useSaveSquad } from "@/lib/game/hooks/useGameQuery";
import { SkeletonSquadSlots } from "@/app/game/_components";
import { playerMatchesCategory, getPrimaryCategory } from "@/lib/game/utils/positionMapping";
import { ErrorState } from "@/app/game/_components";

// ─── Constants ─────────────────────────────────────────────────────────────
const POSITIONS = ["GK", "DEF", "MID", "MID", "FWD"] as const;

const POSITION_META: Record<string, { label: string; color: string; short: string }> = {
  GK:  { label: "Goalkeeper", color: "#f59e0b", short: "GK" },
  DEF: { label: "Defender",   color: "#3b82f6", short: "DEF" },
  MID: { label: "Midfielder", color: "#10b981", short: "MID" },
  FWD: { label: "Forward",    color: "#ef4444", short: "FWD" },
};

const GOLD = "#e09225";
const NAVY = "#06182e";

const PITCH_LAYOUT = [
  { pos: "GK",  x: 50, y: 14 },
  { pos: "DEF", x: 50, y: 34 },
  { pos: "MID", x: 28, y: 56 },
  { pos: "MID", x: 72, y: 56 },
  { pos: "FWD", x: 50, y: 78 },
];

// ═══════════════════════════════════════════════════════════════════════════
// ─── PITCH SVG ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function SquadPitchSvg() {
  return (
    <svg viewBox="0 0 750 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <radialGradient id="squadPitchBg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#0b2242" />
          <stop offset="100%" stopColor={NAVY} />
        </radialGradient>
      </defs>

      <rect width="750" height="1000" fill="url(#squadPitchBg)" />

      {/* Boundary */}
      <rect x="24" y="24" width="702" height="952" rx="3" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.5} />

      {/* Halfway */}
      <line x1="24" y1="500" x2="726" y2="500" stroke={GOLD} strokeWidth="3" opacity={0.5} />

      {/* Center circle */}
      <circle cx="375" cy="500" r="90" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <circle cx="375" cy="500" r="5" fill={GOLD} opacity={0.5} />

      {/* Penalty areas */}
      <rect x="187" y="24" width="376" height="200" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <rect x="290" y="24" width="170" height="80" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <circle cx="375" cy="150" r="5" fill={GOLD} opacity={0.5} />
      <path d="M290 224 A85 85 0 0 0 460 224" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />

      <rect x="187" y="776" width="376" height="200" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <rect x="290" y="896" width="170" height="80" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <circle cx="375" cy="850" r="5" fill={GOLD} opacity={0.5} />
      <path d="M290 776 A85 85 0 0 1 460 776" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />

      {/* Goals */}
      <rect x="325" y="4" width="100" height="20" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.5} />
      <rect x="325" y="976" width="100" height="20" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.5} />

      {/* Corner arcs */}
      <path d="M24 58 A34 34 0 0 1 58 24" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <path d="M692 24 A34 34 0 0 1 726 58" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <path d="M24 942 A34 34 0 0 0 58 976" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />
      <path d="M692 976 A34 34 0 0 0 726 942" fill="none" stroke={GOLD} strokeWidth="3" opacity={0.4} />

      {/* TCC Logo watermark */}
      <image
        href="/logo.svg"
        x="580" y="830" width="150" height="150"
        opacity="0.25"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── PLAYER STAT TOOLTIP ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
type StatKey = "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physic";

const STAT_LABELS: Record<StatKey, string> = {
  pace: "PAC",
  shooting: "SHO",
  passing: "PAS",
  dribbling: "DRI",
  defending: "DEF",
  physic: "PHY",
};

const STAT_ORDER: StatKey[] = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];

function PlayerTooltip({ player, position }: { player: any; position: string }) {
  const meta = POSITION_META[position] || POSITION_META.MID;
  const hasStats = STAT_ORDER.some((k) => player[k] != null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
    >
      <div className="bg-[#0a1628]/98 backdrop-blur-lg border border-[#e09225]/25 rounded-xl p-2.5 shadow-2xl shadow-black/60 min-w-[120px]">
        {/* Player name + rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-white/5">
          <span className="text-[9px] font-bold text-white/90 truncate max-w-[70px]">{player.short_name}</span>
          <span
            className="shrink-0 text-[8px] font-black px-1.5 py-[1px] rounded-full"
            style={{ backgroundColor: meta.color, color: "#000" }}
          >
            {player.overall}
          </span>
        </div>

        {hasStats ? (
          <div className="space-y-1">
            {STAT_ORDER.map((key) => {
              const val = player[key];
              if (val == null) return null;
              const pct = Math.min(val, 99);
              const barColor =
                pct >= 85 ? "#22c55e" :
                pct >= 70 ? "#eab308" :
                pct >= 50 ? "#f97316" :
                "#ef4444";
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-[7px] font-bold text-white/30 w-[22px] text-right shrink-0">{STAT_LABELS[key]}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                  <span className="text-[7px] font-bold text-white/40 w-[16px] shrink-0 text-right">{val}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[8px] text-white/20 italic">No stats available</div>
        )}
      </div>
      {/* Arrow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0a1628] border-r border-b border-[#e09225]/25" />
    </motion.div>
  );
}

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
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-[#e09225]/20 select-none shadow-2xl">
      <SquadPitchSvg />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {[
          [0, 1], [1, 2], [1, 3], [2, 4], [3, 4],
        ].map(([from, to], li) => {
          const fp = PITCH_LAYOUT[from];
          const tp = PITCH_LAYOUT[to];
          const show = !!slots[from] && !!slots[to];
          return (
            <line
              key={li}
              x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
              stroke={show ? GOLD : "rgba(224,146,37,0.12)"}
              strokeWidth={show ? 0.5 : 0.25}
              strokeDasharray={show ? "none" : "2,3"}
              opacity={show ? 0.6 : 1}
            />
          );
        })}
      </svg>

      {/* Players & slots */}
      {PITCH_LAYOUT.map((pp, i) => {
        const player = slots[i];
        const meta = POSITION_META[pp.pos];
        const isSelected = selectedSlot === i;
        const isHovered = hoveredSlot === i;
        const occupied = !!player;

        return (
          <button
            key={i}
            onClick={() => onSlotClick(i)}
            onMouseEnter={() => occupied && setHoveredSlot(i)}
            onMouseLeave={() => setHoveredSlot(null)}
            className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group"
            style={{ left: `${pp.x}%`, top: `${pp.y}%` }}
          >
            {occupied ? (
              <motion.div
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center relative"
              >
                {/* Remove button */}
                <div
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onRemove(i); } }}
                  role="button"
                  tabIndex={0}
                  aria-label="Remove player"
                  className={`absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full bg-red-500/90 border-2 border-[#06182e] flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:scale-110 cursor-pointer ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                  }`}
                >
                  <X className="w-3 h-3 text-white" />
                </div>

                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHovered && !isSelected && (
                    <PlayerTooltip player={player} position={pp.pos} />
                  )}
                </AnimatePresence>

                {/* Rating badge — top of circle */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 px-1.5 py-[1px] rounded-full text-[9px] font-black leading-tight border border-black/30 shadow-lg"
                  style={{ backgroundColor: meta.color, color: "#000" }}
                >
                  {player.overall}
                </div>

                {/* Player image circle */}
                <div
                  className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-[2.5px] transition-all duration-300 ${
                    isSelected ? "scale-110 ring-2 ring-[#e09225]/50" : "group-hover:scale-105"
                  }`}
                  style={{
                    borderColor: isSelected ? GOLD : meta.color,
                    boxShadow: isSelected
                      ? `0 0 20px ${meta.color}60`
                      : `0 0 10px ${meta.color}25`,
                  }}
                >
                  {player.image_url ? (
                    <img src={player.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0a1628]/70">
                      <User className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                </div>

                {/* Name below */}
                <span className="mt-1.5 text-[9px] sm:text-[10px] font-bold text-white/90 leading-none truncate max-w-[72px] sm:max-w-[85px] text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  {player.short_name}
                </span>
              </motion.div>
            ) : (
              <motion.div layout className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isSelected ? "scale-110" : "opacity-55 group-hover:opacity-90"
              }`}>
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-[#e09225] bg-[#e09225]/10"
                      : "border-dashed border-[#e09225]/35 bg-black/40"
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-black" style={{ color: isSelected ? GOLD : meta.color }}>
                    {pp.pos}
                  </span>
                </div>
                <span className="text-[7px] sm:text-[8px] text-[#e09225]/40 font-medium tracking-wide">{meta.label}</span>
              </motion.div>
            )}
          </button>
        );
      })}

      {/* Formation label */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-[#e09225]/15 text-[8px] text-[#e09225]/50 font-bold tracking-widest backdrop-blur-sm">
        1-1-2-1
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── BENCH PLAYER CARD ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function BenchPlayerCard({
  player,
  onClick,
  disabled,
  isSelected,
  showTooltip = false,
}: {
  player: any;
  onClick: () => void;
  disabled: boolean;
  isSelected?: boolean;
  showTooltip?: boolean;
}) {
  const p = player.playerId || player;
  if (!p) return null;

  const posCat = getPrimaryCategory(p.positions);
  const posMeta = POSITION_META[posCat] || POSITION_META.MID;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
        disabled
          ? "opacity-30 cursor-default border-white/5"
          : isSelected
            ? "border-[#e09225] bg-[#e09225]/10 cursor-pointer shadow-lg shadow-[#e09225]/10"
            : "border-[#e09225]/15 bg-[#0a1628]/80 hover:border-[#e09225]/40 hover:bg-[#0d1d30] cursor-pointer active:scale-[0.96]"
      }`}
    >
      {/* Player image */}
      <div className="relative">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2"
          style={{ borderColor: posMeta.color }}
        >
          {p.image_url ? (
            <img src={p.image_url} alt={p.short_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/50">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
        {/* Rating on top */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full text-[8px] font-black border border-black/30 leading-tight"
          style={{ backgroundColor: posMeta.color, color: "#000" }}
        >
          {p.overall}
        </div>
        {/* Position badge bottom-right */}
        <div
          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[6px] font-black border-[1.5px] border-[#0a1628]"
          style={{ backgroundColor: posMeta.color, color: "#000" }}
        >
          {posCat.slice(0, 2)}
        </div>
      </div>

      {/* Hover tooltip - shows above card */}
      <AnimatePresence>
        {hovered && !disabled && showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50">
            <PlayerTooltip player={p} position={posCat} />
          </div>
        )}
      </AnimatePresence>

      {/* Name below */}
      <p className="text-[10px] font-semibold text-white/90 truncate max-w-[64px] sm:max-w-[72px] text-center leading-tight">
        {p.short_name}
      </p>

      {/* Rarity indicator */}
      <span className="text-[6px] text-[#e09225]/40 uppercase font-bold tracking-wider">
        {p.rarity || "common"}
      </span>

      {/* Selected check overlay */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-2 border-[#e09225]/60 pointer-events-none" />
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── BENCH SECTION ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function BenchSection({
  players,
  assignedIds,
  selectedSlot,
  onAssign,
  onAutoFill,
}: {
  players: any[];
  assignedIds: Set<string>;
  selectedSlot: number | null;
  onAssign: (player: any) => void;
  onAutoFill: () => void;
}) {
  const router = useRouter();
  const targetPos = selectedSlot !== null ? POSITIONS[selectedSlot] : null;
  const hasSelection = selectedSlot !== null;
  const [filterPos, setFilterPos] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sorted = useMemo(() => {
    let list = [...players]
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

    // Apply position filter
    if (filterPos) {
      list = list.filter((op) => {
        const p = op.playerId;
        return p && getPrimaryCategory(p.positions) === filterPos;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((op) => {
        const p = op.playerId;
        return p && p.short_name?.toLowerCase().includes(q);
      });
    }

    return list;
  }, [players, assignedIds, targetPos, filterPos, searchQuery]);

  const usedCount = assignedIds.size;
  const emptyCount = 5 - usedCount;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#e09225]" />
            Available
            <span className="text-[9px] text-white/30 font-normal normal-case">({sorted.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            {emptyCount > 0 && sorted.length > 0 && (
              <button
                onClick={onAutoFill}
                className="text-[8px] text-[#e09225]/60 hover:text-[#e09225] font-bold bg-[#e09225]/5 hover:bg-[#e09225]/10 px-2 py-1 rounded-full border border-[#e09225]/10 hover:border-[#e09225]/30 transition-all flex items-center gap-1"
              >
                <Zap className="w-2.5 h-2.5" />
                Auto-fill
              </button>
            )}
            {hasSelection && targetPos && (
              <span className="text-[9px] text-[#e09225] font-medium bg-[#e09225]/10 px-2 py-0.5 rounded-full">
                Select {POSITION_META[targetPos].label}
              </span>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full h-7 pl-7 pr-2 text-[10px] bg-white/5 border border-white/10 rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#e09225]/40 focus:bg-white/[0.06] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Position filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          <button
            onClick={() => setFilterPos(null)}
            className={`shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${
              !filterPos
                ? "bg-[#e09225] text-[#06182e] border-[#e09225]"
                : "bg-transparent text-white/40 border-white/10 hover:border-white/20"
            }`}
          >
            All
          </button>
          {(["GK", "DEF", "MID", "FWD"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPos(pos)}
              className={`shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                filterPos === pos
                  ? "border-transparent text-white font-bold"
                  : "bg-transparent text-white/40 border-white/10 hover:border-white/20"
              }`}
              style={filterPos === pos ? { backgroundColor: POSITION_META[pos].color, color: "#000" } : {}}
            >
              {POSITION_META[pos].short}
            </button>
          ))}
        </div>
      </div>

      {/* Player grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-[#e09225]/10 scrollbar-track-transparent pr-1">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="w-8 h-8 text-white/10 mb-2" />
            <p className="text-white/30 text-xs mb-3">No players available</p>
            <button
              onClick={() => router.push("/game/shop")}
              className="text-xs text-[#e09225] font-medium bg-[#e09225]/10 px-4 py-2 rounded-full hover:bg-[#e09225]/20 transition"
            >
              Buy from shop →
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Check className="w-8 h-8 text-green-500/30 mb-2" />
            <p className="text-white/40 text-xs">
              {searchQuery ? "No players match your search" : "All players assigned"}
            </p>
            {filterPos && (
              <button onClick={() => setFilterPos(null)} className="text-[10px] text-[#e09225] mt-2 hover:underline">
                Clear filter
              </button>
            )}
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[10px] text-[#e09225] mt-1 hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-2">
            <AnimatePresence mode="popLayout">
              {sorted.map((op: any) => {
                const p = op.playerId;
                if (!p) return null;
                const isAssigned = assignedIds.has(p._id?.toString());
                return (
                  <BenchPlayerCard
                    key={p._id?.toString() || op._id}
                    player={p}
                    onClick={() => !isAssigned && onAssign(p)}
                    disabled={isAssigned}
                    isSelected={selectedSlot !== null && playerMatchesCategory(p.positions, POSITIONS[selectedSlot])}
                    showTooltip={!isAssigned}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Hint */}
      {!hasSelection && players.length > 0 && (
        <div className="shrink-0 mt-2 flex items-center gap-1.5 text-[9px] text-white/30">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e09225] animate-pulse" />
          Tap a position on the pitch, or tap a player to quick-assign
        </div>
      )}
      {emptyCount > 0 && usedCount > 0 && (
        <div className="shrink-0 mt-1.5 text-[8px] text-white/20">
          {usedCount}/5 assigned · {sorted.length} bench · {emptyCount} empty
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ────────────────────────────────────────────────────────────
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

  // Find the best empty slot for a given player (by position match, then first available)
  const findBestEmptySlot = useCallback((playerData: any, currentSlots: (any | null)[]) => {
    const posCat = getPrimaryCategory(playerData.positions);
    // First try to find an empty slot matching the player's position
    for (let i = 0; i < POSITIONS.length; i++) {
      if (!currentSlots[i] && POSITIONS[i] === posCat) return i;
    }
    // Fall back to any empty slot
    for (let i = 0; i < POSITIONS.length; i++) {
      if (!currentSlots[i]) return i;
    }
    return -1; // no empty slots
  }, []);

  const handleAssignFromBench = useCallback((playerData: any) => {
    setSquadSlots((prev) => {
      const newSlots = [...prev];

      // If this player is already in a slot, remove them first (swap)
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i]?._id?.toString() === playerData._id?.toString()) {
          newSlots[i] = null;
        }
      }

      if (selectedSlot !== null && !newSlots[selectedSlot]) {
        // Specific empty slot selected - assign there
        newSlots[selectedSlot] = playerData;
      } else if (selectedSlot !== null && newSlots[selectedSlot]) {
        // Slot has a player - swap: remove old, assign new
        newSlots[selectedSlot] = playerData;
      } else {
        // No slot selected - quick-assign to best matching empty slot
        const bestSlot = findBestEmptySlot(playerData, newSlots);
        if (bestSlot >= 0) {
          newSlots[bestSlot] = playerData;
        }
      }

      return newSlots;
    });
    setSelectedSlot(null);
  }, [selectedSlot, findBestEmptySlot]);

  const handleAutoFill = useCallback(() => {
    setSquadSlots((prev) => {
      const newSlots = [...prev];
      const usedIds = new Set<string>();
      newSlots.forEach((p) => {
        if (p?._id) usedIds.add(p._id.toString());
      });

      // Get unassigned players sorted by overall
      const available = ownedPlayers
        .filter((op: any) => {
          const p = op.playerId;
          return p && !usedIds.has(p._id?.toString());
        })
        .sort((a: any, b: any) => (b.playerId?.overall || 0) - (a.playerId?.overall || 0));

      // For each empty slot, find the best matching available player
      for (let i = 0; i < POSITIONS.length; i++) {
        if (newSlots[i]) continue;
        const pos = POSITIONS[i];
        const matchIdx = available.findIndex(
          (op: any) => op.playerId && playerMatchesCategory(op.playerId.positions, pos)
        );
        if (matchIdx >= 0) {
          newSlots[i] = available[matchIdx].playerId;
          available.splice(matchIdx, 1);
        }
      }

      // Fill remaining empty slots with best overall
      for (let i = 0; i < POSITIONS.length; i++) {
        if (newSlots[i]) continue;
        if (available.length > 0) {
          newSlots[i] = available[0].playerId;
          available.splice(0, 1);
        }
      }

      return newSlots;
    });
    toast.success("Auto-filled empty slots!");
  }, [ownedPlayers]);

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
      <div className="h-full overflow-y-auto bg-[#06182e]">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          <div className="animate-pulse space-y-2">
            <div className="h-6 w-32 bg-white/5 rounded-lg" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
          <SkeletonSquadSlots />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="h-full overflow-y-auto bg-[#06182e]">
        <ErrorState title="Failed to load squad" message={error?.message || "Could not fetch your squad data"} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#06182e]">
      <div className="max-w-6xl mx-auto p-3 md:p-4 lg:p-6 pb-24 space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {!isOnboarding && (
              <button
                onClick={() => router.back()}
                className="shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4 text-white/60" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#e09225]" />
                {isOnboarding ? "Build Your Squad" : "Squad"}
              </h1>
              <p className="text-[10px] text-white/40 mt-0.5">
                {filledCount}/5 players · Avg. {squadRating || "—"} rating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Rating badge */}
            {filledCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#e09225]/10 border border-[#e09225]/15">
                <Star className="w-3 h-3 text-[#e09225]" />
                <span className="text-sm font-extrabold text-[#e09225]">{squadRating}</span>
              </div>
            )}
            {!isOnboarding && (
              <button
                onClick={() => router.push("/game/collection")}
                className="shrink-0 text-[10px] text-[#e09225]/70 hover:text-[#e09225] font-medium bg-[#e09225]/5 px-3 py-1.5 rounded-full border border-[#e09225]/10 transition-colors"
              >
                Collection
              </button>
            )}
          </div>
        </div>

        {/* ── Main layout: Pitch (left) + Bench (right) ── */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left: Pitch */}
          <div className="w-full lg:w-1/2 xl:w-[45%] shrink-0">
            <PitchView
              slots={squadSlots}
              selectedSlot={selectedSlot}
              onSlotClick={handleSlotClick}
              onRemove={handleRemoveFromSlot}
            />
          </div>

          {/* Right: Bench */}
          <div className="flex-1 min-h-0 flex flex-col">
            {ownedPlayers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/50 font-medium mb-1">No players in your collection</p>
                <p className="text-white/20 text-xs mb-4">Buy players from the shop first</p>
                <button
                  onClick={() => router.push("/game/shop")}
                  className="px-5 py-2.5 bg-[#e09225] text-[#06182e] font-bold rounded-xl text-sm hover:brightness-110 transition"
                >
                  Go to Shop
                </button>
              </div>
            ) : (
              <BenchSection
                players={ownedPlayers}
                assignedIds={assignedIds}
                selectedSlot={selectedSlot}
                onAssign={handleAssignFromBench}
                onAutoFill={handleAutoFill}
              />
            )}
          </div>
        </div>

        {/* ── Save bar ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#06182e]/95 backdrop-blur-lg border-t border-[#e09225]/10 px-4 py-3 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            {/* Left: squad progress */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1">
                {squadSlots.map((p, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black border ${
                      p
                        ? "text-[#06182e] border-transparent"
                        : "text-white/20 border-white/10 bg-white/5"
                    }`}
                    style={p ? { backgroundColor: POSITION_META[POSITIONS[i]].color } : {}}
                  >
                    {p ? p.overall : POSITIONS[i].slice(0, 2)}
                  </div>
                ))}
              </div>
              {!filledCount || filledCount < 5 ? (
                <span className="text-[9px] text-white/30 hidden sm:block">
                  {5 - filledCount} empty slot(s)
                </span>
              ) : (
                <span className="text-[9px] text-green-400/60 hidden sm:block">
                  <Check className="w-3 h-3 inline mr-1" />
                  Ready to save
                </span>
              )}
            </div>

            {/* Right: save button */}
            <button
              onClick={handleSave}
              disabled={saveSquad.isPending || filledCount < 5}
              className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-[#e09225] to-[#d4821a] text-[#06182e] font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#e09225]/20"
            >
              {saveSquad.isPending ? (
                <div className="w-4 h-4 border-2 border-[#06182e] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isOnboarding ? "Confirm Squad" : "Save Squad"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
