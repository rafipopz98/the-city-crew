"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Lock, Check,
  ShoppingCart, Plus, Coins, TrendingUp,
  Info, Swords,
} from "lucide-react";
import {
  ErrorState, SkeletonDetail,
  PlayerCardBackground, getRarityTheme,
} from "@/app/game/_components";
import { toast } from "sonner";

// ─── Cost helpers ──────────────────────────────────────────────────────────
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

const STATS_CONFIG = [
  { key: "pace", label: "Pace", short: "PAC" },
  { key: "shooting", label: "Shooting", short: "SHO" },
  { key: "passing", label: "Passing", short: "PAS" },
  { key: "dribbling", label: "Dribbling", short: "DRI" },
  { key: "defending", label: "Defending", short: "DEF" },
  { key: "physic", label: "Physical", short: "PHY" },
];

// ─── Individual stat upgrade row ───────────────────────────────────────────
function StatUpgradeRow({
  label,
  statKey,
  baseValue,
  upgradeLevel,
  gameUserXp,
  gameUserCoins,
  onUpgrade,
  isUpgrading,
}: {
  label: string;
  statKey: string;
  baseValue: number;
  upgradeLevel: number;
  gameUserXp: number;
  gameUserCoins: number;
  onUpgrade: () => void;
  isUpgrading: boolean;
}) {
  const effective = baseValue + upgradeLevel;
  const nextValue = effective + 1;
  const coinCost = getCoinCost(nextValue);
  const requiredXp = getRequiredXp(nextValue);
  const meetsXp = gameUserXp >= requiredXp;
  const meetsCoins = gameUserCoins >= coinCost;
  const canUpgrade = meetsXp && meetsCoins;

  // Color the bar based on current stat value
  const barColor =
    effective >= 85 ? "#22c55e" : effective >= 70 ? "#e09225" : "#ef4444";
  const barPct = Math.min((effective / 99) * 100, 100);

  return (
    <div className="group">
      <div className="flex items-center gap-3 py-2.5">
        {/* Stat label */}
        <span className="text-xs font-bold text-gray-400 w-16 shrink-0 uppercase tracking-wider">
          {label}
        </span>

        {/* Bar */}
        <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${barPct}%`,
              backgroundColor: barColor,
              boxShadow: `0 0 6px ${barColor}60`,
            }}
          />
        </div>

        {/* Value */}
        <div className="flex items-center gap-1 w-16 shrink-0">
          <span className="text-sm font-extrabold text-white tabular-nums">
            {effective}
          </span>
          {upgradeLevel > 0 && (
            <span className="text-[9px] text-green-400 font-bold">+{upgradeLevel}</span>
          )}
        </div>

        {/* Upgrade button */}
        <button
          onClick={onUpgrade}
          disabled={!canUpgrade || isUpgrading}
          className={`shrink-0 flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[9px] font-bold transition-all ${
            canUpgrade && !isUpgrading
              ? "bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 hover:border-green-500/50 cursor-pointer active:scale-95"
              : "bg-white/[0.03] border border-white/5 text-gray-600 cursor-not-allowed"
          }`}
          title={`${coinCost} coins • ${requiredXp} XP required`}
        >
          {isUpgrading ? (
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          ) : canUpgrade ? (
            <>
              <Plus className="w-3 h-3" />
              <span className="mt-0.5">{coinCost}</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span className="mt-0.5">{!meetsXp ? "XP" : "Coin"}</span>
            </>
          )}
        </button>
      </div>

      {/* Cost/reason helper — always visible when blocked, hover for cost preview */}
      <div className={`flex items-center gap-3 pl-16 text-[10px] transition-all duration-200 ${
        canUpgrade ? 'h-0 overflow-hidden group-hover:h-5' : 'h-5'
      }`}>
        {canUpgrade ? (
          <span>
            Next: <span className="text-amber-400/80">✦{coinCost}</span> coins · <span className="text-purple-400/80">{requiredXp} XP</span>
          </span>
        ) : !meetsXp ? (
          <span className="text-red-400/60 flex items-center gap-1">
            <span>⚠</span> Need <strong>{requiredXp}</strong> XP (you have {gameUserXp})
          </span>
        ) : (
          <span className="text-red-400/60 flex items-center gap-1">
            <span>⚠</span> Need <strong>{coinCost}</strong> coins (you have {gameUserCoins})
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
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

  const theme = player ? getRarityTheme(player.rarity) : null;
  const isOwned = player?.is_owned;

  // ─── Loading ──
  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <SkeletonDetail />
      </div>
    );
  }

  // ─── Error ──
  if (loadError) {
    return (
      <ErrorState title="Failed to load player" message={loadError} onRetry={() => window.location.reload()} />
    );
  }

  // ─── Not found ──
  if (!player) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Player not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        {/* ── Back + Wallet ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {gameUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-600">XP</span>
                <span className="text-xs font-bold text-purple-400 tabular-nums">
                  {gameUser.xp?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 tabular-nums">
                  {gameUser.coins?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Player Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border"
          style={{ borderColor: theme?.border || "white/10" }}
        >
          <PlayerCardBackground rarity={player.rarity} locked={!isOwned} />
          {isOwned && <div className="absolute inset-0 bg-green-500/[0.03] pointer-events-none" />}

          <div className="relative p-5 flex items-center gap-5">
            {/* Image */}
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 ring-2 flex items-center justify-center"
              style={{ '--tw-ring-color': theme?.accent || "white/10", backgroundColor: `${theme?.accent}15` } as React.CSSProperties}
            >
              {player.image_url ? (
                <img src={player.image_url} alt={player.short_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white/30" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${theme?.accent}25`, color: theme?.accent }}
                >
                  {player.rarity}
                </span>
                {isOwned ? (
                  <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Owned
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-gray-500 text-[9px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{player.short_name}</h1>
              <p className="text-gray-400 text-xs md:text-sm">{player.long_name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-500">{player.nationality}</span>
                <span className="text-gray-600">·</span>
                <div className="flex gap-1">
                  {player.positions?.map((pos: string) => (
                    <span
                      key={pos}
                      className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 text-[9px] font-bold"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall rating */}
            <div className="text-center shrink-0">
              <div
                className="text-3xl md:text-4xl font-bold leading-none"
                style={{ color: theme?.accent }}
              >
                {isOwned && player.effective_overall ? player.effective_overall : player.overall}
              </div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">
                {isOwned && player.effective_overall && player.effective_overall > player.overall
                  ? "Upgraded"
                  : "Overall"}
              </p>
              {isOwned && player.effective_overall > player.overall && (
                <p className="text-[10px] text-green-400 font-bold">
                  +{player.effective_overall - player.overall}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Upgrade Section (only for owned players) ── */}
        {isOwned ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Upgrade header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#e09225]" />
                Training & Upgrades
              </h2>
              {player.total_upgrade_cost > 0 && (
                <span className="text-[10px] text-amber-400/80 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {player.total_upgrade_cost.toLocaleString()} invested
                </span>
              )}
            </div>

            {/* Stats grid */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
              {STATS_CONFIG.map(({ key, label }) => (
                <StatUpgradeRow
                  key={key}
                  label={label}
                  statKey={key}
                  baseValue={player[key] || 0}
                  upgradeLevel={player.upgrade_levels?.[key] || 0}
                  gameUserXp={gameUser?.xp || 0}
                  gameUserCoins={gameUser?.coins || 0}
                  onUpgrade={() => handleUpgrade(key)}
                  isUpgrading={upgrading === key}
                />
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-[#e09225] shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-500 space-y-1">
                  <p>
                    <strong className="text-gray-400">How it works:</strong> Click the
                    green <Plus className="w-3 h-3 inline" /> button next to any stat
                    to train it. Each click adds +1 to that stat.
                  </p>
                  <p>
                    <span className="text-amber-400/80">Costs</span> increase as the
                    stat gets higher: 50 → 100 → 200 → 500 → 1,000 coins per +1.
                  </p>
                  <p>
                    <span className="text-purple-400/80">XP gate</span> — you need
                    enough total XP to unlock higher stat thresholds. XP is{' '}
                    <strong>not</strong> consumed.
                  </p>
                  <p>
                    Hover over each stat row to see the exact cost and XP requirement
                    for the next upgrade.
                  </p>
                </div>
              </div>
            </div>

            {/* Add to Squad */}
            <button
              onClick={() => router.push("/game/squad")}
              className="w-full py-3 rounded-xl bg-[#e09225]/10 border border-[#e09225]/30 text-[#e09225] font-bold text-sm hover:bg-[#e09225]/20 transition flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              Add to Squad
            </button>
          </motion.div>
        ) : (
          /* ── Unlock section (for non-owned players) ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.04] border border-white/10 rounded-xl p-5 space-y-4"
          >
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#e09225]" />
              Unlock Player
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Required XP</span>
                <span className={`font-bold text-sm ${(gameUser?.xp || 0) >= (player.required_xp || 0) ? "text-green-400" : "text-red-400"}`}>
                  {player.required_xp || 0}
                  <span className="text-gray-600 text-xs ml-1">
                    (You have {gameUser?.xp || 0})
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Price</span>
                <span className={`font-bold text-sm ${(gameUser?.coins || 0) >= (player.price || 0) ? "text-green-400" : "text-red-400"}`}>
                  <Coins className="w-4 h-4 text-amber-400 inline -mt-0.5" /> {player.price || 0}
                  <span className="text-gray-600 text-xs ml-1">
                    (You have {gameUser?.coins || 0})
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400">Positions</span>
                <span className="text-sm text-white font-medium">
                  {player.positions?.join(" · ") || "-"}
                </span>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={
                buying ||
                !gameUser ||
                (gameUser?.xp || 0) < (player.required_xp || 0) ||
                (gameUser?.coins || 0) < (player.price || 0)
              }
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e09225] to-[#d4821a] text-[#0a1628] font-bold text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {buying ? (
                <div className="w-5 h-5 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {!gameUser || (gameUser?.xp || 0) < (player.required_xp || 0)
                    ? "XP too low"
                    : (gameUser?.coins || 0) < (player.price || 0)
                      ? "Not enough coins"
                      : "Buy Player"}
                </>
              )}
            </button>

            {/* Stats preview for locked players */}
            <div className="pt-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">Base Stats</p>
              <div className="grid grid-cols-3 gap-2">
                {STATS_CONFIG.map(({ key, short }) => (
                  <div key={key} className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                    <span className="text-[8px] text-gray-500 uppercase block">{short}</span>
                    <span className="text-sm font-bold text-white">{player[key] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
