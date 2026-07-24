"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Flame,
  Loader2,
  Clock,
  Target,
  Crown,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Brain,
  Users,
} from "lucide-react";
import api from "@/lib/api/axios";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  score: number;
  completionTimeMs: number;
  streak: number;
  totalCorrect?: number;
  bestTime?: number;
  badges: string[];
  dailyWins?: number;
};

type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  period: string;
};

const PERIOD_TABS = [
  { id: "daily", label: "Daily", icon: Clock },
  { id: "weekly", label: "Weekly", icon: TrendingUp },
  { id: "all_time", label: "All Time", icon: Trophy },
];

const BADGE_ICONS: Record<string, typeof Sparkles> = {
  first_challenge: Sparkles,
  first_perfect: Crown,
  streak_7: Flame,
  streak_30: Zap,
  "100_correct": Brain,
};

const BADGE_COLORS: Record<string, string> = {
  first_challenge: "#7c3aed",
  first_perfect: "#d97706",
  streak_7: "#ea580c",
  streak_30: "#ca8a04",
  "100_correct": "#059669",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(millis / 100)}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#e09225]/15 flex items-center justify-center shrink-0">
        <Crown size={16} className="text-[#e09225]" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#06182e]/6 flex items-center justify-center shrink-0">
        <Medal size={16} className="text-[#64748b]" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#b45309]/10 flex items-center justify-center shrink-0">
        <Medal size={16} className="text-[#b45309]" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#06182e]/5 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-[#06182e]/40">{rank}</span>
    </div>
  );
}

/* ── Skeletons ─────────────────────────────────────────── */

