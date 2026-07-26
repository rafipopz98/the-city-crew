"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Library,
  X,
} from "lucide-react";
import { useInfiniteCollection } from "@/lib/game/hooks/useGameQuery";
import { ErrorState, PlayerCard, PlayerCardSkeleton } from "@/app/game/_components";

const RARITIES = ["all", "Basic", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
const POSITIONS = ["all", "GK", "DEF", "MID", "FWD"];

function CollectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function CollectionPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [ownsFilter, setOwnsFilter] = useState<"all" | "owned" | "locked">("owned");
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
    rarity: rarityFilter !== "all" ? rarityFilter : undefined,
    position: positionFilter !== "all" ? positionFilter : undefined,
    search: search || undefined,
    owned: ownsFilter !== "all" ? ownsFilter : undefined,
    limit: 24,
  });

  const allPlayers = data?.pages.flatMap((p) => p.collection) || [];
  const firstPage = data?.pages[0];
  const stats = {
    total: firstPage?.allTotal || 0,
    owned: firstPage?.ownedCount || 0,
  };

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

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
          <div className="animate-pulse">
            <div className="h-6 w-28 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-36 bg-white/5 rounded" />
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full" />
          <div className="h-10 bg-white/5 rounded-xl" />
          <CollectionSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load collection"
        message={error?.message || "Could not fetch players"}
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
              <Library className="w-5 h-5 text-[#e09225]" />
              Collection
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {stats.owned} / {stats.total} players owned
            </p>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#e09225] to-[#e09225]/60 rounded-full transition-all duration-500"
            style={{
              width: stats.total > 0 ? `${(stats.owned / stats.total) * 100}%` : "0%",
            }}
          />
        </div>

        {/* ── Filters ── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
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

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:flex-wrap">
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
              {(["all", "owned", "locked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setOwnsFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    ownsFilter === f ? "bg-[#e09225]/20 text-[#e09225]" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f === "all" ? "All" : f === "owned" ? "✓ Owned" : "🔒 Locked"}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPositionFilter(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    positionFilter === p ? "bg-[#e09225]/20 text-[#e09225]" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit overflow-x-auto">
              {RARITIES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRarityFilter(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    rarityFilter === r ? "bg-[#e09225]/20 text-[#e09225]" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {r === "all" ? "All" : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Player Cards Grid (always 2 cols like shop) ── */}
        {allPlayers.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm mb-1">No players found</p>
            <p className="text-gray-600 text-xs">
              {ownsFilter === "owned"
                ? "Buy players from the shop to grow your collection!"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {allPlayers.map((player: any) => (
              <PlayerCard
                key={player._id}
                player={player}
                variant="collection"
                onClick={() => router.push(`/game/collection/${player._id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Infinite scroll sentinel ── */}
        <div ref={sentinelRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-5 h-5 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-xs">Loading more players...</span>
          </div>
        )}

        {!hasNextPage && allPlayers.length > 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-0.5 bg-white/5 rounded-full mx-auto mb-3" />
            <p className="text-gray-600 text-xs">Showing all {allPlayers.length} players</p>
          </div>
        )}
      </div>
    </div>
  );
}
