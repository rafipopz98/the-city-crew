"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  Zap,
  Swords,
  Target,
  Medal,
  Star,
  Flame,
  Crown,
} from "lucide-react";
import { useLeaderboard } from "@/lib/game/hooks/useGameQuery";
import { ErrorState } from "@/app/game/_components";

interface Tab {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const TABS: Tab[] = [
  { id: "xp", label: "XP", icon: Star, color: "#e09225" },
  { id: "win_rate", label: "Win Rate", icon: TrendingUp, color: "#22c55e" },
  { id: "wins", label: "Wins", icon: Trophy, color: "#3b82f6" },
  { id: "streak", label: "Streak", icon: Flame, color: "#ef4444" },
  { id: "goals", label: "Goals", icon: Target, color: "#a855f7" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return (
    <span className="w-6 text-center text-sm font-bold text-gray-500">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("xp");
  const { data, isLoading, isError, error, refetch } = useLeaderboard(activeTab);

  const entries = data?.leaderboard || [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-500 text-sm">Top managers across all categories</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <tab.icon
                className="w-4 h-4"
                style={activeTab === tab.id ? { color: tab.color } : {}}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load leaderboard"
            message={error?.message || "Could not fetch rankings"}
            onRetry={() => refetch()}
          />
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No rankings yet</h3>
            <p className="text-gray-600 text-sm">Play some matches to appear on the leaderboard</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-2 text-[10px] text-gray-600 uppercase tracking-wider font-medium">
              <span className="w-8 shrink-0 text-center">#</span>
              <span className="flex-1">Manager</span>
              {activeTab === "xp" && <span className="w-16 text-right">XP</span>}
              {activeTab === "win_rate" && <span className="w-16 text-right">Rate</span>}
              {activeTab === "wins" && <span className="w-16 text-right">Wins</span>}
              {activeTab === "streak" && <span className="w-16 text-right">Streak</span>}
              {activeTab === "goals" && <span className="w-16 text-right">Goals</span>}
              <span className="w-12 text-right">W</span>
              <span className="w-12 text-right">M</span>
            </div>

            {entries.map((entry: any, i: number) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  i < 3
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white/[0.01] border-transparent"
                }`}
              >
                {/* Rank */}
                <div className="w-8 shrink-0 flex justify-center">
                  <RankBadge rank={entry.rank} />
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {entry.username}
                  </p>
                </div>

                {/* Primary stat */}
                {activeTab === "xp" && (
                  <span className="w-16 text-right text-sm font-bold text-[#e09225]">
                    {entry.xp}
                  </span>
                )}
                {activeTab === "win_rate" && (
                  <span className="w-16 text-right text-sm font-bold text-green-400">
                    {entry.winRate}%
                  </span>
                )}
                {activeTab === "wins" && (
                  <span className="w-16 text-right text-sm font-bold text-blue-400">
                    {entry.wins}
                  </span>
                )}
                {activeTab === "streak" && (
                  <span className="w-16 text-right text-sm font-bold text-red-400">
                    {entry.streak}
                  </span>
                )}
                {activeTab === "goals" && (
                  <span className="w-16 text-right text-sm font-bold text-purple-400">
                    {entry.goalsScored}
                  </span>
                )}

                {/* Wins / Matches */}
                <span className="w-12 text-right text-xs text-gray-500">{entry.wins}</span>
                <span className="w-12 text-right text-xs text-gray-500">{entry.matches}</span>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-[10px] text-gray-600">
          Updated live • Only players with completed onboarding are shown
        </p>
      </div>
    </div>
  );
}
