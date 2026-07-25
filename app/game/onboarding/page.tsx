"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, User, Sparkles, ArrowRight, Swords, Shield, Zap } from "lucide-react";

type Step = "welcome" | "username" | "reveal" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [starterPlayers, setStarterPlayers] = useState<any[]>([]);
  const [revealIndex, setRevealIndex] = useState(-1);
  const handleStart = () => {
    setStep("username");
  };

  const handleSubmitUsername = async () => {
    setError("");
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (username.length > 20) {
      setError("Username must be 20 characters or less");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Only letters, numbers, and underscores");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/game/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setStarterPlayers(data.starterPlayers || []);
      setStep("reveal");
      // Animate reveal one by one
      for (let i = 0; i < (data.starterPlayers?.length || 0); i++) {
        setTimeout(() => setRevealIndex(i), i * 600 + 500);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    router.push("/game/squad?onboarding=true");
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

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Basic: "#9ca3af", Common: "#6b7280", Uncommon: "#22c55e",
      Rare: "#06b6d4", Epic: "#a855f7", Legendary: "#f59e0b",
    };
    return colors[rarity] || "#9ca3af";
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-linear-to-br from-[#e09225]/20 to-[#e09225]/5 border-2 border-[#e09225]/30 flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-[#e09225]" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-white mb-3"
            >
              TCC Manager
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 mb-8"
            >
              Build your 5-a-side squad from Manchester City legends and current stars. 
              Play matches, earn rewards, and become the ultimate manager.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-[#e09225]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#e09225]" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Get 5 Starter Players</p>
                  <p className="text-gray-500 text-xs">Begin your journey with a random squad</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Swords className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Play 5v5 Matches</p>
                  <p className="text-gray-500 text-xs">Fast-paced manager simulation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Earn & Unlock Players</p>
                  <p className="text-gray-500 text-xs">Build your ultimate collection</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleStart}
              className="mt-8 w-full py-4 bg-[#e09225] text-[#0a1628] font-bold text-lg rounded-xl hover:bg-[#e09225]/90 transition flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {step === "username" && (
          <motion.div
            key="username"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-md w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e09225]/10 border-2 border-[#e09225]/30 flex items-center justify-center">
                <User className="w-8 h-8 text-[#e09225]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Username</h2>
              <p className="text-gray-400 text-sm">This will be displayed on leaderboards</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmitUsername()}
                  placeholder="Enter your username..."
                  maxLength={20}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#e09225]/50 text-lg"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                  {username.length}/20
                </span>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <button
                onClick={handleSubmitUsername}
                disabled={loading || username.length < 3}
                className="w-full py-4 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Claim Your Squad
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl w-full text-center"
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Your Starter Squad
            </motion.h2>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 mb-8"
            >
              Here are your 5 players to start your journey
            </motion.p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
              {starterPlayers.map((player: any, i: number) => (
                <motion.div
                  key={player._id}
                  initial={{ opacity: 0, y: 40, rotateY: 180 }}
                  animate={
                    revealIndex >= i
                      ? { opacity: 1, y: 0, rotateY: 0 }
                      : { opacity: 0, y: 40, rotateY: 180 }
                  }
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                >
                  <div className="aspect-3/4 rounded-xl bg-linear-to-b from-white/5 to-white/2 border border-white/10 overflow-hidden flex flex-col items-center justify-center p-2">
                    {/* Player Image */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 mb-2 overflow-hidden">
                      {player.image_url && (
                        <img
                          src={player.image_url}
                          alt={player.short_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Overall Rating */}
                    <div className="text-lg font-bold text-white">{player.overall}</div>

                    {/* Player Name */}
                    <p className="text-xs text-gray-300 font-medium truncate max-w-full px-1">
                      {player.short_name}
                    </p>

                    {/* Position Badge */}
                    <div className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-300 flex items-center gap-1">
                      {getPositionIcon(starterPlayers[i]?.position || "MID")}
                      {starterPlayers[i]?.position || "-"}
                    </div>

                    {/* Rarity bar */}
                    <div
                      className="mt-2 h-1 w-full rounded-full opacity-60"
                      style={{ backgroundColor: getRarityColor(player.rarity) }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={revealIndex >= starterPlayers.length - 1 ? { opacity: 1, y: 0 } : { opacity: 0 }}
              onClick={handleDone}
              className="px-8 py-4 bg-[#e09225] text-[#0a1628] font-bold text-lg rounded-xl hover:bg-[#e09225]/90 transition flex items-center gap-2 mx-auto"
            >
              Build Your Squad
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