function RankBannerSkeleton() {
  return (
    <div className="bg-[#e09225]/8 border border-[#06182e]/5 rounded-xl px-4 sm:px-5 py-3.5 mb-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#06182e]/8" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-16 rounded bg-[#06182e]/8" />
            <div className="h-3.5 w-10 rounded bg-[#06182e]/10" />
          </div>
        </div>
        <div className="h-8 w-16 rounded-xl bg-[#06182e]/8" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-[#06182e]/6 shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 w-28 rounded bg-[#06182e]/8" />
        <div className="h-2.5 w-20 rounded bg-[#06182e]/6" />
      </div>
      <div className="hidden sm:flex items-center gap-1">
        <div className="w-6 h-6 rounded-md bg-[#06182e]/6" />
        <div className="w-6 h-6 rounded-md bg-[#06182e]/6" />
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <>
      <RankBannerSkeleton />
      <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 overflow-hidden divide-y divide-[#06182e]/5">
        {Array.from({ length: 8 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState("daily");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/daily-challenge/leaderboard");
      return;
    }
    fetchLeaderboard(activePeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, activePeriod]);

  const fetchLeaderboard = async (period: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(
        `/daily-challenge/leaderboard?period=${period}&page=1&limit=50`,
      );
      setData(res.data);
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  // Only the auth check blocks the whole screen — everything else
  // below renders immediately and loads section-by-section.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full bg-[#e09225]/15 animate-ping" />
            <div className="relative w-12 h-12 rounded-full bg-[#e09225] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#06182e]" />
            </div>
          </div>
          <p className="text-sm text-[#06182e]/50 para">Checking you in…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFF5E5]">
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-10 mx-auto max-w-2xl">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push("/daily-challenge")}
            className="p-2 rounded-xl text-[#06182e]/40 hover:text-[#06182e] hover:bg-[#e09225]/10 transition-all"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="text-xl leading-none text-[#06182e] font-bold uppercase tracking-widest">
              Leaderboard
            </h1>
            <p className="text-xs text-[#06182e]/40 para mt-1">
              See where you rank among all players
            </p>
          </div>
        </div>

        {/* ── Period tabs ─────────────────────────────────── */}
        <div className="flex bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-1 mb-4">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePeriod(tab.id)}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold para transition-all disabled:cursor-not-allowed ${
                activePeriod === tab.id
                  ? "bg-[#e09225] text-[#FFF5E5] shadow-sm"
                  : "text-[#06182e]/40 hover:text-[#06182e] disabled:hover:text-[#06182e]/40"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Section: rank banner + list ──────────────────── */}
        {error ? (
          <div className="flex flex-col items-center gap-4 text-center bg-[#e09225]/8 border border-[#e09225]/12 rounded-xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
              <AlertCircle size={24} className="text-[#e09225]" />
            </div>
            <div>
              <p className="text-base font-bold text-[#06182e]">
                Couldn't load the leaderboard
              </p>
              <p className="text-sm text-[#06182e]/45 mt-1 para">
                Something went wrong on our end. Give it another try.
              </p>
            </div>
            <button
              onClick={() => fetchLeaderboard(activePeriod)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : loading ? (
          <LeaderboardSkeleton />
        ) : (
          <>
            {/* Your rank */}
            {data?.currentUserRank && data.currentUserRank > 0 && (
              <div className="bg-[#e09225]/8 border border-[#e09225]/12 rounded-xl px-4 sm:px-5 py-3.5 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#e09225]/15 flex items-center justify-center">
                      <Target size={16} className="text-[#e09225]" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#06182e]/40 para">
                        Your rank
                      </p>
                      <p className="text-base font-bold text-[#06182e]">
                        #{data.currentUserRank}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/daily-challenge/profile")}
                    className="px-4 py-2 rounded-xl bg-[#e09225] text-[#FFF5E5] text-xs font-bold hover:brightness-110 transition-all"
                  >
                    Profile
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 overflow-hidden">
              {!data || data.leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5E5] flex items-center justify-center mb-2.5">
                    <Users size={20} className="text-[#e09225]/50" />
                  </div>
                  <p className="text-sm font-bold text-[#06182e]/50">
                    No rankings yet
                  </p>
                  <p className="text-xs text-[#06182e]/35 para mt-1 max-w-xs">
                    Complete a challenge to get on the board.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#06182e]/5">
                  {data.leaderboard.map((entry) => {
                    const isCurrentUser = entry.userId === user?.id;

                    return (
                      <div
                        key={`${entry.rank}-${entry.userId}`}
                        className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 transition-colors ${
                          isCurrentUser
                            ? "bg-[#e09225]/12"
                            : "hover:bg-[#e09225]/12"
                        }`}
                      >
                        <RankBadge rank={entry.rank} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#06182e] truncate">
                              {entry.username}
                            </p>
                            {entry.streak > 0 && (
                              <div className="flex items-center gap-0.5 text-[11px] text-[#ea580c] shrink-0">
                                <Flame size={11} />
                                <span className="tabular-nums">
                                  {entry.streak}
                                </span>
                              </div>
                            )}
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e09225] text-[#FFF5E5] font-bold shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#06182e]/40 para mt-0.5">
                            <span className="tabular-nums">
                              {entry.score}
                              {activePeriod === "daily" ? "/5" : ""} pts
                            </span>
                            {entry.completionTimeMs > 0 && (
                              <span className="tabular-nums">
                                {formatTime(entry.completionTimeMs)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badge icons */}
                        {entry.badges.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1">
                            {entry.badges.slice(0, 3).map((badge) => {
                              const Icon = BADGE_ICONS[badge] || Sparkles;
                              const color =
                                BADGE_COLORS[badge] || "rgba(6,24,46,0.3)";
                              return (
                                <div
                                  key={badge}
                                  className="p-1 rounded-md"
                                  style={{ backgroundColor: `${color}1A` }}
                                  title={badge}
                                >
                                  <Icon size={11} style={{ color }} />
                                </div>
                              );
                            })}
                            {entry.badges.length > 3 && (
                              <span className="text-[10px] text-[#06182e]/30 ml-0.5">
                                +{entry.badges.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
