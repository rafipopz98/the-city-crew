"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Search,
  X,
  Sparkles,
  Library,
} from "lucide-react";
import { useInfiniteCollection } from "@/lib/game/hooks/useGameQuery";
import {
  ErrorState,
} from "@/app/game/_components";
import { isGK } from "@/lib/game/utils/positionMapping";
import { CardPulse, CardPulseSkeleton } from "@/components/game/CardVariants";

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

  const allPlayers = (data?.pages.flatMap((p) => p.collection) || [])
    .sort((a: any, b: any) => {
      const aRating = a.effective_overall || a.overall || 0;
      const bRating = b.effective_overall || b.overall || 0;
      return bRating - aRating;
    });

  // Check if player can still be upgraded (any stat < 99)
  const upgradableCount = allPlayers.filter((p: any) => {
    const isPlayerGK = isGK(p.positions);
    const statKeys = isPlayerGK
      ? ["goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking", "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed"]
      : ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
    return statKeys.some((s) => (p[`effective_${s}`] || p[s] || 0) < 99);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardPulseSkeleton key={i} />
            ))}
          </div>
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
            <motion.div key="list" layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allPlayers.map((player: any) => (
                <CardPulse
                  key={player._id}
                  player={player}
                  mode="upgrade"
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
