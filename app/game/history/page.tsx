"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Trophy,
  Swords,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
} from "lucide-react";
import { useMatchHistory } from "@/lib/game/hooks/useGameQuery";
import { ErrorState } from "@/app/game/_components";

function ResultBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    win: "bg-green-500/15 text-green-400 border-green-500/30",
    loss: "bg-red-500/15 text-red-400 border-red-500/30",
    draw: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[result] || styles.draw}`}>
      {result}
    </span>
  );
}

function formatTimeAgo(dateStr: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MatchHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch } = useMatchHistory(page, limit);

  const matches = data?.matches || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
          <div className="animate-pulse">
            <div className="h-7 w-36 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-24 bg-white/5 rounded" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load match history"
        message={error?.message || "Could not fetch your matches"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Match History</h1>
            <p className="text-gray-500 text-sm">
              {pagination?.total || 0} match{pagination?.total !== 1 ? "es" : ""} played
            </p>
          </div>
          <button
            onClick={() => router.push("/game/home")}
            className="text-sm text-[#e09225] hover:underline"
          >
            Back to Home
          </button>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Swords className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No matches yet</h3>
            <p className="text-gray-600 text-sm mb-6">Play your first match to see it here</p>
            <button
              onClick={() => router.push("/game/play")}
              className="px-6 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition"
            >
              Play Now
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {matches.map((match: any, i: number) => (
              <motion.button
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/game/match/${match.id}`)}
                className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all group text-left"
              >
                {/* Result badge */}
                <div className="shrink-0">
                  <ResultBadge result={match.result} />
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 text-lg font-bold shrink-0">
                  <span className={match.result === "win" ? "text-green-400" : match.result === "loss" ? "text-red-400" : "text-white"}>
                    {match.userScore}
                  </span>
                  <span className="text-gray-600">-</span>
                  <span className={match.result === "loss" ? "text-green-400" : match.result === "win" ? "text-red-400" : "text-white"}>
                    {match.opponentScore}
                  </span>
                </div>

                {/* Opponent */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    vs {match.opponentName}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      +{match.xpEarned} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      +{match.coinsEarned} coins
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {match.userShots}-{match.opponentShots} shots
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-[10px] text-gray-600 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(match.createdAt)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasMore}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
