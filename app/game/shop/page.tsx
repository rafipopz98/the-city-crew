"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Lock, ShoppingCart, Search, Shield, Zap, Swords, User, Trophy, Star } from "lucide-react";
import { toast } from "sonner";
import { useShop, useBuyPlayer } from "@/lib/game/hooks/useGameQuery";
import { SkeletonGrid } from "@/app/game/_components";
import { ErrorState } from "@/app/game/_components";

const RARITIES = ["all", "Basic", "Common", "Uncommon", "Rare", "Epic", "Legendary"];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");

  const { data, isLoading, isError, error, refetch } = useShop();
  const buyMutation = useBuyPlayer();

  const items = data?.shopItems || [];
  const userXp = data?.userXp || 0;
  const userCoins = data?.userCoins || 0;

  const handleBuy = async (playerId: string) => {
    try {
      await buyMutation.mutateAsync(playerId);
      toast.success("Player purchased!");
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase");
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Basic: "#9ca3af", Common: "#6b7280", Uncommon: "#22c55e",
      Rare: "#06b6d4", Epic: "#a855f7", Legendary: "#f59e0b",
    };
    return colors[rarity] || "#9ca3af";
  };

  const getPositionIcon = (pos: string) => {
    switch (pos) {
      case "GK": return <Shield className="w-3 h-3" />;
      case "DEF": return <Shield className="w-3 h-3" />;
      case "MID": return <Zap className="w-3 h-3" />;
      case "FWD": return <Swords className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  // Client-side filter for instant UX
  const filtered = items.filter((item: any) => {
    if (search && !item.short_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (rarityFilter !== "all" && item.rarity !== rarityFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
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
          <SkeletonGrid count={12} columns={6} />
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
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Shop</h1>
            <p className="text-gray-500 text-sm">Buy players to strengthen your squad</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Star className="w-4 h-4 text-[#e09225]" />
              <span className="text-sm font-bold text-white">{userXp}</span>
              <span className="text-[10px] text-gray-500">XP</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{userCoins}</span>
              <span className="text-[10px] text-gray-500">Coins</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-50 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shop..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#e09225]/50"
            />
          </div>
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg overflow-x-auto">
            {RARITIES.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  rarityFilter === r
                    ? "bg-[#e09225]/20 text-[#e09225]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {r === "all" ? "All" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item: any, i: number) => {
            const canBuy = !item.is_owned && item.xp_met && item.can_afford;
            const isBuying = buyMutation.isPending && buyMutation.variables === item._id;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`relative rounded-xl bg-linear-to-b from-white/5 to-white/2 border overflow-hidden ${
                  item.is_owned ? "border-green-500/20" : item.locked ? "border-white/5" : "border-white/10"
                }`}
              >
                {/* Rarity bar */}
                <div className="h-1" style={{ backgroundColor: getRarityColor(item.rarity) }} />

                <div className="p-3 flex flex-col items-center">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-full bg-white/5 mb-2 overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.short_name} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>

                  {/* Overall */}
                  <div className="text-xl font-bold text-white">{item.overall}</div>

                  {/* Name */}
                  <p className="text-xs text-gray-300 font-medium truncate max-w-full">{item.short_name}</p>

                  {/* Position */}
                  <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 text-gray-400 flex items-center gap-1">
                    {getPositionIcon(item.positions?.[0] || "")}
                    {item.positions?.[0] || "-"}
                  </span>

                  {/* Rarity badge */}
                  <span
                    className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: `${getRarityColor(item.rarity)}20`,
                      color: getRarityColor(item.rarity),
                    }}
                  >
                    {item.rarity}
                  </span>

                  {/* Price/Status */}
                  <div className="mt-2 w-full">
                    {item.is_owned ? (
                      <div className="text-center text-green-400 text-[10px] font-bold flex items-center justify-center gap-1">
                        ✓ Owned
                      </div>
                    ) : item.locked ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px]">
                          <Lock className="w-3 h-3" />
                          {item.required_xp} XP
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-center text-[10px] text-gray-400">
                          🪙 {item.price} coins
                        </div>
                        <button
                          onClick={() => handleBuy(item._id)}
                          disabled={!canBuy || isBuying}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                            canBuy
                              ? "bg-[#e09225] text-[#0a1628] hover:bg-[#e09225]/90"
                              : "bg-white/5 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          {isBuying ? (
                            <div className="w-3 h-3 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                          ) : canBuy ? (
                            <>
                              <ShoppingCart className="w-3 h-3" />
                              Buy
                            </>
                          ) : (
                            "Not enough coins"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Store className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No players match your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
