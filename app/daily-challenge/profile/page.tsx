"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Flame,
  Target,
  Trophy,
  Medal,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Crown,
  Zap,
  Brain,
  BadgeCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Shield,
  Gem,
  Lock,
  Gauge,
  Layers,
} from "lucide-react";
import api from "@/lib/api/axios";
import { useRouter } from "next/navigation";

type ProfileData = {
  profile: {
    username: string | null;
    firstName: string;
    lastName: string;
    email: string;
    joinedDate: string;
    streak: number;
    longestStreak: number;
    totalPoints: number;
    totalCorrect: number;
    challengesPlayed: number;
    averageAccuracy: number;
    bestTimeMs: number | null;
    bestTimeFormatted: string | null;
    dailyWins: number;
    badges: string[];
  };
  hasUsername: boolean;
};

const BADGE_META: Record<
  string,
  {
    icon: typeof Trophy;
    label: string;
    description: string;
    color: string;
  }
> = {
  first_challenge: {
    icon: Sparkles,
    label: "First Challenge",
    description: "Completed your first challenge",
    color: "#7c3aed",
  },
  first_perfect: {
    icon: Crown,
    label: "Perfect Score",
    description: "Scored 5/5 in a challenge",
    color: "#d97706",
  },
  streak_7: {
    icon: Flame,
    label: "7-Day Streak",
    description: "Played 7 consecutive days",
    color: "#ea580c",
  },
  streak_30: {
    icon: Zap,
    label: "30-Day Streak",
    description: "Played 30 consecutive days",
    color: "#ca8a04",
  },
  "100_correct": {
    icon: Brain,
    label: "100 Correct",
    description: "Answered 100 questions correctly",
    color: "#059669",
  },
};

/* ── Skeletons ─────────────────────────────────────────── */

function HeroSkeleton() {
  return (
    <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-5 sm:p-6 mb-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#06182e]/8 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-[#06182e]/8" />
            <div className="h-3 w-48 rounded bg-[#06182e]/6" />
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <div className="h-8 w-20 rounded-xl bg-[#06182e]/8" />
          <div className="h-8 w-24 rounded-xl bg-[#06182e]/8" />
        </div>
      </div>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-3.5"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="h-2 w-12 rounded bg-[#06182e]/8" />
            <div className="w-4 h-4 rounded bg-[#06182e]/8" />
          </div>
          <div className="h-7 w-16 rounded bg-[#06182e]/8" />
        </div>
      ))}
    </div>
  );
}

function StatsProgressSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-4 animate-pulse">
      <div className="lg:col-span-3 bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 sm:p-5">
        <div className="h-3 w-20 rounded bg-[#06182e]/8 mb-4" />
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-[#06182e]/6"
            />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 sm:p-5">
        <div className="h-3 w-16 rounded bg-[#06182e]/8 mb-6" />
        <div className="space-y-5">
          <div>
            <div className="h-4 w-28 rounded bg-[#06182e]/8 mb-2" />
            <div className="h-2 rounded-full bg-[#06182e]/8" />
          </div>
          <div>
            <div className="h-4 w-28 rounded bg-[#06182e]/8 mb-2" />
            <div className="h-2 rounded-full bg-[#06182e]/8" />
          </div>
          <div className="pt-3 border-t border-[#06182e]/8">
            <div className="h-4 w-24 rounded bg-[#06182e]/8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgesSkeleton() {
  return (
    <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 sm:p-5 animate-pulse">
      <div className="h-3 w-14 rounded bg-[#06182e]/8 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#06182e]/8" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-[#06182e]/8" />
              <div className="h-2 w-32 rounded bg-[#06182e]/6" />
            </div>
            <div className="w-4 h-4 rounded bg-[#06182e]/8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/daily-challenge/profile");
      return;
    }
    fetchProfile();
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/daily-challenge/profile");
      setData(res.data);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FFF5E5]">
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-10">
          <div className="flex flex-col items-center gap-4 text-center bg-[#e09225]/8 border border-[#e09225]/12 rounded-xl p-8 max-w-md mx-auto mt-12">
            <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
              <AlertCircle size={24} className="text-[#e09225]" />
            </div>
            <div>
              <p className="text-base font-bold text-[#06182e]">
                Couldn't load your profile
              </p>
              <p className="text-sm text-[#06182e]/45 mt-1 para">
                Something went wrong on our end. Give it another try.
              </p>
            </div>
            <button
              onClick={fetchProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile } = data;

  const joinDate = new Date(profile.joinedDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const wrongAnswers = Math.max(
    0,
    profile.challengesPlayed * 5 - profile.totalCorrect,
  );
  const earnedCount = profile.badges.length;
  const totalBadges = Object.keys(BADGE_META).length;

  const initials = profile.username
    ? profile.username.charAt(0).toUpperCase()
    : `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;

  return (
    <div className="min-h-screen bg-[#FFF5E5]">
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-10 mx-auto max-w-2xl">
        {/* ── Top CTAs ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-x-8 gap-y-3 mb-4">
          <button
            onClick={() => router.push("/daily-challenge")}
            className="group inline-flex items-center gap-2 text-base sm:text-lg font-bold text-[#06182e]/50 hover:text-[#e09225] transition-all"
          >
            <ExternalLink
              size={16}
              className="group-hover:scale-110 transition-transform shrink-0"
            />
            <span className="underline decoration-transparent hover:decoration-current underline-offset-4 transition-all duration-300">
              Play today's challenge
            </span>
            <ArrowUpRight
              size={17}
              className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </button>

          <button
            onClick={() => router.push("/daily-challenge/leaderboard")}
            className="group inline-flex items-center gap-2 text-base sm:text-lg font-bold text-[#06182e]/50 hover:text-[#e09225] transition-all"
          >
            <Trophy
              size={16}
              className="group-hover:scale-110 transition-transform shrink-0"
            />
            <span className="underline decoration-transparent hover:decoration-current underline-offset-4 transition-all duration-300">
              Leaderboard
            </span>
            <ArrowUpRight
              size={17}
              className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </button>
        </div>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#06182e]/8">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-xl text-[#06182e]/40 hover:text-[#06182e] hover:bg-[#e09225]/10 transition-all"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="text-xl leading-none text-[#06182e] font-bold uppercase tracking-widest">
              Profile
            </h1>
            <p className="text-xs text-[#06182e]/40 para mt-1">
              Your stats &amp; achievements
            </p>
          </div>
        </div>

        {/* ── Loaded Content ──────────────────────────────── */}
        {loading ? (
          <>
            <HeroSkeleton />
            <MetricsSkeleton />
            <StatsProgressSkeleton />
            <BadgesSkeleton />
          </>
        ) : data ? (
          <>
            {/* Hero identity */}
            <div className="relative overflow-hidden rounded-2xl bg-[#e09225]/10 px-5 sm:px-6 py-5 mb-4">
              <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#e09225]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#e09225]/8 blur-2xl" />

              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#e09225] to-[#c77415] flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xl sm:text-2xl font-bold text-[#06182e]">
                      {initials}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl text-[#06182e] font-bold leading-tight truncate">
                      {profile.username ||
                        `${profile.firstName} ${profile.lastName}`}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="text-xs text-[#06182e]/50 para flex items-center gap-1.5">
                        <Calendar size={12} />
                        Joined {joinDate}
                      </span>
                      <span className="text-xs text-[#06182e]/50 para flex items-center gap-1.5">
                        <Shield size={12} />
                        {profile.challengesPlayed === 1
                          ? "1 challenge"
                          : `${profile.challengesPlayed} challenges`}{" "}
                        completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#e09225]/15 border border-[#e09225]/20 rounded-xl px-3 py-1.5">
                    <Flame size={14} className="text-[#e09225]" />
                    <span className="text-sm font-bold text-[#06182e]">
                      {profile.streak}
                    </span>
                    <span className="text-[11px] text-[#06182e]/45 para">
                      streak
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#e09225]/15 border border-[#e09225]/20 rounded-xl px-3 py-1.5">
                    <Star size={14} className="text-[#e09225]" />
                    <span className="text-sm font-bold text-[#06182e]">
                      {profile.totalPoints}
                    </span>
                    <span className="text-[11px] text-[#06182e]/45 para">
                      points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                {
                  icon: Flame,
                  label: "Streak",
                  value: profile.streak,
                  suffix: profile.streak === 1 ? " day" : " days",
                  accent: "#e09225",
                  bg: "bg-[#e09225]/8",
                },
                {
                  icon: Target,
                  label: "Accuracy",
                  value: profile.averageAccuracy,
                  suffix: "%",
                  accent: "#0d9488",
                  bg: "bg-[#0d9488]/8",
                },
                {
                  icon: Trophy,
                  label: "Perfect",
                  value: profile.dailyWins,
                  suffix: "",
                  accent: "#7c3aed",
                  bg: "bg-[#7c3aed]/8",
                },
                {
                  icon: Medal,
                  label: "Badges",
                  value: earnedCount,
                  suffix: `/${totalBadges}`,
                  accent: "#dc4a56",
                  bg: "bg-[#dc4a56]/8",
                },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className={`${tile.bg} rounded-xl border border-[#06182e]/5 p-3.5 hover:brightness-[1.02] transition-all`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-[#06182e]/40 para uppercase tracking-wider">
                      {tile.label}
                    </span>
                    <tile.icon size={14} style={{ color: tile.accent }} />
                  </div>
                  <p className="text-2xl sm:text-3xl text-[#06182e] font-bold tracking-tight leading-none">
                    {tile.value}
                    <span className="text-sm text-[#06182e]/35 ml-1 font-medium">
                      {tile.suffix}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* Stats + Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-4">
              <div className="lg:col-span-3 bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={13} className="text-[#06182e]/30" />
                  <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
                    Statistics
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {[
                    {
                      icon: Flame,
                      label: "Longest streak",
                      value: `${profile.longestStreak}d`,
                      color: "#e09225",
                    },
                    {
                      icon: Star,
                      label: "Total points",
                      value: profile.totalPoints,
                      color: "#d97706",
                    },
                    {
                      icon: CheckCircle2,
                      label: "Correct answers",
                      value: profile.totalCorrect,
                      color: "#059669",
                    },
                    {
                      icon: XCircle,
                      label: "Wrong answers",
                      value: wrongAnswers,
                      color: "#dc2626",
                    },
                    {
                      icon: Clock,
                      label: "Best time",
                      value: profile.bestTimeFormatted || "—",
                      color: "#0d9488",
                    },
                    {
                      icon: TrendingUp,
                      label: "Challenges played",
                      value: profile.challengesPlayed,
                      color: "#7c3aed",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#FFF5E5] hover:bg-[#e09225]/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.color}14` }}
                        >
                          <item.icon size={12} style={{ color: item.color }} />
                        </div>
                        <span className="text-xs text-[#06182e]/55 para font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#06182e] tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Gauge size={13} className="text-[#06182e]/30" />
                  <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
                    Progress
                  </h3>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame size={15} className="text-[#e09225]" />
                      <span className="text-sm font-bold text-[#06182e]">
                        {profile.streak} day streak
                      </span>
                    </div>
                    <span className="text-xs text-[#06182e]/40 para">
                      {profile.longestStreak}d best
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e09225]/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#e09225] to-[#d97706] transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (profile.streak / Math.max(profile.longestStreak || 1, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={15} className="text-[#0d9488]" />
                      <span className="text-sm font-bold text-[#06182e]">
                        {profile.averageAccuracy}% accuracy
                      </span>
                    </div>
                    <span className="text-xs text-[#06182e]/40 para">
                      {profile.totalCorrect}/{profile.challengesPlayed * 5} correct
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0d9488]/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] transition-all duration-700"
                      style={{
                        width: `${Math.min(100, profile.averageAccuracy)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#06182e]/6">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-[#06182e]/35" />
                    <span className="text-xs text-[#06182e]/50 para">
                      Best time
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#06182e] tabular-nums">
                    {profile.bestTimeFormatted || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gem size={13} className="text-[#06182e]/30" />
                <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
                  Badges
                </h3>
                {earnedCount > 0 && (
                  <span className="ml-auto text-[11px] font-bold text-[#06182e]/30 para">
                    {earnedCount} / {totalBadges}
                  </span>
                )}
              </div>

              {earnedCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5E5] flex items-center justify-center mb-2.5">
                    <Medal size={20} className="text-[#e09225]/50" />
                  </div>
                  <p className="text-sm font-bold text-[#06182e]/50">
                    No badges yet
                  </p>
                  <p className="text-xs text-[#06182e]/35 para mt-1 max-w-xs">
                    Play a daily challenge to start earning badges.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#06182e]/6">
                  {Object.entries(BADGE_META).map(([key, meta]) => {
                    const earned = profile.badges.includes(key);
                    const Icon = meta.icon;

                    return (
                      <div key={key} className="flex items-center gap-3 py-2.5">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: earned
                              ? `${meta.color}1A`
                              : "rgba(6,24,46,0.04)",
                          }}
                        >
                          <Icon
                            size={17}
                            style={{
                              color: earned
                                ? meta.color
                                : "rgba(6,24,46,0.25)",
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-bold leading-tight ${
                              earned
                                ? "text-[#06182e]"
                                : "text-[#06182e]/35"
                            }`}
                          >
                            {meta.label}
                          </p>
                          <p
                            className={`text-xs leading-tight mt-0.5 para ${
                              earned
                                ? "text-[#06182e]/45"
                                : "text-[#06182e]/25"
                            }`}
                          >
                            {earned ? meta.description : "Locked"}
                          </p>
                        </div>
                        {earned ? (
                          <BadgeCheck
                            size={16}
                            className="shrink-0"
                            style={{ color: meta.color }}
                          />
                        ) : (
                          <Lock
                            size={14}
                            className="shrink-0 text-[#06182e]/20"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
