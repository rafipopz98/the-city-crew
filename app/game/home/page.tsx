"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  Library,
  Trophy,
  TrendingUp,
  Star,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Bot,
  Globe,
} from "lucide-react";
import { useGameUser } from "@/lib/game/hooks/useGameQuery";
import { SkeletonStats } from "@/app/game/_components";
import { ErrorState } from "@/app/game/_components";

export default function GameHomePage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGameUser();

  const gameUser = data?.gameUser;

  // Redirect to onboarding if needed
  useEffect(() => {
    if (gameUser && !gameUser.has_completed_onboarding) {
      router.push("/game/onboarding");
    }
  }, [gameUser, router]);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-7 w-48 bg-white/5 rounded-lg mb-2" />
            <div className="h-4 w-32 bg-white/5 rounded" />
          </div>
          <SkeletonStats />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !gameUser) {
    return (
      <ErrorState
        title="Failed to load"
        message={error?.message || "Could not load your profile"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!gameUser.has_completed_onboarding) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">Setting up your account...</p>
      </div>
    );
  }

  const quickActions = [
    {
      label: "Shop",
      icon: Store,
      href: "/game/shop",
      color: "from-purple-500/20 to-purple-600/10",
      border: "border-purple-500/30",
      textColor: "text-purple-400",
      description: "Buy new players",
    },
    {
      label: "Upgrade",
      icon: TrendingUp,
      href: "/game/upgrade",
      color: "from-emerald-500/20 to-emerald-600/10",
      border: "border-emerald-500/30",
      textColor: "text-emerald-400",
      description: "Boost player stats",
    },
    {
      label: "Collection",
      icon: Library,
      href: "/game/collection",
      color: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30",
      textColor: "text-blue-400",
      description: "View your players",
    },
    {
      label: "Squad",
      icon: Trophy,
      href: "/game/squad",
      color: "from-amber-500/20 to-amber-600/10",
      border: "border-amber-500/30",
      textColor: "text-amber-400",
      description: "Manage your lineup",
    },
    {
      label: "Leaderboard",
      icon: BarChart3,
      href: "/game/leaderboard",
      color: "from-rose-500/20 to-rose-600/10",
      border: "border-rose-500/30",
      textColor: "text-rose-400",
      description: "Top managers ranking",
    },
    {
      label: "How to Play",
      icon: HelpCircle,
      href: "/game/how-to-play",
      color: "from-gray-500/20 to-gray-600/10",
      border: "border-gray-500/30",
      textColor: "text-gray-400",
      description: "Learn the game",
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-[#e09225]">{gameUser.username}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Ready for your next match?</p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-[#e09225] mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">XP</span>
            </div>
            <p className="text-2xl font-bold text-white">{gameUser.xp}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Coins</span>
            </div>
            <p className="text-2xl font-bold text-white">{gameUser.coins}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Matches</span>
            </div>
            <p className="text-2xl font-bold text-white">{gameUser.total_matches}</p>
          </div>
        </motion.div>

        {/* Play Now — two CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => router.push("/game/play")}
            className="relative p-5 rounded-xl bg-linear-to-br from-green-500/25 to-green-600/10 border border-green-500/30 hover:bg-green-500/5 transition-all group text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green-500/5 blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center mb-3">
                <Bot className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-white font-bold text-lg">Play Bot</p>
              <p className="text-gray-500 text-sm mt-0.5">Quick match vs AI</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400/80 font-medium">
                <span>Instant match</span>
                <span className="text-gray-600">•</span>
                <span>Earn rewards</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/game/play/pvp")}
            className="relative p-5 rounded-xl bg-linear-to-br from-blue-500/25 to-blue-600/10 border border-blue-500/30 hover:bg-blue-500/5 transition-all group text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-3">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-white font-bold text-lg">Play Online</p>
              <p className="text-gray-500 text-sm mt-0.5">Real-time PvP match</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-400/80 font-medium">
                <span>Live opponent</span>
                <span className="text-gray-600">•</span>
                <span>Higher rewards</span>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => router.push(action.href)}
                className={`relative p-4 rounded-xl bg-linear-to-br ${action.color} border ${action.border} hover:bg-white/2 transition-all group text-left`}
              >
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 ${action.textColor}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="text-white font-semibold text-sm">{action.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{action.description}</p>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Match History */}
        {gameUser.total_matches > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push("/game/history")}
            className="w-full bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all group text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Match History</h3>
              <span className="text-xs text-[#e09225] group-hover:underline">
                View All
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-300">Wins: <strong className="text-white">{gameUser.total_wins}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-300">Losses: <strong className="text-white">{gameUser.total_losses}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-gray-300">Draws: <strong className="text-white">{gameUser.total_draws}</strong></span>
              </div>
            </div>
          </motion.button>
        )}
      </div>
    </div>
  );
}
