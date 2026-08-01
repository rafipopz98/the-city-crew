"use client";

import { useState } from "react";
import {
  Flame,
  Target,
  Trophy,
  Clock,
  Zap,
  Medal,
  Brain,
  Crown,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StatTile, TileSkeleton, ListSkeleton, EmptyState, timeAgo, formatBestTime } from "./ui";

type ChallengeHistoryItem = {
  id: string;
  title: string;
  challengeDate: string | null;
  score: number;
  totalQuestions: number;
  completionTimeMs: number | null;
  submittedAt: string | null;
};

export type ChallengesData = {
  summary: {
    username: string | null;
    firstName: string;
    lastName: string;
    joinedDate: string;
    streak: number;
    longestStreak: number;
    totalPoints: number;
    totalCorrect: number;
    challengesPlayed: number;
    dailyWins: number;
    badges: string[];
    bestTimeMs: number | null;
    bestTimeFormatted: string | null;
  };
  history: ChallengeHistoryItem[];
  totals: {
    played: number;
    averageScore: number;
    perfectRuns: number;
    totalScore: number;
  };
};

export function ChallengesTab({
  data,
  loading,
  error,
  onRetry,
}: {
  data: ChallengesData | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <TileSkeleton key={i} />
          ))}
        </div>
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 text-center bg-[#e09225]/8 border border-[#e09225]/12 rounded-2xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
          <AlertCircle size={24} className="text-[#e09225]" />
        </div>
        <div>
          <p className="text-base font-bold text-[#06182e]">
            Couldn&apos;t load challenge history
          </p>
          <p className="text-sm text-[#06182e]/45 mt-1 para">
            Something went wrong on our end.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  const { summary, history, totals } = data;
  const visibleHistory = showAll ? history : history.slice(0, 5);
  const wrongAnswers = Math.max(
    0,
    summary.challengesPlayed * 5 - summary.totalCorrect,
  );
  const accuracy =
    summary.challengesPlayed > 0
      ? Math.round(
          (summary.totalCorrect / (summary.challengesPlayed * 5)) * 100,
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Flame}
          label="Streak"
          value={summary.streak}
          suffix={summary.streak === 1 ? " day" : " days"}
          accent="#e09225"
        />
        <StatTile
          icon={Target}
          label="Accuracy"
          value={accuracy}
          suffix="%"
          accent="#0d9488"
          bg="bg-[#0d9488]/8"
        />
        <StatTile
          icon={Trophy}
          label="Perfect"
          value={totals.perfectRuns}
          accent="#7c3aed"
          bg="bg-[#7c3aed]/8"
        />
        <StatTile
          icon={Clock}
          label="Best time"
          value={formatBestTime(summary.bestTimeMs)}
          accent="#d97706"
          bg="bg-[#d97706]/8"
        />
      </div>

      {/* Detail rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={13} className="text-[#06182e]/30" />
            <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
              Challenge history
            </h3>
            <span className="ml-auto text-[11px] font-bold text-[#06182e]/30 para">
              {history.length} completed
            </span>
          </div>

          {history.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No challenges played yet"
              message="Play your first TCC Quiz challenge to start building your history."
              ctaLabel="Play today's challenge"
              onCta={() => router.push("/daily-challenge")}
            />
          ) : (
            <div className="divide-y divide-[#06182e]/6">
              {visibleHistory.map((h) => {
                const perfect = h.score === h.totalQuestions;
                return (
                  <div key={h.id} className="flex items-center gap-3 py-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        perfect ? "bg-[#7c3aed]/10" : "bg-[#e09225]/10"
                      }`}
                    >
                      {perfect ? (
                        <Crown size={17} className="text-[#7c3aed]" />
                      ) : (
                        <Zap size={17} className="text-[#e09225]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#06182e] leading-tight truncate">
                        {h.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#06182e]/40 para">
                          {h.challengeDate || timeAgo(h.submittedAt)}
                        </span>
                        {h.completionTimeMs != null && (
                          <>
                            <span className="text-[#06182e]/15">•</span>
                            <span className="text-xs text-[#06182e]/40 para">
                              {formatBestTime(h.completionTimeMs)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-lg font-bold leading-none tabular-nums ${
                          perfect ? "text-[#7c3aed]" : "text-[#06182e]"
                        }`}
                      >
                        {h.score}
                        <span className="text-xs text-[#06182e]/35 font-medium">
                          /{h.totalQuestions}
                        </span>
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide ${
                          perfect ? "text-[#7c3aed]" : "text-[#06182e]/35"
                        }`}
                      >
                        {perfect ? "Perfect" : "Done"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {history.length > 5 && (
                <button
                  onClick={() => setShowAll((s) => !s)}
                  className="w-full flex items-center justify-center gap-1.5 pt-3 pb-1 text-[11px] font-bold text-[#e09225] hover:text-[#c97f1e] transition-colors"
                >
                  {showAll ? "Show less" : `Show all ${history.length} attempts`}
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${showAll ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right column — extra stats */}
        <div className="space-y-3">
          <div className="bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={13} className="text-[#06182e]/30" />
              <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
                Answer breakdown
              </h3>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  icon: CheckCircle2,
                  label: "Correct",
                  value: summary.totalCorrect,
                  color: "#059669",
                },
                {
                  icon: XCircle,
                  label: "Wrong",
                  value: wrongAnswers,
                  color: "#dc2626",
                },
                {
                  icon: Medal,
                  label: "Longest streak",
                  value: `${summary.longestStreak}d`,
                  color: "#e09225",
                },
                {
                  icon: Trophy,
                  label: "Total points",
                  value: summary.totalPoints,
                  color: "#d97706",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FFF5E5]"
                >
                  <div className="flex items-center gap-2">
                    <row.icon size={12} style={{ color: row.color }} />
                    <span className="text-xs text-[#06182e]/55 para font-medium">
                      {row.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#06182e] tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Medal size={13} className="text-[#06182e]/30" />
              <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
                Badges
              </h3>
            </div>
            {summary.badges.length === 0 ? (
              <p className="text-xs text-[#06182e]/35 para">
                Play challenges to earn badges.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {summary.badges.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF5E5] text-[10px] text-[#06182e]/60 font-bold capitalize"
                  >
                    <Sparkles size={10} className="text-[#e09225]" />
                    {b.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push("/daily-challenge")}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#06182e]/10 text-[#06182e]/70 text-xs font-bold hover:bg-[#FFF5E5] hover:text-[#e09225] hover:border-[#e09225]/30 transition-all"
            >
              Play today&apos;s challenge
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
