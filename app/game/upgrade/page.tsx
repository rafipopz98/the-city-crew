"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ChevronRight,
  Coins,
  User,
  Search,
  X,
  Sparkles,
  Library,
  ArrowUp,
  Zap,
  Swords,
  Shield,
  Goal,
  Eye,
  Heart,
  Footprints,
} from "lucide-react";
import { useInfiniteCollection } from "@/lib/game/hooks/useGameQuery";
import {
  ErrorState,
  PlayerCardBackground,
  getRarityTheme,
} from "@/app/game/_components";

const STATS_CONFIG = [
  { key: "pace", short: "PAC", label: "Pace", icon: Footprints, color: "#22c55e", emoji: "🏃" },
  { key: "shooting", short: "SHO", label: "Shooting", icon: Goal, color: "#ef4444", emoji: "🎯" },
  { key: "passing", short: "PAS", label: "Passing", icon: Eye, color: "#3b82f6", emoji: "🎯" },
  { key: "dribbling", short: "DRI", label: "Dribbling", icon: Zap, color: "#a855f7", emoji: "⚡" },
  { key: "defending", short: "DEF", label: "Defending", icon: Shield, color: "#f59e0b", emoji: "🛡️" },
  { key: "physic", short: "PHY", label: "Physical", icon: Heart, color: "#ec4899", emoji: "💪" },
];

function getPositionIcon(pos: string) {
  switch (pos) {
    case "GK":  return <Shield className="w-3 h-3" />;
    case "DEF": return <Shield className="w-3 h-3" />;
    case "MID": return <Zap className="w-3 h-3" />;
    case "FWD": return <Swords className="w-3 h-3" />;
    default:    return <User className="w-3 h-3" />;
  }
}

// ─── Premium Upgrade Card ──────────────────────────────────────────────────
function UpgradeCard({
  player,
  index,
  onClick,
}: {
  player: any;
  index: number;
  onClick: () => void;
}) {
  const theme = getRarityTheme(player.rarity);
  const stats = STATS_CONFIG;
  const maxOverall = Math.max(
    ...stats.map((s) => (player[`effective_${s.key}`] || player[s.key] || 0)),
    1,
  );

  const totalUpgrades = stats.reduce(
    (sum, s) => sum + (player.upgrade_levels?.[s.key] || 0),
    0,
  );

  const hasRoomToGrow = stats.some((s) => (player[`effective_${s.key}`] || player[s.key] || 0) < 99);

  const effectiveOVR = player.effective_overall || player.overall || 0;
  const baseOVR = player.overall || 0;
  const isUpgraded = effectiveOVR > baseOVR;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      onClick={onClick}
      className="w-full text-left group"
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
        <PlayerCardBackground rarity={player.rarity} locked={false} />

        <div className="relative z-10 p-3.5 md:p-4">
          {/* ── Top Row: Image + Info + Rating ── */}
          <div className="flex items-center gap-3">
            {/* Image */}
            <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden ring-2 ring-white/10 bg-black/30 flex items-center justify-center">
              {player.image_url ? (
                <img
                  src={player.image_url}
                  alt={player.short_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <User className="w-6 h-6 text-white/30" />
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm md:text-base truncate">{player.short_name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{ backgroundColor: `${theme?.accent}25`, color: theme?.accent }}
                >
                  {player.rarity}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-gray-400 flex items-center gap-0.5">
                  {getPositionIcon(player.positions?.[0] || "")}
                  {player.positions?.[0] || "-"}
                </span>
                {totalUpgrades > 0 && (
                  <span className="text-[9px] text-green-400 font-medium flex items-center gap-0.5">
                    <ArrowUp className="w-2.5 h-2.5" />
                    +{totalUpgrades}
                  </span>
                )}
              </div>
            </div>

            {/* Overall rating */}
            <div className="text-center shrink-0">
              <div
                className="text-xl md:text-2xl font-extrabold leading-none tabular-nums"
                style={{ color: theme?.accent }}
              >
                {effectiveOVR}
              </div>
              <p className="text-[7px] text-gray-500 uppercase tracking-wider mt-0.5">
                {isUpgraded ? "UPGRADED" : "OVR"}
              </p>
            </div>
          </div>

          {/* ── Stats Block ── */}
          <div className="mt-3 space-y-1.5">
            {stats.map(({ key, short, label, emoji, color }) => {
              const base = player[key] || 0;
              const upg = player.upgrade_levels?.[key] || 0;
              const effective = base + upg;
              const pct = Math.min((effective / Math.max(maxOverall, 99)) * 100, 100);

              return (
                <div key={key} className="flex items-center gap-2">
                  {/* Stat label */}
                  <div className="w-24 md:w-28 flex items-center gap-1.5 shrink-0">
                    <span className="text-xs">{emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                      {short}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: upg > 0 ? "#22c55e" : color,
                        opacity: upg > 0 ? 1 : 0.7,
                      }}
                    />
                  </div>

                  {/* Value */}
                  <div className="w-12 md:w-14 text-right shrink-0 flex items-center justify-end gap-0.5">
                    <span className="text-sm md:text-base font-bold text-white tabular-nums leading-none">
                      {effective}
                    </span>
                    {upg > 0 && (
                      <span className="text-[9px] text-green-400 font-bold leading-none">+{upg}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1 text-[9px] text-gray-500">
              <Coins className="w-3 h-3 text-amber-400/70" />
              {player.total_upgrade_cost > 0
                ? `${player.total_upgrade_cost.toLocaleString()} coins invested`
                : "Not upgraded"}
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#e09225] group-hover:gap-1.5 transition-all">
              Upgrade
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Sparkle indicator */}
        {hasRoomToGrow && (
          <div className="absolute top-2 right-2 z-20">
            <div className="w-5 h-5 rounded-full bg-[#e09225]/20 border border-[#e09225]/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-3 h-3 text-[#e09225]" />
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function UpgradeCardSkeleton() {
  const shimmer = "bg-white/5 animate-pulse";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 space-y-3">
            {/* Top row */}
            <div className="flex items-start gap-3">
              <div className={`w-16 h-16 rounded-full shrink-0 ${shimmer}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-24 rounded ${shimmer}`} />
                <div className={`h-3 w-16 rounded ${shimmer}`} />
              </div>
              <div className={`h-10 w-10 rounded-lg ${shimmer}`} />
            </div>
            {/* 6 stat rows */}
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-3 w-20 rounded ${shimmer}`} />
                <div className={`flex-1 h-2 rounded-full ${shimmer}`} />
                <div className={`h-3 w-8 rounded ${shimmer}`} />
              </div>
            ))}
            {/* Footer */}
            <div className={`h-4 w-32 rounded ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
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
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
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
          <UpgradeCardSkeleton />
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
              Upgrade Players
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

        {/* ── Info box ── */}
        <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e09225]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#e09225]" />
            </div>
            <div className="text-[11px] text-gray-400 space-y-0.5">
              <p className="font-medium text-gray-300 text-xs">How upgrading works</p>
              <p>Each stat can be upgraded one level at a time. Cost rises as the stat gets higher.</p>
              <p>
                <span className="text-amber-400">XP gate</span> — higher stats require more total XP
                (XP is never consumed, just a requirement).
              </p>
            </div>
          </div>
        </div>

        {/* ── Player cards ── */}
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
              <p className="text-gray-600 text-xs">Buy players from the shop first to start upgrading</p>
            </motion.div>
          ) : (
            <motion.div key="list" layout className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allPlayers.map((player: any, i: number) => (
                <UpgradeCard
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
            <p className="text-gray-600 text-xs">Showing all {allPlayers.length} owned players</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
