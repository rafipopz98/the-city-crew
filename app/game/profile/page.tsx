"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Trophy,
  Star,
  TrendingUp,
  Swords,
  Shield,
  Zap,
  Award,
  BarChart3,
} from "lucide-react";
import { useGameUser } from "@/lib/game/hooks/useGameQuery";
import { SkeletonStats } from "@/app/game/_components";
import { ErrorState } from "@/app/game/_components";

function Target(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGameUser();
  const gameUser = data?.gameUser;

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-white/5 mb-4" />
            <div className="h-6 w-32 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-20 bg-white/5 rounded" />
          </div>
          <SkeletonStats />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !gameUser) {
    return (
      <ErrorState
        title="Failed to load profile"
        message={error?.message || "Could not load your profile data"}
        onRetry={() => refetch()}
      />
    );
  }

  const winRate = gameUser.total_matches > 0
    ? ((gameUser.total_wins / gameUser.total_matches) * 100).toFixed(1)
    : "0";

  const stats = [
    { label: "Matches", value: gameUser.total_matches, icon: Swords, color: "text-green-400" },
    { label: "Wins", value: gameUser.total_wins, icon: Trophy, color: "text-green-400" },
    { label: "Losses", value: gameUser.total_losses, icon: Swords, color: "text-red-400" },
    { label: "Draws", value: gameUser.total_draws, icon: Swords, color: "text-amber-400" },
    { label: "Goals For", value: gameUser.goals_scored, icon: Target, color: "text-blue-400" },
    { label: "Goals Against", value: gameUser.goals_conceded, icon: Shield, color: "text-red-400" },
    { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-[#e09225]" },
    { label: "Best Streak", value: gameUser.longest_streak || 0, icon: Zap, color: "text-purple-400" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-[#e09225]/20 to-[#e09225]/5 border-2 border-[#e09225]/30 flex items-center justify-center">
            <User className="w-10 h-10 text-[#e09225]" />
          </div>
          <h1 className="text-2xl font-bold text-white">{gameUser.username}</h1>
          <p className="text-gray-500 text-sm">TCC Manager</p>
        </motion.div>

        {/* XP & Coins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <Star className="w-5 h-5 text-[#e09225] mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{gameUser.xp}</p>
            <p className="text-xs text-gray-500">Total XP</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{gameUser.coins}</p>
            <p className="text-xs text-gray-500">Coins</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Career Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white/5 rounded-xl p-3 border border-white/5 text-center"
              >
                <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <button
            onClick={() => router.push("/game/collection")}
            className="w-full p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/2 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Collection</p>
                <p className="text-gray-500 text-xs">View all your players</p>
              </div>
            </div>
            <span className="text-gray-600">{gameUser.ownedCount || 0} owned</span>
          </button>

          <button
            onClick={() => router.push("/game/squad")}
            className="w-full p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/2 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Squad</p>
                <p className="text-gray-500 text-xs">Manage your lineup</p>
              </div>
            </div>
            <span className="text-gray-600">{gameUser.hasSquad ? "Active" : "Not set"}</span>
          </button>
        </motion.div>

        {/* Version */}
        <p className="text-center text-xs text-gray-600">
          TCC Manager v1.0 • The City Crew
        </p>
      </div>
    </div>
  );
}
