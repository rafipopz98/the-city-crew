"use client";

import { User, Lock, ShoppingCart } from "lucide-react";

// ─── Country name → flag emoji ─────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  Argentina:   "🇦🇷",
  Australia:   "🇦🇺",
  Austria:     "🇦🇹",
  Belgium:     "🇧🇪",
  Brazil:      "🇧🇷",
  Cameroon:    "🇨🇲",
  Canada:      "🇨🇦",
  Chile:       "🇨🇱",
  China:       "🇨🇳",
  Colombia:    "🇨🇴",
  Croatia:     "🇭🇷",
  Czech:       "🇨🇿",
  Denmark:     "🇩🇰",
  Ecuador:     "🇪🇨",
  Egypt:       "🇪🇬",
  England:     "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Finland:     "🇫🇮",
  France:      "🇫🇷",
  Germany:     "🇩🇪",
  Ghana:       "🇬🇭",
  Greece:      "🇬🇷",
  Hungary:     "🇭🇺",
  Iceland:     "🇮🇸",
  India:       "🇮🇳",
  Iran:        "🇮🇷",
  Ireland:     "🇮🇪",
  Italy:       "🇮🇹",
  "Ivory Coast": "🇨🇮",
  Jamaica:     "🇯🇲",
  Japan:       "🇯🇵",
  Korea:       "🇰🇷",
  Mexico:      "🇲🇽",
  Morocco:     "🇲🇦",
  Netherlands: "🇳🇱",
  Nigeria:     "🇳🇬",
  Norway:      "🇳🇴",
  Poland:      "🇵🇱",
  Portugal:    "🇵🇹",
  Qatar:       "🇶🇦",
  Romania:     "🇷🇴",
  Russia:      "🇷🇺",
  Saudi:       "🇸🇦",
  Scotland:    "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Senegal:     "🇸🇳",
  Serbia:      "🇷🇸",
  Slovakia:    "🇸🇰",
  Spain:       "🇪🇸",
  Sweden:      "🇸🇪",
  Switzerland: "🇨🇭",
  Turkey:      "🇹🇷",
  Ukraine:     "🇺🇦",
  Uruguay:     "🇺🇾",
  USA:         "🇺🇸",
  Wales:       "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

function getFlag(nationality?: string): string {
  if (!nationality) return "";
  // Try exact match first, then partial match
  if (FLAG_MAP[nationality]) return FLAG_MAP[nationality];
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (nationality.toLowerCase().includes(key.toLowerCase())) return flag;
  }
  return "";
}

// ─── Rarity theme config ───────────────────────────────────────────────────
export type RarityTheme = {
  gradient: string;
  border: string;
  glow: string;
  text: string;
  accent: string;
  label: string;
};

export const RARITY_THEMES: Record<string, RarityTheme> = {
  Basic: {
    gradient: "from-[#3a3a3a] via-[#2a2a2a] to-[#1a1a1a]",
    border: "border-[#5a5a5a]/50",
    glow: "rgba(154,160,166,0.15)",
    text: "text-[#9ca3af]",
    accent: "#9ca3af",
    label: "BASIC",
  },
  Common: {
    gradient: "from-[#4a4a4a] via-[#333] to-[#222]",
    border: "border-[#6b7280]/40",
    glow: "rgba(107,114,128,0.2)",
    text: "text-[#6b7280]",
    accent: "#6b7280",
    label: "COMMON",
  },
  Uncommon: {
    gradient: "from-[#1b5e20] via-[#153a18] to-[#0d1f10]",
    border: "border-[#22c55e]/40",
    glow: "rgba(34,197,94,0.2)",
    text: "text-[#22c55e]",
    accent: "#22c55e",
    label: "UNCOMMON",
  },
  Rare: {
    gradient: "from-[#0d47a1] via-[#0a2a6e] to-[#061836]",
    border: "border-[#42a5f5]/40",
    glow: "rgba(66,165,245,0.25)",
    text: "text-[#42a5f5]",
    accent: "#42a5f5",
    label: "RARE",
  },
  Epic: {
    gradient: "from-[#4a148c] via-[#2a0a4e] to-[#140526]",
    border: "border-[#ce93d8]/40",
    glow: "rgba(206,147,216,0.25)",
    text: "text-[#ce93d8]",
    accent: "#ce93d8",
    label: "EPIC",
  },
  Legendary: {
    gradient: "from-[#e65100] via-[#7c2d00] to-[#3e1a00]",
    border: "border-[#ffb300]/50",
    glow: "rgba(255,179,0,0.3)",
    text: "text-[#ffb300]",
    accent: "#ffb300",
    label: "LEGENDARY",
  },
};

