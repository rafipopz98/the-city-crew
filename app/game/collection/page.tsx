"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Library,
  X,
  User,
  Coins,
  TrendingUp,
  Info,
  Plus,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useInfiniteCollection } from "@/lib/game/hooks/useGameQuery";
import { ErrorState, getRarityTheme } from "@/app/game/_components";
import { CardPulse, CardPulseSkeleton } from "@/components/game/CardVariants";
import { POSITION_GROUPS, GK_STATS_CONFIG, FIELD_STATS_CONFIG, isGK } from "@/lib/game/utils/positionMapping";
import { toast } from "sonner";
import api from "@/lib/api/axios";
import confetti from "canvas-confetti";

const RARITIES = ["all", "Basic", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
const POSITION_FILTERS = ["all", ...Object.keys(POSITION_GROUPS)];


function CollectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardPulseSkeleton key={i} />
      ))}
    </div>
  );
}

export default function CollectionPage() {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerDetail, setPlayerDetail] = useState<any>(null);
  const [gameUser, setGameUser] = useState<any>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

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
    owned: "owned",
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

  // Show skeleton in grid while loading (initial load + filter changes)
  const showSkeleton = isLoading && !data;

  // ── Open player detail modal — data already in allPlayers ──
  const openPlayerDetail = useCallback(async (playerId: string) => {
    const player = allPlayers.find((p: any) => p._id === playerId);
    if (!player) {
      toast.error("Player not found");
      return;
    }
    setSelectedPlayerId(playerId);
    setPlayerDetail(player);
    try {
      const userResp = await api.get("/game/user");
      setGameUser(userResp.data.gameUser || null);
    } catch {
      // Game user fetch failed — upgrades won't work but details still show
    }
  }, [allPlayers]);

  const closePlayerDetail = useCallback(() => {
    setSelectedPlayerId(null);
    setPlayerDetail(null);
  }, []);

  // ── Handle upgrade in modal ──
  const handleUpgrade = async (stat: string) => {
    if (!playerDetail || !playerDetail.is_owned) return;
    setUpgrading(stat);
    try {
      const { data } = await api.post("/game/upgrade", { ownedPlayerId: playerDetail._id, stat });
      toast.success(data.message);
      // ── Confetti burst on upgrade ──
      const accent = getRarityTheme(playerDetail.rarity).accent;
      confetti({
        particleCount: 30,
        spread: 80,
        origin: { x: 0.5, y: 0.6 },
        colors: [accent, "#22c55e", "#ffd700", "#48dbfb"],
        startVelocity: 35,
        ticks: 150,
        zIndex: 200,
      });
      setTimeout(() => {
        confetti({
          particleCount: 15,
          spread: 50,
          origin: { x: 0.3, y: 0.7 },
          colors: [accent, "#ffd700"],
          startVelocity: 25,
          ticks: 100,
          zIndex: 200,
        });
        confetti({
          particleCount: 15,
          spread: 50,
          origin: { x: 0.7, y: 0.7 },
          colors: [accent, "#22c55e"],
          startVelocity: 25,
          ticks: 100,
          zIndex: 200,
        });
      }, 150);
      setPlayerDetail((prev: any) => {
        if (!prev) return prev;
        const newLevels = { ...(prev.upgrade_levels || {}), [stat]: data.upgradeLevel };
        // Use correct stat keys for GK vs field players
        const playerPositions = prev.positions || [];
        const playerIsGK = isGK(playerPositions);
        const statKeys = playerIsGK
          ? ["goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking", "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed"]
          : ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
        let total = 0;
        const updates: Record<string, number> = {};
        for (const s of statKeys) {
          const base = prev[s] || 0;
          const upg = newLevels[s] || 0;
          const eff = base + upg;
          updates[`effective_${s}`] = eff;
          total += eff;
        }
        return {
          ...prev,
          upgrade_levels: newLevels,
          effective_overall: Math.round(total / statKeys.length),
          ...Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v])),
        };
      });
      setGameUser((prev: any) => ({ ...prev, coins: data.coins, xp: data.xp }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  };

  // ── Close on Escape ──
  useEffect(() => {
    if (!selectedPlayerId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlayerDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedPlayerId, closePlayerDetail]);

  // ── Full error state when no data at all ──
  if (isError && allPlayers.length === 0) {
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
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24">
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

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
              {POSITION_FILTERS.map((p) => (
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
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-full sm:w-fit overflow-x-auto scrollbar-none">
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

        {/* ── Grid: skeleton while loading, cards when ready ── */}
        {showSkeleton ? (
          <CollectionSkeleton />
        ) : allPlayers.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm mb-1">No players found</p>
            <p className="text-gray-600 text-xs">
              Buy players from the shop to grow your collection!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allPlayers.map((player: any) => (
              <CardPulse
                key={player._id}
                player={player}
                mode="collection"
                onClick={() => openPlayerDetail(player._id)}
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── PLAYER DETAIL MODAL OVERLAY ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {selectedPlayerId && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={closePlayerDetail}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-lg max-h-[90vh] sm:rounded-2xl border border-white/10 overflow-y-auto shadow-2xl"
            style={{ background: `linear-gradient(180deg, #050a1a 0%, #0a1628 40%, #050a1a 100%)` }}
          >
            {/* ── Background effects ── */}
            {playerDetail && (
              <>
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px"}} />
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${getRarityTheme(playerDetail.rarity).accent}, transparent 70%)` }} />
              </>
            )}
            <div className="relative z-10">
            {/* ── Player Detail Content ── */}
            {playerDetail && (
              <>
                {/* Close button */}
                <button
                  onClick={closePlayerDetail}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Hero Card */}
                <div className="relative overflow-hidden">
                  {/* Pulse-style background instead of PlayerCardBackground */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#050a1a] via-[#0a1628] to-[#050a1a]" />
                  <div className="absolute inset-0 opacity-[0.06]" style={{
                    background: `linear-gradient(135deg, ${getRarityTheme(playerDetail.rarity).accent}00 0%, ${getRarityTheme(playerDetail.rarity).accent} 25%, ${getRarityTheme(playerDetail.rarity).accent}00 50%, ${getRarityTheme(playerDetail.rarity).accent} 75%, ${getRarityTheme(playerDetail.rarity).accent}00 100%)`}} />
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px"}} />
                  <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.08]" style={{ background: `radial-gradient(circle, ${getRarityTheme(playerDetail.rarity).accent}, transparent 70%)` }} />
                  <div className="relative p-5 sm:p-6 flex items-center gap-5">
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 ring-2 flex items-center justify-center"
                      style={{ '--tw-ring-color': `${getRarityTheme(playerDetail.rarity).accent}60` } as React.CSSProperties}
                    >
                      {playerDetail.image_url ? (
                        <img src={playerDetail.image_url} alt={playerDetail.short_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${getRarityTheme(playerDetail.rarity).accent}25`, color: getRarityTheme(playerDetail.rarity).accent }}
                        >
                          {playerDetail.rarity}
                        </span>
                        {playerDetail.is_owned && (
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Owned
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">{playerDetail.short_name}</h2>
                      <p className="text-gray-400 text-xs sm:text-sm">{playerDetail.long_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">{playerDetail.nationality}</span>
                        <span className="text-gray-600">·</span>
                        <div className="flex gap-1">
                          {playerDetail.positions?.map((pos: string) => (
                            <span key={pos} className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 text-[9px] font-bold">{pos}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="text-3xl sm:text-4xl font-bold leading-none" style={{ color: getRarityTheme(playerDetail.rarity).accent }}>
                        {playerDetail.is_owned && playerDetail.effective_overall ? playerDetail.effective_overall : playerDetail.overall}
                      </div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">
                        {playerDetail.is_owned && playerDetail.effective_overall > playerDetail.overall ? "Upgraded" : "Overall"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats & Upgrades */}
                <div className="relative p-4 sm:p-5 space-y-4">
                  {/* Pulse-themed card background for stats area */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a]/80 via-[#080f1e]/80 to-[#050a1a]/80" />
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px"}} />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                  <div className="relative z-10 space-y-4">
                    {/* Wallet */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Your Resources</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-600">XP</span>
                          <span className="text-xs font-bold text-purple-400 tabular-nums">{gameUser?.xp?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-amber-400 tabular-nums">{gameUser?.coins?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                    {/* Stats (field or GK) */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#e09225]" />
                        Stats
                      </h3>
                      <div className="space-y-1">
                        {(() => {
                          const playerPositions = playerDetail.positions || [];
                          const isPlayerGK = isGK(playerPositions);
                          const statsConfig = isPlayerGK ? GK_STATS_CONFIG : FIELD_STATS_CONFIG;
                          return statsConfig.map(({ key, label, short }) => {
                            // Get base value
                            const base = playerDetail[key] || 0;
                            const upg = playerDetail.upgrade_levels?.[key] || 0;
                            const effective = base + upg;
                            const barColor = effective >= 85 ? "#22c55e" : effective >= 70 ? "#e09225" : "#ef4444";
                            const barPct = Math.min((effective / 99) * 100, 100);

                            return (
                              <div key={key} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                                <span className="text-[10px] font-bold text-gray-500 w-14 shrink-0 uppercase">{short}</span>
                                <div className="flex-1 h-2.5 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPct}%`, backgroundColor: barColor, boxShadow: `0 0 6px ${barColor}40` }} />
                                </div>
                                <span className="text-xs font-extrabold text-white w-8 text-right tabular-nums">
                                  {effective}
                                </span>
                                {playerDetail.is_owned && (
                                  <button
                                    onClick={() => handleUpgrade(key)}
                                    disabled={upgrading === key}
                                    className="w-9 h-7 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-500/40 transition-all flex items-center justify-center shrink-0 disabled:opacity-40"
                                    title={`Upgrade ${label}`}
                                  >
                                    {upgrading === key ? (
                                      <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Plus className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Upgrade Info */}
                    {playerDetail.is_owned && (
                      <div className="bg-black/40 border border-white/[0.04] rounded-xl p-3 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[#e09225] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Click the <Plus className="w-2.5 h-2.5 inline" /> button next to any stat to train it. Costs increase as stats get higher. XP is <strong className="text-gray-400">not consumed</strong> — it's a gate requirement.
                        </p>
                      </div>
                    )}

                    {/* Squad Button */}
                    <button
                      onClick={() => {
                        closePlayerDetail();
                        window.location.href = "/game/squad";
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e09225]/10 to-transparent border border-[#e09225]/30 text-[#e09225] font-bold text-sm hover:bg-[#e09225]/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      Manage in Squad
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Error state ── */}
            {!playerDetail && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-gray-500 text-sm">Could not load player details</p>
                <button onClick={closePlayerDetail} className="text-[#e09225] text-sm font-medium hover:underline">
                  Close
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
