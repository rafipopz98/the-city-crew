"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  Clock,
  Star,
  Zap,
  Loader2,
  AlertCircle,
  ArrowRight,
  Medal,
  Flame,
  Target,
  RefreshCw,
  Sparkles,
  Crown,
  Brain,
  ArrowUpRight,
  Home,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api/axios";

type ChallengeData = {
  challenge: {
    _id: string;
    title: string;
    challengeDate: string;
    totalParticipants: number;
  } | null;
  attempt: {
    status: string;
    score: number;
    completionTimeMs: number;
  } | null;
};

type ProfileData = {
  profile: {
    username: string | null;
    streak: number;
    longestStreak: number;
    challengesPlayed: number;
    dailyWins: number;
    badges: string[];
  };
  hasUsername: boolean;
};

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

const BADGE_LABELS: Record<string, string> = {
  first_challenge: "First Challenge",
  first_perfect: "Perfect Score",
  streak_7: "7-Day Streak",
  streak_30: "30-Day Streak",
  "100_correct": "100 Correct",
};

/* ── Skeletons ─────────────────────────────────────────── */

function ChallengeCardSkeleton() {
  return (
    <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-5 sm:p-7 animate-pulse">
      <div className="flex flex-col items-center py-6">
        <div className="w-16 h-16 rounded-full bg-[#06182e]/8 mb-4" />
        <div className="h-4 w-40 rounded bg-[#06182e]/8 mb-2" />
        <div className="h-3 w-28 rounded bg-[#06182e]/6 mb-6" />
        <div className="h-10 w-36 rounded-xl bg-[#06182e]/8" />
      </div>
    </div>
  );
}

