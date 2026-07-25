"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Zap, Swords, User, Lock, Check, ShoppingCart, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function PlayerDetailPage() {
  const { playerId } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameUser, setGameUser] = useState<any>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/game/collection", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/game/user", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([collData, userData]) => {
        const found = collData.collection?.find(
          (p: any) => p._id === playerId || p.player_id?.toString() === playerId,
        );
        setPlayer(found || null);
        setGameUser(userData.gameUser || null);
      })
      .catch(console.error)
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Player not found</p>
      </div>
    );
  }

  const statBar = (label: string, value: number, max = 99) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: value >= 80 ? "#22c55e" : value >= 60 ? "#e09225" : "#ef4444",
          }}
        />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{value}</span>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
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
          {/* Rarity gradient background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${getRarityColor(player.rarity)}, transparent)`,
            }}
          />

          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              {/* Image */}
              <div className="w-24 h-24 rounded-full bg-white/5 overflow-hidden shrink-0 border-2"
                style={{ borderColor: getRarityColor(player.rarity) }}
              >
                {player.image_url && (
                  <img src={player.image_url} alt={player.short_name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info */}
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
                <div className="text-4xl font-bold text-white">{player.overall}</div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Overall</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attributes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2"
        >
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Attributes</h3>
          {statBar("Pace", player.pace)}
          {statBar("Shooting", player.shooting)}
          {statBar("Passing", player.passing)}
          {statBar("Dribbling", player.dribbling)}
          {statBar("Defending", player.defending)}
          {statBar("Physical", player.physic)}
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
                  🪙 {player.price || 0} coins {gameUser ? `(You have ${gameUser.coins})` : ""}
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
