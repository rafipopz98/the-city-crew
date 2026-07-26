"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ChevronRight,
  Coins,
  Shield,
  Zap,
  Swords,
  User,
  Search,
  X,
  Sparkles,
  ArrowUp,
  Library,
} from "lucide-react";
import { useInfiniteCollection } from "@/lib/game/hooks/useGameQuery";
import { ErrorState } from "@/app/game/_components";

const RARITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Basic:     { color: "#9ca3af", bg: "rgba(156,163,175,0.08)",  border: "rgba(156,163,175,0.2)" },
  Common:    { color: "#6b7280", bg: "rgba(107,114,128,0.08)",  border: "rgba(107,114,128,0.2)" },
  Uncommon:  { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)" },
  Rare:      { color: "#06b6d4", bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.25)" },
  Epic:      { color: "#a855f7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.25)" },
  Legendary: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)" },
};

function getRarityCfg(rarity: string) {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.Basic;
}

function getPositionIcon(pos: string) {
  switch (pos) {
    case "GK":  return <Shield className="w-3 h-3" />;
    case "DEF": return <Shield className="w-3 h-3" />;
    case "MID": return <Zap className="w-3 h-3" />;
    case "FWD": return <Swords className="w-3 h-3" />;
    default:    return <User className="w-3 h-3" />;
  }
}

const STAT_LABELS: Record<string, string> = {
  pace: "PAC", shooting: "SHO", passing: "PAS",
  dribbling: "DRI", defending: "DEF", physic: "PHY",
};

// ─── Skeleton ───────────────────────────────────────────────────────────────
function UpgradeSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-xl border border-white/5 p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div key={s} className="h-6 w-12 bg-white/5 rounded" />
                ))}
              </div>
            </div>
            <div className="w-20 h-8 bg-white/5 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Player Upgrade Row ────────────────────────────────────────────────────
