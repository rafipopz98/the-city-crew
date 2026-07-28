"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Store, Search, X,
  Trophy, Star,
} from "lucide-react";
import { toast } from "sonner";
import { useInfiniteShop, useBuyPlayer } from "@/lib/game/hooks/useGameQuery";
import { ErrorState } from "@/app/game/_components";
import { CardPulse, CardPulseSkeleton } from "@/components/game/CardVariants";
import PurchaseCelebration from "@/components/game/PurchaseCelebration";

const RARITIES = ["all", "Basic", "Common", "Uncommon", "Rare", "Epic", "Legendary"];

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardPulseSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [celebration, setCelebration] = useState<{ player: any; coins: number } | null>(null);
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
  } = useInfiniteShop(12);

  const buyMutation = useBuyPlayer();

  const allItems = data?.pages.flatMap((p) => p.shopItems) || [];
  const firstPage = data?.pages[0];
  const userXp = firstPage?.userXp || 0;
  const userCoins = firstPage?.userCoins || 0;

  const filtered = allItems.filter((item: any) => {
    if (search && !item.short_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (rarityFilter !== "all" && item.rarity !== rarityFilter) return false;
    return true;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleBuy = useCallback(
    async (playerId: string) => {
      try {
        const result = await buyMutation.mutateAsync(playerId);
        const purchasedPlayer = allItems.find((item: any) => item._id === playerId);
        if (purchasedPlayer) {
          setCelebration({ player: purchasedPlayer, coins: result.coins || 0 });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to purchase");
      }
    },
    [buyMutation, allItems],
  );

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
          <div className="flex items-center justify-between animate-pulse">
            <div>
              <div className="h-6 w-16 bg-white/5 rounded-lg mb-1" />
              <div className="h-4 w-40 bg-white/5 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-9 w-20 bg-white/5 rounded-xl" />
              <div className="h-9 w-24 bg-white/5 rounded-xl" />
            </div>
          </div>
          <div className="h-10 bg-white/5 rounded-xl" />
          <ShopSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load shop"
        message={error?.message || "Could not fetch shop items"}
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
              <Store className="w-5 h-5 text-[#e09225]" />
              Shop
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Collect premium player cards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Star className="w-4 h-4 text-[#e09225]" />
              <span className="text-sm font-bold text-white">{userXp}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{userCoins}</span>
            </div>
          </div>
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
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {RARITIES.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  rarityFilter === r
                    ? "bg-[#e09225]/20 text-[#e09225] border border-[#e09225]/30"
                    : "text-gray-500 hover:text-gray-300 bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                {r === "all" ? "All" : r}
              </button>
            ))}
          </div>
        </div>

        {/* ── Player Cards Grid (always 2 cols) ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm mb-1">No players match your filters</p>
            <p className="text-gray-600 text-xs">Try a different search or rarity</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((item: any) => (
              <CardPulse
                key={item._id}
                player={item}
                mode="shop"
                onBuy={() => handleBuy(item._id)}
                isBuying={buyMutation.isPending && buyMutation.variables === item._id}
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

        {!hasNextPage && allItems.length > 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-0.5 bg-white/5 rounded-full mx-auto mb-3" />
            <p className="text-gray-600 text-xs">
              Showing all {allItems.length} players
            </p>
          </div>
        )}
      </div>

      {/* ── Purchase Celebration Modal ── */}
      {celebration && (
        <PurchaseCelebration
          player={celebration.player}
          coins={celebration.coins}
          onClose={() => {
            setCelebration(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
