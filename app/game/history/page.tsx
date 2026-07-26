"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock, Trophy, Swords,
  ChevronLeft, ChevronRight,
  Zap, Target,
} from "lucide-react";
import { useMatchHistory } from "@/lib/game/hooks/useGameQuery";
import { ErrorState } from "@/app/game/_components";

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

// ─── Skeleton ───────────────────────────────────────────────────────────────
function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/5 rounded-xl p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 bg-white/5 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-white/5 rounded" />
              <div className="h-3 w-28 bg-white/5 rounded" />
            </div>
            <div className="w-16 h-4 bg-white/5 rounded shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Match Card ─────────────────────────────────────────────────────────────
function MatchCard({
  match,
  index,
  onClick,
}: {
  match: any;
  index: number;
  onClick: () => void;
}) {
  const isWin = match.result === "win";
  const isLoss = match.result === "loss";
  const accentColor = isWin ? "green" : isLoss ? "red" : "gray";

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      onClick={onClick}
      className="w-full text-left group"
    >
      <div
        className={`
          relative bg-white/[0.04] border rounded-xl p-4
          transition-all duration-200 hover:bg-white/[0.07]
          hover:-translate-y-0.5
          ${isWin ? "border-green-500/15 hover:border-green-500/25" : ""}
          ${isLoss ? "border-red-500/15 hover:border-red-500/25" : ""}
          ${!isWin && !isLoss ? "border-white/5 hover:border-white/10" : ""}
        `}
      >
        {/* Left accent bar */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full ${
            isWin ? "bg-green-500" : isLoss ? "bg-red-500" : "bg-gray-500"
          }`}
        />

        <div className="flex items-center gap-4 pl-3">
          {/* Score block */}
          <div className="shrink-0 flex flex-col items-center min-w-[64px]">
            <div
              className={`text-lg font-extrabold leading-none ${
                isWin ? "text-green-400" : isLoss ? "text-red-400" : "text-white"
              }`}
            >
              {match.userScore} – {match.opponentScore}
            </div>
            <span
              className={`mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                isWin
                  ? "bg-green-500/15 text-green-400"
                  : isLoss
                    ? "bg-red-500/15 text-red-400"
                    : "bg-gray-500/15 text-gray-400"
              }`}
            >
              {match.result}
            </span>
          </div>

          {/* Match info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              vs {match.opponentName}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#e09225]" />
                <span className="text-[#e09225]/80 font-medium">+{match.xpEarned} XP</span>
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400/70" />
                <span className="text-amber-400/80 font-medium">+{match.coinsEarned}</span>
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Target className="w-3 h-3" />
                {match.userShots}–{match.opponentShots} shots
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="shrink-0 flex items-center gap-1.5 text-[10px] text-gray-600">
            <Clock className="w-3 h-3" />
            <span className="whitespace-nowrap">{formatTimeAgo(match.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
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
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
          <div className="animate-pulse">
            <div className="h-7 w-36 bg-white/5 rounded-lg mb-1" />
            <div className="h-4 w-24 bg-white/5 rounded" />
          </div>
          <HistorySkeleton />
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
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#e09225]" />
              Match History
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {pagination?.total || 0} match{pagination?.total !== 1 ? "es" : ""} played
            </p>
          </div>
        </div>

        {/* ── Matches list ── */}
        {matches.length === 0 ? (
          <div className="text-center py-16">
            <Swords className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No matches yet</h3>
            <p className="text-gray-600 text-sm mb-6">Play your first match to see it here</p>
            <button
              onClick={() => router.push("/game/play")}
              className="px-6 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition"
            >
              Play Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {matches.map((match: any, i: number) => (
              <MatchCard
                key={match.id}
                match={match}
                index={i}
                onClick={() => router.push(`/game/match/${match.id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, and surrounding pages
                  return (
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - page) <= 1
                  );
                })
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-2">
                      {showEllipsis && (
                        <span className="text-gray-600 text-sm">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          p === page
                            ? "bg-[#e09225]/20 text-[#e09225] border border-[#e09225]/30"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasMore}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
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