function UpgradeRow({
  player,
  index,
  onClick,
}: {
  player: any;
  index: number;
  onClick: () => void;
}) {
  const rc = getRarityCfg(player.rarity);
  const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"] as const;
  const maxOverall = Math.max(
    ...stats.map((s) => (player[`effective_${s}`] || player[s] || 0)),
    99,
  );

  const totalUpgrades = stats.reduce(
    (sum, s) => sum + (player.upgrade_levels?.[s] || 0),
    0,
  );

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      onClick={onClick}
      className="w-full text-left group"
    >
      <div
        className="relative bg-white/[0.04] border border-white/10 rounded-xl p-4 transition-all duration-300 hover:bg-white/[0.07] hover:border-[#e09225]/30 hover:-translate-y-0.5 hover:shadow-lg"
        style={{ borderColor: `color-mix(in srgb, ${rc.color} 20%, transparent)` }}
      >
        {/* Rarity accent left */}
        <div
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
          style={{ backgroundColor: rc.color }}
        />

        <div className="flex items-center gap-4 pl-3">
          {/* Player image */}
          <div
            className="w-14 h-14 rounded-full shrink-0 overflow-hidden border-2 flex items-center justify-center"
            style={{ borderColor: `${rc.color}40`, backgroundColor: rc.bg }}
          >
            {player.image_url ? (
              <img
                src={player.image_url}
                alt={player.short_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <User className="w-6 h-6 text-gray-600" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm truncate">
                {player.short_name}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                style={{ backgroundColor: rc.bg, color: rc.color }}
              >
                {player.rarity}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-gray-400 flex items-center gap-0.5 shrink-0">
                {getPositionIcon(player.positions?.[0] || "")}
                {player.positions?.[0] || "-"}
              </span>
            </div>

            {/* Overall comparison */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-extrabold text-white">
                {player.effective_overall || player.overall}
              </span>
              {player.effective_overall > player.overall && (
                <span className="text-[10px] text-green-400 font-medium flex items-center">
                  <ArrowUp className="w-3 h-3" />+{player.effective_overall - player.overall}
                </span>
              )}
              {totalUpgrades > 0 && (
                <span className="text-[10px] text-amber-400 font-medium">
                  {totalUpgrades} upgrade{totalUpgrades !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Stat bars — compact row */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {stats.map((stat) => {
                const base = player[stat] || 0;
                const upg = player.upgrade_levels?.[stat] || 0;
                const effective = base + upg;
                const pct = Math.min((effective / maxOverall) * 100, 100);
                return (
                  <div
                    key={stat}
                    className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-white/5"
                    title={`${STAT_LABELS[stat]}: ${effective}${upg > 0 ? ` (+${upg})` : ""}`}
                  >
                    <span className="text-[8px] font-bold text-gray-500 uppercase">
                      {STAT_LABELS[stat]}
                    </span>
                    <div className="w-8 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: upg > 0 ? "#22c55e" : rc.color,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-white tabular-nums">
                      {effective}
                    </span>
                    {upg > 0 && (
                      <span className="text-[8px] text-green-400">+{upg}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Coins className="w-3 h-3 text-amber-400" />
              {player.total_upgrade_cost > 0
                ? `${player.total_upgrade_cost.toLocaleString()} invested`
                : "Not upgraded"}
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#e09225] group-hover:gap-2 transition-all">
              Upgrade
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Upgrade sparkle — any stat below 99 means room to grow */}
          {stats.some((s) => (player[`effective_${s}`] || player[s] || 0) < 99) && (
            <div className="absolute -top-1 -right-1">
              <div className="w-5 h-5 rounded-full bg-[#e09225]/20 border border-[#e09225]/30 flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-[#e09225]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function UpgradePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCollection({
    owned: "owned",
    search: search || undefined,
    limit: 20,
  });

  const allPlayers = data?.pages.flatMap((p) => p.collection) || [];
  const firstPage = data?.pages[0];
  const upgradableCount = allPlayers.filter((p: any) => {
    const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
    return stats.some((s) => (p[`effective_${s}`] || p[s] || 0) < 99);
  }).length;

  // ── Infinite scroll ──
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-48 bg-white/5 rounded" />
          </div>
          <div className="h-10 bg-white/5 rounded-xl" />
          <UpgradeSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <ErrorState
        title="Failed to load upgrades"
        message={error?.message || "Could not fetch player data"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#e09225]" />
              Upgrade
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {allPlayers.length} owned player{allPlayers.length !== 1 ? "s" : ""}
              {upgradableCount > 0 && (
                <span className="text-green-400">
                  {" "}· {upgradableCount} upgradable
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your players..."
            className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#e09225]/50 focus:bg-white/[0.07] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Quick info ── */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e09225]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#e09225]" />
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="font-medium text-gray-300">How upgrades work</p>
              <p>Each stat can be upgraded +1 at a time. Cost increases as the stat gets higher.</p>
              <p>
                <span className="text-amber-400">XP gate</span> — you need a minimum total XP to
                upgrade to high stat values (XP is NOT consumed).
              </p>
            </div>
          </div>
        </div>

        {/* ── Player list ── */}
        <AnimatePresence mode="wait">
          {allPlayers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Library className="w-14 h-14 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm mb-1">No owned players yet</p>
              <p className="text-gray-600 text-xs">
                Buy players from the shop first to start upgrading
              </p>
            </motion.div>
          ) : (
            <motion.div key="list" layout className="space-y-3">
              {allPlayers.map((player: any, i: number) => (
                <UpgradeRow
                  key={player._id}
                  player={player}
                  index={i}
                  onClick={() => router.push(`/game/collection/${player._id}`)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Infinite scroll sentinel ── */}
        <div ref={sentinelRef} className="h-4" />

        {/* ── Loading more ── */}
        {isFetchingNextPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-4"
          >
            <div className="w-5 h-5 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-xs">Loading more players...</span>
          </motion.div>
        )}

        {/* ── All loaded ── */}
        {!hasNextPage && allPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="w-12 h-0.5 bg-white/5 rounded-full mx-auto mb-3" />
            <p className="text-gray-600 text-xs">
              Showing all {allPlayers.length} owned players
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
