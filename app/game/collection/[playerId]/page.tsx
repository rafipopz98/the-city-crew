"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Zap, Swords, User, Lock, Check, ShoppingCart, Plus, Coins, TrendingUp } from "lucide-react";
import { ErrorState, SkeletonDetail } from "@/app/game/_components";
import { toast } from "sonner";

export default function PlayerDetailPage() {
  const { playerId } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [gameUser, setGameUser] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/game/collection/${playerId}`, { credentials: "include" }),
      fetch("/api/game/user", { credentials: "include" }),
    ])
      .then(async ([playerResponse, userResponse]) => {
        if (!playerResponse.ok || !userResponse.ok) {
          throw new Error("Failed to load player data");
        }

        const [playerData, userData] = await Promise.all([
          playerResponse.json(),
          userResponse.json(),
        ]);
        setPlayer(playerData.player || null);
        setGameUser(userData.gameUser || null);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load this player. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [playerId]);

  const handleBuy = async () => {
    if (!player) return;
    setBuying(true);
    try {
      const res = await fetch("/api/game/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player._id }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Player purchased!");
        setPlayer({ ...player, is_owned: true });
        setGameUser((prev: any) => ({ ...prev, coins: data.coins }));
      } else {
        toast.error(data.message || "Failed to purchase");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setBuying(false);
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
      case "GK": return <Shield className="w-4 h-4" />;
      case "DEF": return <Shield className="w-4 h-4" />;
      case "MID": return <Zap className="w-4 h-4" />;
      case "FWD": return <Swords className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // ─── Upgrade logic ──────────────────────────────────────────────────────

  function getCoinCost(newValue: number): number {
    if (newValue >= 95) return 1000;
    if (newValue >= 90) return 500;
    if (newValue >= 85) return 200;
    if (newValue >= 80) return 100;
    return 50;
  }

  function getRequiredXp(newValue: number): number {
    if (newValue >= 95) return 20000;
    if (newValue >= 90) return 10000;
    if (newValue >= 85) return 5000;
    if (newValue >= 80) return 2000;
    return 500;
  }

  function getEffectiveStat(stat: string): number {
    const base = (player as any)?.[stat] || 0;
    const upg = (player?.upgrade_levels || {})[stat] || 0;
    return base + upg;
  }

  function getMaxEffectiveStat(): number {
    if (!player) return 99;
    const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
    let max = 0;
    for (const s of stats) {
      const val = getEffectiveStat(s);
      if (val > max) max = val;
    }
    return Math.max(99, max);
  }

  const handleUpgrade = async (stat: string) => {
    if (!player || !player.is_owned) return;
    setUpgrading(stat);
    try {
      const res = await fetch("/api/game/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownedPlayerId: player._id, stat }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setPlayer((prev: any) => {
          if (!prev) return prev;
          const newLevels = { ...(prev.upgrade_levels || {}), [stat]: data.upgradeLevel };
          const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
          let total = 0;
          const updates: Record<string, number> = {};
          for (const s of stats) {
            const base = prev[s] || 0;
            const upg = newLevels[s] || 0;
            const eff = base + upg;
            updates[`effective_${s}`] = eff;
            total += eff;
          }
          return {
            ...prev,
            upgrade_levels: newLevels,
            effective_overall: Math.round(total / 6),
            ...Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v])),
          };
        });
        setGameUser((prev: any) => ({ ...prev, coins: data.coins, xp: data.xp }));
      } else {
        toast.error(data.message || "Upgrade failed");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setUpgrading(null);
    }
  };

  // ─── Stat bar with upgrade button ───────────────────────────────────────

  function StatBar({ label, stat, maxStat }: { label: string; stat: string; maxStat: number }) {
    if (!player) return null;
    const effective = getEffectiveStat(stat);
    const upg = (player?.upgrade_levels || {})[stat] || 0;
    const newVal = effective + 1;
    const coinCost = getCoinCost(newVal);
    const requiredXp = getRequiredXp(newVal);
    const hasEnoughXp = (gameUser?.xp || 0) >= requiredXp;
    const hasEnoughCoins = (gameUser?.coins || 0) >= coinCost;
    const canAfford = hasEnoughXp && hasEnoughCoins;
    const isUpgrading = upgrading === stat;

    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
        <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(effective / maxStat) * 100}%`,
              backgroundColor: effective >= 80 ? "#22c55e" : effective >= 60 ? "#e09225" : "#ef4444",
            }}
          />
        </div>
        <div className="flex items-center gap-1 w-24 shrink-0">
          <span className="text-xs font-bold text-white tabular-nums">{effective}</span>
          {upg > 0 && (
            <span className="text-[10px] text-green-400">(+{upg})</span>
          )}
        </div>
        {player.is_owned && (
          <button
            onClick={() => handleUpgrade(stat)}
            disabled={!canAfford || isUpgrading}
            className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              canAfford
                ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 cursor-pointer"
                : "bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed opacity-50"
            }`}
            title={`${coinCost} coins • ${requiredXp} XP required`}
          >
            {isUpgrading ? (
              <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <Coins className="w-3 h-3" />
                {coinCost}
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <SkeletonDetail />
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Failed to load player"
        message={loadError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!player) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Player not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Wallet */}
        {gameUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400 tabular-nums">
                  {gameUser.coins?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-gray-600">coins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">XP</span>
                </div>
                <span className="text-sm font-bold text-purple-400 tabular-nums">
                  {gameUser.xp?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-gray-600">XP</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>Rating {gameUser.rating || "-"}</span>
            </div>
          </motion.div>
        )}

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${getRarityColor(player.rarity)}, transparent)`,
            }}
          />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/5 overflow-hidden shrink-0 border-2"
                style={{ borderColor: getRarityColor(player.rarity) }}
              >
                {player.image_url && (
                  <img src={player.image_url} alt={player.short_name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: `${getRarityColor(player.rarity)}20`,
                      color: getRarityColor(player.rarity),
                    }}
                  >
                    {player.rarity}
                  </span>
                  {player.is_owned && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Owned
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{player.short_name}</h1>
                <p className="text-gray-400 text-sm">{player.long_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-gray-500">{player.nationality}</span>
                  <span className="text-gray-600">•</span>
                  <div className="flex gap-1">
                    {player.positions?.map((pos: string) => (
                      <span key={pos} className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[10px] font-bold flex items-center gap-1">
                        {getPositionIcon(pos)} {pos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Overall */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {player.is_owned && player.effective_overall ? player.effective_overall : player.overall}
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {player.is_owned && player.effective_overall ? "Upgraded" : "Overall"}
                </p>
                {player.is_owned && player.effective_overall > player.overall && (
                  <p className="text-[10px] text-green-400">+{player.effective_overall - player.overall}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attributes with upgrade buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2"
        >
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Attributes</h3>
          <StatBar label="Pace" stat="pace" maxStat={getMaxEffectiveStat()} />
          <StatBar label="Shooting" stat="shooting" maxStat={getMaxEffectiveStat()} />
          <StatBar label="Passing" stat="passing" maxStat={getMaxEffectiveStat()} />
          <StatBar label="Dribbling" stat="dribbling" maxStat={getMaxEffectiveStat()} />
          <StatBar label="Defending" stat="defending" maxStat={getMaxEffectiveStat()} />
          <StatBar label="Physical" stat="physic" maxStat={getMaxEffectiveStat()} />

          {/* Upgrade info */}
          {player.is_owned && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>Click <span className="text-green-400 inline-flex items-center"><Plus className="w-3 h-3" /><Coins className="w-3 h-3" /></span> to upgrade a stat (+1 per click)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span>Cost: 50 → 100 → 200 → 500 → 1,000 coins per +1 (increases with stat value)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span>Requires <span className="text-amber-400">XP</span> gate — more XP needed for higher stats</span>
              </div>
              {player.total_upgrade_cost > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                  <Coins className="w-3 h-3" />
                  <span>Total invested: {player.total_upgrade_cost} coins</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Shop Info / Buy */}
        {!player.is_owned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Unlock Requirements</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Required XP</span>
                <span className={`font-bold ${gameUser?.xp >= player.required_xp ? "text-green-400" : "text-red-400"}`}>
                  {player.required_xp || 0} {gameUser ? `(You have ${gameUser.xp})` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Price</span>
                <span className={`font-bold ${gameUser?.coins >= player.price ? "text-green-400" : "text-red-400"}`}>
                  <Coins className="w-4 h-4 text-amber-400 inline" /> {player.price || 0} coins {gameUser ? `(You have ${gameUser.coins})` : ""}
                </span>
              </div>
              <button
                onClick={handleBuy}
                disabled={buying || !gameUser || gameUser.xp < player.required_xp || gameUser.coins < player.price}
                className="w-full mt-3 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {buying ? (
                  <div className="w-5 h-5 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Buy Player
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Owned actions */}
        {player.is_owned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <button
              onClick={() => router.push("/game/squad")}
              className="flex-1 py-3 bg-[#e09225]/10 border border-[#e09225]/30 text-[#e09225] font-bold rounded-xl hover:bg-[#e09225]/20 transition"
            >
              Add to Squad
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
