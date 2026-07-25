"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Library,
  Lock,
  Check,
  Shield,
  Zap,
  Swords,
  User,
  X,
} from "lucide-react";
import { useCollection } from "@/lib/game/hooks/useGameQuery";
import { SkeletonGrid } from "@/app/game/_components";
import { ErrorState } from "@/app/game/_components";

const RARITIES = [
  "all",
  "Basic",
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];
const POSITIONS = ["all", "GK", "DEF", "MID", "FWD"];

export default function CollectionPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [ownsFilter, setOwnsFilter] = useState<"all" | "owned" | "locked">(
    "all",
  );

  const { data, isLoading, isError, error, refetch } = useCollection({
    rarity: rarityFilter,
    position: positionFilter,
    search,
    owned: ownsFilter !== "all" ? ownsFilter : undefined,
  });

  const players = data?.collection || [];
  const stats = { total: data?.allTotal || 0, owned: data?.ownedCount || 0 };

  // Client-side filtering on top of API filter for responsiveness
  const filtered = useMemo(() => {
    let result = [...players];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.short_name?.toLowerCase().includes(q) ||
          p.long_name?.toLowerCase().includes(q),
      );
    }

    if (rarityFilter !== "all") {
      result = result.filter((p: any) => p.rarity === rarityFilter);
    }

    if (positionFilter !== "all") {
      result = result.filter((p: any) => p.positions?.includes(positionFilter));
    }

    if (ownsFilter === "owned") {
      result = result.filter((p: any) => p.is_owned);
    } else if (ownsFilter === "locked") {
      result = result.filter((p: any) => !p.is_owned);
    }

    return result;
  }, [search, rarityFilter, positionFilter, ownsFilter, players]);

  const getRarityColor = useCallback((rarity: string) => {
    const colors: Record<string, string> = {
      Basic: "#9ca3af",
      Common: "#6b7280",
      Uncommon: "#22c55e",
      Rare: "#06b6d4",
      Epic: "#a855f7",
      Legendary: "#f59e0b",
    };
    return colors[rarity] || "#9ca3af";
  }, []);

  const getPositionIcon = useCallback((pos: string) => {
    switch (pos) {
      case "GK":
        return <Shield className="w-3 h-3" />;
      case "DEF":
        return <Shield className="w-3 h-3" />;
      case "MID":
        return <Zap className="w-3 h-3" />;
      case "FWD":
        return <Swords className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
          <div className="animate-pulse">
            <div className="h-6 w-28 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-36 bg-white/5 rounded" />
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full" />
          <div className="h-10 bg-white/5 rounded-xl" />
          <SkeletonGrid count={12} columns={6} />
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
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Collection</h1>
            <p className="text-gray-500 text-sm">
              {stats.owned} / {stats.total} players owned
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#e09225] to-[#e09225]/60 rounded-full transition-all duration-500"
            style={{
              width:
                stats.total > 0
                  ? `${(stats.owned / stats.total) * 100}%`
                  : "0%",
            }}
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#e09225]/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-gray-300 transition" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex overflow-x-auto gap-2 pb-1 -mb-1 scrollbar-none">
            {/* Ownership */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
              {(["all", "owned", "locked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setOwnsFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    ownsFilter === f
                      ? "bg-[#e09225]/20 text-[#e09225]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f === "all" ? "All" : f === "owned" ? "Owned" : "Locked"}
                </button>
              ))}
            </div>

            {/* Position */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPositionFilter(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    positionFilter === p
                      ? "bg-[#e09225]/20 text-[#e09225]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>

            {/* Rarity */}
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
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filtered.map((player: any, i: number) => (
            <motion.button
              key={player._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => router.push(`/game/collection/${player._id}`)}
              className="relative group"
            >
              <div
                className={`aspect-3/4 rounded-xl bg-linear-to-b from-white/5 to-white/2 border overflow-hidden flex flex-col items-center justify-center p-2 transition-all hover:border-[#e09225]/40 ${
                  player.is_owned
                    ? "border-white/10"
                    : "border-white/5 opacity-60"
                }`}
              >
                {/* Locked overlay */}
                {!player.is_owned && (
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center z-10">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                )}

                {/* Rarity glow top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: getRarityColor(player.rarity) }}
                />

                {/* Image */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 mb-1 overflow-hidden">
                  {player.image_url && (
                    <img
                      src={player.image_url}
                      alt={player.short_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Overall */}
                <div className="text-lg font-bold text-white">
                  {player.overall}
                </div>

                {/* Name */}
                <p className="text-[10px] text-gray-300 font-medium truncate max-w-full px-1">
                  {player.short_name}
                </p>

                {/* Position + Nationality */}
                <div className="flex flex-col items-center gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-gray-400 flex items-center gap-0.5">
                    {getPositionIcon(player.positions?.[0] || "")}
                    {player.positions?.[0] || "-"}
                  </span>
                  <span className="text-[8px] text-gray-600 truncate max-w-full">
                    {player.nationality || ""}
                  </span>
                </div>

                {/* Owned badge */}
                {player.is_owned && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Library className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No players match your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