export function getRarityTheme(rarity: string): RarityTheme {
  return RARITY_THEMES[rarity] || RARITY_THEMES.Basic;
}

// ─── Stat labels ───────────────────────────────────────────────────────────
const STATS = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physic", label: "PHY" },
] as const;

// ─── PlayerCardBackground ──────────────────────────────────────────────────
export function PlayerCardBackground({
  rarity,
  locked,
}: {
  rarity: string;
  locked?: boolean;
}) {
  const theme = getRarityTheme(rarity);
  return (
    <div
      className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${theme.gradient} ${
        locked ? "brightness-[0.3]" : ""
      }`}
    />
  );
}

// ─── PlayerCardStats ───────────────────────────────────────────────────────
export function PlayerCardStats({
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physic,
  upgradeLevels,
  accentColor,
}: {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  upgradeLevels?: Record<string, number>;
  accentColor: string;
}) {
  const valueMap: Record<string, number> = {
    pace, shooting, passing, dribbling, defending, physic,
  };

  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-1">
      {STATS.map(({ key, label }) => {
        const base = valueMap[key] ?? 0;
        const upg = upgradeLevels?.[key] || 0;
        const value = base + upg;
        const upgraded = upg > 0;

        return (
          <div
            key={key}
            className="flex items-center justify-between px-2 py-0.5 rounded bg-black/30"
          >
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
              {label}
            </span>
            <div className="flex items-center gap-0.5">
              <span
                className="text-[11px] font-extrabold tabular-nums"
                style={{ color: upgraded ? "#22c55e" : "#fff" }}
              >
                {value}
              </span>
              {upgraded && (
                <span className="text-[8px] text-green-400">+{upg}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PlayerCardFooter ──────────────────────────────────────────────────────
export function PlayerCardFooter({
  isOwned,
  locked,
  canAfford,
  xpMet,
  price,
  requiredXp,
  onBuy,
  isBuying,
}: {
  isOwned: boolean;
  locked: boolean;
  canAfford: boolean;
  xpMet: boolean;
  price: number;
  requiredXp?: number;
  onBuy: () => void;
  isBuying: boolean;
}) {
  if (isOwned) {
    return (
      <div className="text-center text-green-400/80 text-[11px] font-bold flex items-center justify-center gap-1.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        OWNED
      </div>
    );
  }

  if (locked) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-white/40 text-[10px] py-1">
        <Lock className="w-3 h-3" />
        <span className="font-medium">{requiredXp} XP REQUIRED</span>
      </div>
    );
  }

  const canBuy = !isOwned && xpMet && canAfford;

  return (
    <div className="space-y-1.5">
      <div className="text-center text-[10px] text-white/50 font-medium">
        <span className="text-amber-400/80">✦</span> {price.toLocaleString()} coins
      </div>
      <button
        onClick={onBuy}
        disabled={!canBuy || isBuying}
        className={`w-full py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
          canBuy
            ? "bg-gradient-to-r from-[#e09225] to-[#d4821a] text-[#0a1628] hover:brightness-110 shadow-lg shadow-[#e09225]/20"
            : "bg-white/5 text-white/30 cursor-not-allowed"
        }`}
      >
        {isBuying ? (
          <div className="w-3.5 h-3.5 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
        ) : canBuy ? (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            BUY
          </>
        ) : !xpMet ? (
          "XP TOO LOW"
        ) : (
          "NOT ENOUGH COINS"
        )}
      </button>
    </div>
  );
}

// ─── PlayerCardSkeleton ────────────────────────────────────────────────────
export function PlayerCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#1a1a2e] border border-white/5 overflow-hidden animate-pulse">
      <div className="relative p-4 space-y-3">
        {/* Rating + Position row */}
        <div className="flex items-start justify-between">
          <div className="w-14 h-10 bg-white/5 rounded-lg" />
          <div className="w-10 h-6 bg-white/5 rounded-md" />
        </div>

        {/* Image area */}
        <div className="flex justify-center py-4">
          <div className="w-20 h-20 rounded-full bg-white/5" />
        </div>

        {/* Name */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-white/5 rounded-full" />
          <div className="w-28 h-4 bg-white/5 rounded" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded">
              <div className="w-6 h-3 bg-white/5 rounded" />
              <div className="w-5 h-3 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Price + Button */}
        <div className="space-y-1.5 pt-1">
          <div className="w-24 h-3 bg-white/5 rounded mx-auto" />
          <div className="w-full h-8 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── PlayerCard ────────────────────────────────────────────────────────────
interface PlayerCardProps {
  player: any;
  variant?: "shop" | "collection";
  onBuy?: () => void;
  isBuying?: boolean;
  onClick?: () => void;
}

export function PlayerCard({ player, variant = "shop", onBuy, isBuying, onClick }: PlayerCardProps) {
  const theme = getRarityTheme(player.rarity);
  const flag = getFlag(player.nationality);
  const locked = player.locked;
  const isOwned = player.is_owned;
  const upgradeLevels = player.upgrade_levels;
  const isCollection = variant === "collection";

  const card = (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${
        isCollection
          ? "cursor-pointer hover:-translate-y-1"
          : "group-hover:-translate-y-1"
      } ${locked ? "border-white/10" : theme.border}`}
      style={{
        boxShadow: locked
          ? "none"
          : `0 4px 24px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Background gradient */}
      <PlayerCardBackground rarity={player.rarity} locked={locked} />

      {/* Overlay for owned */}
      {isOwned && (
        <div className="absolute inset-0 bg-green-500/[0.04] pointer-events-none" />
      )}

      {/* Card content */}
      <div className="relative p-4 flex flex-col gap-2.5">
        {/* ── Top row: Rating + Position ── */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span
              className="text-4xl font-bold leading-none tracking-tighter"
              style={{ color: theme.accent }}
            >
              {isCollection && player.effective_overall
                ? player.effective_overall
                : player.overall}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                locked ? "bg-white/5 text-white/30" : "bg-black/40"
              }`}
              style={!locked ? { color: theme.accent } : undefined}
            >
              {player.positions?.[0] || "-"}
            </span>
            <span
              className="text-[8px] font-bold uppercase tracking-widest"
              style={{ color: theme.accent, opacity: 0.5 }}
            >
              {theme.label}
            </span>
          </div>
        </div>

        {/* ── Player image ── */}
        <div className="flex justify-center py-2">
          <div className="w-[88px] h-[88px] rounded-full bg-black/30 overflow-hidden flex items-center justify-center ring-2 ring-white/10">
            {player.image_url ? (
              <img
                src={player.image_url}
                alt={player.short_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <User className="w-8 h-8 text-white/30" />
            )}
            {/* Lock overlay on image for locked collection players */}
            {locked && isCollection && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white/40" />
              </div>
            )}
          </div>
        </div>

        {/* ── Player name + Flag ── */}
        <div className="flex items-center justify-center gap-2">
          {flag && (
            <span className="text-lg leading-none drop-shadow-lg">{flag}</span>
          )}
          <span
            className="text-sm font-bold text-white truncate text-center tracking-wide"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            {player.short_name?.toUpperCase()}
          </span>
        </div>

        {/* ── Stats ── */}
        <PlayerCardStats
          pace={player.pace}
          shooting={player.shooting}
          passing={player.passing}
          dribbling={player.dribbling}
          defending={player.defending}
          physic={player.physic}
          upgradeLevels={upgradeLevels}
          accentColor={theme.accent}
        />

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Footer ── */}
        {isCollection ? (
          /* Collection footer — status only, no buy button */
          isOwned ? (
            <div className="text-center text-green-400/80 text-[11px] font-bold flex items-center justify-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              OWNED
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-white/40 text-[10px] py-1">
              <Lock className="w-3 h-3" />
              <span className="font-medium">{player.required_xp} XP</span>
            </div>
          )
        ) : (
          /* Shop footer with full buy controls */
          <PlayerCardFooter
            isOwned={isOwned}
            locked={locked}
            canAfford={player.can_afford}
            xpMet={player.xp_met}
            price={player.price || 0}
            requiredXp={player.required_xp}
            onBuy={onBuy || (() => {})}
            isBuying={isBuying || false}
          />
        )}
      </div>
    </div>
  );

  // In collection mode, wrap with a clickable button
  if (isCollection && onClick) {
    return (
      <button onClick={onClick} className="group relative text-left w-full">
        {card}
      </button>
    );
  }

  return <div className="group relative">{card}</div>;
}