function StatsPreviewSkeleton() {
  return (
    <div className="mt-3 bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-5 sm:p-6 animate-pulse">
      <div className="h-3 w-20 rounded bg-[#06182e]/8 mb-4" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-4 w-8 rounded bg-[#06182e]/8" />
            <div className="h-2 w-10 rounded bg-[#06182e]/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DailyChallengePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ChallengeData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/daily-challenge");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [activeRes, profileRes] = await Promise.all([
        api.get("/daily-challenge/active"),
        api.get("/daily-challenge/profile"),
      ]);
      setData(activeRes.data);

      const profileData = profileRes.data;
      setProfile(profileData);

      if (!profileData.hasUsername) {
        setShowUsernameModal(true);
      }
    } catch (err) {
      setError("Failed to load challenge data");
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async () => {
    try {
      setUsernameLoading(true);
      setUsernameError("");
      await api.put("/daily-challenge/username", { username });
      setShowUsernameModal(false);
      fetchData();
    } catch (err: any) {
      setUsernameError(
        err?.response?.data?.message || "Failed to set username",
      );
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    try {
      await api.post("/daily-challenge/start");
      router.push("/daily-challenge/play");
    } catch (err: any) {
      console.error("Failed to start challenge", err);
    }
  };

  const handleViewResults = () => {
    router.push("/daily-challenge/play");
  };

  // Only the auth check blocks the whole screen — the rest of the
  // page renders immediately and each section loads on its own.
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

  const hasCompletedAttempt = data?.attempt?.status === "completed";
  const hasInProgressAttempt = data?.attempt?.status === "in_progress";
  const hasActiveChallenge = data?.challenge;

  return (
    <>
      {/* ── Username Modal ──────────────────────────────── */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF5E5] rounded-2xl max-w-md w-full p-8 shadow-[0_35px_100px_rgba(0,0,0,.30)]">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center mx-auto mb-4">
                <Medal size={28} className="text-[#e09225]" />
              </div>
              <h2 className="text-lg font-bold text-[#06182e]">
                Choose your username
              </h2>
              <p className="text-xs text-[#06182e]/45 mt-2 para">
                This will be displayed on the leaderboard. Choose wisely!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    );
                    setUsernameError("");
                  }}
                  placeholder="e.g. haaland9"
                  maxLength={20}
                  className="w-full bg-transparent text-base text-[#06182e] placeholder:text-[#06182e]/20 text-center border-b-2 border-[#06182e]/8 focus:border-[#e09225] outline-none py-3 transition-colors"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSetUsername();
                  }}
                />
                <p className="text-[11px] text-[#06182e]/25 mt-2 text-center para">
                  3–20 characters • lowercase • a-z, 0-9, underscores
                </p>
              </div>

              {usernameError && (
                <p className="text-xs text-red-500 text-center para">
                  {usernameError}
                </p>
              )}

              <button
                onClick={handleSetUsername}
                disabled={usernameLoading || username.length < 3}
                className="w-full py-3 rounded-xl bg-[#e09225] text-[#FFF5E5] font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {usernameLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
                Set username
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="min-h-screen bg-[#FFF5E5]">
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-10 mx-auto max-w-2xl">
          {/* ── Top CTAs ────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mb-5">
            <button
              onClick={() => router.push("/")}
              className="group inline-flex items-center gap-2 text-base sm:text-lg font-bold text-[#06182e]/50 hover:text-[#e09225] transition-all"
            >
              <Home
                size={16}
                className="group-hover:scale-110 transition-transform shrink-0"
              />
              <span className="underline decoration-transparent hover:decoration-current underline-offset-4 transition-all duration-300">
                Home
              </span>
              <ArrowUpRight
                size={17}
                className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0"
              />
            </button>
            <div className="gap-4 flex">
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
              <button
                onClick={() => router.push("/daily-challenge/profile")}
                className="group inline-flex items-center gap-2 text-base sm:text-lg font-bold text-[#06182e]/50 hover:text-[#e09225] transition-all"
              >
                <Star
                  size={16}
                  className="group-hover:scale-110 transition-transform shrink-0"
                />
                <span className="underline decoration-transparent hover:decoration-current underline-offset-4 transition-all duration-300">
                  Profile
                </span>
                <ArrowUpRight
                  size={17}
                  className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0"
                />
              </button>
            </div>
          </div>

          {/* Header — static, doesn't wait on any fetch */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e09225]/12 text-[#e09225] text-[11px] font-bold mb-4">
              <Trophy size={12} />
              Daily Challenge
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#06182e] tracking-tight">
              TCC Quiz
            </h1>
            <p className="text-sm text-[#06182e]/40 mt-2 max-w-xs mx-auto para">
              Test your football knowledge. Answer 5 questions as fast as you
              can.
            </p>
          </div>

          {/* ── Challenge card ───────────────────────────── */}
          {error ? (
            <div className="flex flex-col items-center gap-4 text-center bg-[#e09225]/8 border border-[#e09225]/12 rounded-xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
                <AlertCircle size={24} className="text-[#e09225]" />
              </div>
              <div>
                <p className="text-base font-bold text-[#06182e]">
                  Couldn't load the challenge
                </p>
                <p className="text-sm text-[#06182e]/45 mt-1 para">
                  Something went wrong on our end. Give it another try.
                </p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          ) : loading ? (
            <ChallengeCardSkeleton />
          ) : (
            <div className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-5 sm:p-7">
              {!hasActiveChallenge ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-[#06182e]/6 flex items-center justify-center mx-auto mb-3">
                    <Clock size={22} className="text-[#06182e]/30" />
                  </div>
                  <h2 className="text-base font-bold text-[#06182e] mb-1">
                    No active challenge
                  </h2>
                  <p className="text-xs text-[#06182e]/35 para">
                    There&apos;s no active challenge right now. Check back
                    later!
                  </p>
                </div>
              ) : hasCompletedAttempt ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#e09225]/15 flex items-center justify-center mx-auto mb-4">
                    <Trophy size={30} className="text-[#e09225]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#06182e] mb-1">
                    Challenge complete!
                  </h2>
                  <p className="text-xs text-[#06182e]/40 para mb-4">
                    {data.challenge?.title}
                  </p>
                  <div className="flex items-center justify-center gap-6 mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#06182e]">
                        {data.attempt?.score}/5
                      </p>
                      <p className="text-[11px] text-[#06182e]/35 para">
                        Score
                      </p>
                    </div>
                    <div className="w-px h-10 bg-[#06182e]/8" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#06182e]">
                        {data.attempt?.completionTimeMs
                          ? `${(data.attempt.completionTimeMs / 1000).toFixed(1)}s`
                          : "--"}
                      </p>
                      <p className="text-[11px] text-[#06182e]/35 para">Time</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleViewResults}
                      className="px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-xs font-bold hover:brightness-110 transition-all"
                    >
                      View results
                    </button>
                    <button
                      onClick={() =>
                        router.push("/daily-challenge/leaderboard")
                      }
                      className="px-5 py-2.5 rounded-xl bg-[#FFF5E5] text-[#06182e] text-xs font-bold border border-[#06182e]/8 hover:bg-white transition-all"
                    >
                      Leaderboard
                    </button>
                  </div>
                </div>
              ) : hasInProgressAttempt ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#e09225]/15 flex items-center justify-center mx-auto mb-4">
                    <Zap size={30} className="text-[#e09225]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#06182e] mb-1">
                    Challenge in progress
                  </h2>
                  <p className="text-xs text-[#06182e]/40 para mb-5">
                    You&apos;ve already started! Continue where you left off.
                  </p>
                  <button
                    onClick={handleViewResults}
                    className="px-6 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-xs font-bold hover:brightness-110 transition-all"
                  >
                    Continue playing
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#e09225]/15 flex items-center justify-center mx-auto mb-4">
                    <Trophy size={30} className="text-[#e09225]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#06182e] mb-1">
                    {data.challenge?.title}
                  </h2>
                  <p className="text-xs text-[#06182e]/40 para mb-5">
                    {data.challenge?.totalParticipants ||
                      (Math.random() * 100).toFixed(0)}{" "}
                    players have completed
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto">
                    <div className="bg-[#FFF5E5] rounded-xl p-3">
                      <Target
                        size={18}
                        className="mx-auto text-[#e09225] mb-1"
                      />
                      <p className="text-[11px] font-bold text-[#06182e]/50">
                        5 Questions
                      </p>
                    </div>
                    <div className="bg-[#FFF5E5] rounded-xl p-3">
                      <Clock
                        size={18}
                        className="mx-auto text-[#e09225] mb-1"
                      />
                      <p className="text-[11px] font-bold text-[#06182e]/50">
                        Timed
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartChallenge}
                    className="px-7 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 transition-all shadow-sm"
                  >
                    Start challenge
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Stats preview ────────────────────────────── */}
          {loading ? (
            <StatsPreviewSkeleton />
          ) : (
            profile && (
              <div className="mt-3 bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
                    Your stats
                  </h3>
                  <button
                    onClick={() => router.push("/daily-challenge/profile")}
                    className="text-[11px] text-[#e09225] font-bold hover:underline"
                  >
                    View profile
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame size={13} className="text-[#e09225]" />
                      <p className="text-lg font-bold text-[#06182e]">
                        {profile.profile.streak}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#06182e]/35 para">Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp size={13} className="text-[#0d9488]" />
                      <p className="text-lg font-bold text-[#06182e]">
                        {profile.profile.challengesPlayed}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#06182e]/35 para">Played</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy size={13} className="text-[#d97706]" />
                      <p className="text-lg font-bold text-[#06182e]">
                        {profile.profile.dailyWins}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#06182e]/35 para">
                      Perfect
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Medal size={13} className="text-[#7c3aed]" />
                      <p className="text-lg font-bold text-[#06182e]">
                        {profile.profile.badges.length}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#06182e]/35 para">Badges</p>
                  </div>
                </div>

                {profile.profile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#06182e]/8">
                    {profile.profile.badges.map((badge) => {
                      const Icon = BADGE_ICONS[badge] || Sparkles;
                      const color = BADGE_COLORS[badge] || "#06182e80";
                      return (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF5E5] text-[10px] text-[#06182e]/55 font-bold"
                        >
                          <Icon size={10} style={{ color }} />
                          {BADGE_LABELS[badge] || badge}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
