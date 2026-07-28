"use client";

import { User, ShoppingCart, Lock, Sparkles, Coins, ChevronRight, Shield } from "lucide-react";
import { getRarityTheme } from "@/app/game/_components";
import { isGK, GK_STATS_CONFIG, FIELD_STATS_CONFIG } from "@/lib/game/utils/positionMapping";
import { motion } from "framer-motion";

// ─── HELPERS ───────────────────────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", France: "🇫🇷", Germany: "🇩🇪", Spain: "🇪🇸",
  Italy: "🇮🇹", Portugal: "🇵🇹", Netherlands: "🇳🇱", Belgium: "🇧🇪",
  Brazil: "🇧🇷", Argentina: "🇦🇷", Croatia: "🇭🇷", Denmark: "🇩🇰",
};

function getFlag(nationality?: string): string {
  if (!nationality) return "";
  if (FLAG_MAP[nationality]) return FLAG_MAP[nationality];
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (nationality.toLowerCase().includes(key.toLowerCase())) return flag;
  }
  return "";
}

function getPlayerStatsConfig(positions: string[] | undefined | null) {
  return isGK(positions) ? GK_STATS_CONFIG : FIELD_STATS_CONFIG;
}

function getStatValue(player: any, key: string): number {
  return player[`effective_${key}`] || player[key] || 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// THE PULSE — Unified card for Shop / Upgrade / Collection
// ═══════════════════════════════════════════════════════════════════════════

interface CardPulseProps {
  player: any;
  mode?: "shop" | "upgrade" | "collection";
  onClick?: () => void;
  onBuy?: () => void;
  isBuying?: boolean;
}

export function CardPulse({ player, mode = "collection", onClick, onBuy, isBuying }: CardPulseProps) {
  const theme = getRarityTheme(player.rarity);
  const flag = getFlag(player.nationality);
  const stats = getPlayerStatsConfig(player.positions);
  const ovr = player.effective_overall || player.overall || 0;
  const vals = stats.slice(0, 6).map((s) => getStatValue(player, s.key));
  // Normalize against absolute max (99) so 50 = middle ring
  const radar = vals.map((v) => Math.min(v / 99, 1));

  const isOwned = player.is_owned;
  const locked = player.locked;
  const canAfford = player.can_afford;
  const xpMet = player.xp_met;
  const price = player.price || 0;
  const requiredXp = player.required_xp || 0;
  const totalUpgradeCost = player.total_upgrade_cost || 0;

  // Upgrade mode helpers
  const isPlayerGK = isGK(player.positions);
  const upgradeStats = isPlayerGK
    ? ["goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking", "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed"]
    : ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
  const hasRoomToGrow = upgradeStats.some((s) => (player[`effective_${s}`] || player[s] || 0) < 99);
  const totalUpgrades = Object.values(player.upgrade_levels || {}).reduce((sum: number, v: any) => sum + (v || 0), 0);
  const isUpgraded = totalUpgrades > 0;

  const W = onClick ? motion.button : motion.div;

  return (
    <W
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-full rounded-2xl overflow-hidden group cursor-pointer text-left"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050a1a] via-[#0a1628] to-[#050a1a]" />
      <div
        className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-700"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}00 0%, ${theme.accent} 25%, ${theme.accent}00 50%, ${theme.accent} 75%, ${theme.accent}00 100%)`,
          backgroundSize: "200% 200%",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 20px ${theme.accent}15, 0 0 30px ${theme.accent}10` }}
      />
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.08] group-hover:animate-pulse"
        style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
      />

      <div className="relative z-10 p-3 sm:p-4">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ROW 1 — Image + OVR + Name */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-3">
          {/* Player image */}
          <div className="shrink-0">
            <div
              className="w-[68px] sm:w-[76px] h-[68px] sm:h-[76px] rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                border: `2px solid ${theme.accent}30`,
                boxShadow: `0 0 20px ${theme.accent}20`,
              }}
            >
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
            </div>
          </div>

          {/* OVR + Name + Flag + Positions */}
          <div className="flex-1 min-w-0">
            {/* OVR */}
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl sm:text-3xl font-black tabular-nums leading-none"
                style={{ color: theme.accent, textShadow: `0 0 12px ${theme.accent}40` }}
              >
                {ovr}
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-[0.15em] font-bold">OVR</span>
            </div>

            {/* Name + flag */}
            <div className="flex items-center gap-1.5 mt-1">
              {flag && <span className="text-base sm:text-lg leading-none">{flag}</span>}
              <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white truncate tracking-wide" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                {player.short_name}
              </h3>
            </div>

            {/* Positions */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {player.positions?.slice(0, 3).map((pos: string, i: number) => (
                <span
                  key={pos}
                  className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-white/5"
                  style={{ color: i === 0 ? theme.accent : "#6b7280" }}
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ROW 2 — Radar chart (centered) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex justify-center mb-3 sm:mb-3">
          <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[260px] aspect-square">
            <svg viewBox="-20 -20 200 200" className="w-full h-full">
              {/* Grid rings */}
              {[0.25, 0.5, 0.75, 1].map((scale) => (
                <polygon
                  key={scale}
                  points={[0, 1, 2, 3, 4, 5]
                    .map((i) => {
                      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                      const r = 60 * scale;
                      return `${80 + r * Math.cos(a)},${80 + r * Math.sin(a)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.6"
                />
              ))}
              {/* Axis lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1={80} y1={80}
                    x2={80 + 62 * Math.cos(a)} y2={80 + 62 * Math.sin(a)}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.5"
                  />
                );
              })}
              {/* Data polygon */}
              <polygon
                points={radar
                  .map((v, i) => {
                    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                    const r = 60 * v;
                    return `${80 + r * Math.cos(a)},${80 + r * Math.sin(a)}`;
                  })
                  .join(" ")}
                fill={`${theme.accent}20`}
                stroke={theme.accent}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Data points + labels */}
              {stats.slice(0, 6).map((s, i) => {
                const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                const r = 60 * radar[i];
                const cx = 80 + r * Math.cos(a);
                const cy = 80 + r * Math.sin(a);
                const lr = 74;
                const lx = 80 + lr * Math.cos(a);
                const ly = 80 + lr * Math.sin(a);
                const val = getStatValue(player, s.key);
                return (
                  <g key={s.key}>
                    <circle cx={cx} cy={cy} r="3" fill={theme.accent}>
                      <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text
                      x={lx} y={ly + 1}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="8.5" fontWeight="bold"
                      style={{ pointerEvents: "none", fontFamily: "system-ui" }}
                    >
                      {s.label}
                    </text>
                    <text
                      x={lx} y={ly + 12}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={theme.accent}
                      fontSize="7.5" fontWeight="bold"
                      style={{ pointerEvents: "none" }}
                    >
                      {val}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ROW 3 — The City Crew branding + rarity + actions */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em]">
              The City Crew
            </span>
          </div>
          <div
            className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}25, ${theme.accent}10)`,
              color: theme.accent,
              border: `1px solid ${theme.accent}25`,
            }}
          >
            {theme.label}
          </div>
        </div>

        {/* ── Bottom accent ── */}
        <div className="mt-2 mb-1.5 h-[2px] rounded-full w-3/4 mx-auto opacity-40" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FOOTER — Contextual action bar */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mode === "shop" && (
          <ShopFooter
            isOwned={isOwned}
            locked={locked}
            canAfford={canAfford}
            xpMet={xpMet}
            price={price}
            requiredXp={requiredXp}
            onBuy={onBuy}
            isBuying={isBuying}
          />
        )}

        {mode === "upgrade" && (
          <UpgradeFooter
            isUpgraded={isUpgraded}
            totalUpgradeCost={totalUpgradeCost}
            hasRoomToGrow={hasRoomToGrow}
            totalUpgrades={totalUpgrades}
          />
        )}

        {mode === "collection" && (
          <CollectionFooter isOwned={isOwned} inSquad={player.in_squad} requiredXp={requiredXp} />
        )}
      </div>
    </W>
  );
}

// ─── Shop Footer ───────────────────────────────────────────────────────────
function ShopFooter({
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
  requiredXp: number;
  onBuy?: () => void;
  isBuying?: boolean;
}) {
  if (isOwned) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/[0.06] border border-green-500/15">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[11px] font-bold text-green-400/80 uppercase tracking-wider">OWNED</span>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.03] border border-white/5">
        <Lock className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{requiredXp} XP REQUIRED</span>
      </div>
    );
  }

  const canBuy = xpMet && canAfford;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3 text-amber-400/70" />
        <span className="text-[11px] font-bold text-amber-400/80 tabular-nums">{price.toLocaleString()} coins</span>
      </div>
      <button
        onClick={onBuy}
        disabled={!canBuy || isBuying}
        className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
          canBuy
            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a1628] hover:brightness-110 shadow-lg shadow-amber-500/20"
            : "bg-white/5 text-white/30 cursor-not-allowed"
        }`}
      >
        {isBuying ? (
          <div className="w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
        ) : canBuy ? (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            BUY NOW
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

// ─── Upgrade Footer ────────────────────────────────────────────────────────
function UpgradeFooter({
  isUpgraded,
  totalUpgradeCost,
  hasRoomToGrow,
  totalUpgrades,
}: {
  isUpgraded: boolean;
  totalUpgradeCost: number;
  hasRoomToGrow: boolean;
  totalUpgrades: number;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-1.5">
        <Coins className="w-3.5 h-3.5 text-amber-400/70" />
        <span className="text-[10px] text-gray-500 font-medium">
          {isUpgraded ? `${totalUpgradeCost.toLocaleString()} coins invested` : "Not upgraded"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {totalUpgrades > 0 && (
          <span className="text-[10px] text-green-400 font-bold flex items-center gap-0.5">
            +{totalUpgrades}
          </span>
        )}
        {hasRoomToGrow ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
            <Sparkles className="w-3 h-3" />
            Upgrade
          </span>
        ) : (
          <span className="text-[9px] text-gray-600 font-medium">MAXED</span>
        )}
        <ChevronRight className="w-3 h-3 text-amber-500/70" />
      </div>
    </div>
  );
}

// ─── Collection Footer ─────────────────────────────────────────────────────
function CollectionFooter({
  isOwned,
  inSquad,
  requiredXp,
}: {
  isOwned: boolean;
  inSquad: boolean;
  requiredXp: number;
}) {
  if (isOwned) {
    return (
      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-bold text-green-400/80 uppercase tracking-wider">OWNED</span>
        </div>
        <div className="flex items-center gap-1.5">
          {inSquad && <span className="text-[9px] text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded">In Squad</span>}
          <ChevronRight className="w-3 h-3 text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-1.5">
        <Lock className="w-3 h-3 text-gray-500" />
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{requiredXp} XP</span>
      </div>
      <ChevronRight className="w-3 h-3 text-gray-500" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════
export function CardPulseSkeleton() {
  const shimmer = "bg-white/5 animate-pulse";
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Image + OVR row */}
        <div className="flex items-center gap-4">
          <div className={`w-[68px] h-[68px] rounded-2xl ${shimmer}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-8 w-16 rounded ${shimmer}`} />
            <div className={`h-4 w-32 rounded ${shimmer}`} />
            <div className={`h-3 w-20 rounded ${shimmer}`} />
          </div>
        </div>
        {/* Radar area */}
        <div className={`w-full max-w-[200px] mx-auto aspect-square rounded-full ${shimmer}`} />
        {/* Footer */}
        <div className={`h-8 w-full rounded-lg ${shimmer}`} />
      </div>
    </div>
  );
}
