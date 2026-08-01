"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  User as UserIcon,
  Star,
  Brain,
  Trophy,
  Flame,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Shirt,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { TablePagination } from "@/components/Admin/TablePagination";

/* ── Types ─────────────────────────────────────────────── */

type AdminUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  signedUpFromLogin: boolean;
  profile_completed: boolean;
};

type UserStats = {
  ratingsGiven: number;
  challengesPlayed: number;
  streak: number;
  totalPoints: number;
  xp: number;
  coins: number;
  totalMatches: number;
  totalWins: number;
  winRate: number;
};

type RatingGroup = {
  match: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    homeScore: number;
    awayScore: number;
    competition: string;
    matchDate: string;
  } | null;
  players: {
    id: string;
    rating: number;
    createdAt: string;
    player: { id: string; name: string; position: string; image: string } | null;
  }[];
};

type ChallengeAttempt = {
  id: string;
  challengeId: string | null;
  title: string;
  challengeDate: string | null;
  score: number;
  totalQuestions: number;
  completionTimeMs: number | null;
  submittedAt: string | null;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    selectedAnswer: string | null;
    isCorrect: boolean;
    answered: boolean;
    timeTakenMs: number | null;
  }[];
};

/* ── Small helpers ─────────────────────────────────────── */

function formatMs(ms: number | null | undefined): string {
  if (!ms && ms !== 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr).getTime();
  if (Number.isNaN(date)) return "";
  const diffMs = Date.now() - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Skeletons ─────────────────────────────────────────── */

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#06182e]/10 p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-[#06182e]/8 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-[#06182e]/8" />
            <div className="h-3 w-3/5 rounded bg-[#06182e]/6" />
          </div>
          <div className="h-6 w-14 rounded-md bg-[#06182e]/8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center bg-white border border-[#e09225]/20 rounded-2xl p-8">
      <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
        <AlertCircle size={24} className="text-[#e09225]" />
      </div>
      <div>
        <p className="text-base font-bold text-[#06182e]">{title}</p>
        <p className="text-sm text-[#06182e]/45 mt-1 para">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#06182e] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: typeof Star;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4 bg-white rounded-2xl border border-[#06182e]/8">
      <div className="w-14 h-14 rounded-2xl bg-[#e09225]/10 flex items-center justify-center mb-3">
        <Icon size={24} className="text-[#e09225]/60" />
      </div>
      <p className="text-base font-bold text-[#06182e]/70">{title}</p>
      <p className="text-sm text-[#06182e]/40 para mt-1 max-w-sm">{message}</p>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */

type Tab = "overview" | "ratings" | "challenges";

const TABS: { id: Tab; label: string; icon: typeof Star }[] = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "ratings", label: "Player Ratings", icon: Star },
  { id: "challenges", label: "Challenges", icon: Brain },
];

export default function AdminUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;

  const [tab, setTab] = useState<Tab>("overview");

  // Overview
  const [userData, setUserData] = useState<{
    user: AdminUser;
    stats: UserStats;
  } | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(false);

  // Ratings
  const [ratings, setRatings] = useState<{
    matches: RatingGroup[];
    pagination: { page: number; totalPages: number; totalMatches: number; hasMore: boolean };
  } | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState(false);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});

  // Challenges
  const [challenges, setChallenges] = useState<{
    attempts: ChallengeAttempt[];
    pagination: { page: number; totalPages: number; totalAttempts: number; hasMore: boolean };
  } | null>(null);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challengesError, setChallengesError] = useState(false);
  const [challengesPage, setChallengesPage] = useState(1);

  const fetchUser = useCallback(async () => {
    try {
      setUserLoading(true);
      setUserError(false);
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed");
      setUserData(await res.json());
    } catch {
      setUserError(true);
    } finally {
      setUserLoading(false);
    }
  }, [userId]);

  const fetchRatings = useCallback(
    async (page: number) => {
      try {
        setRatingsLoading(true);
        setRatingsError(false);
        const res = await fetch(
          `/api/admin/users/${userId}/ratings?page=${page}&limit=5`,
        );
        if (!res.ok) throw new Error("Failed");
        setRatings(await res.json());
      } catch {
        setRatingsError(true);
      } finally {
        setRatingsLoading(false);
      }
    },
    [userId],
  );

  const fetchChallenges = useCallback(
    async (page: number) => {
      try {
        setChallengesLoading(true);
        setChallengesError(false);
        const res = await fetch(
          `/api/admin/users/${userId}/challenges?page=${page}&limit=3`,
        );
        if (!res.ok) throw new Error("Failed");
        setChallenges(await res.json());
      } catch {
        setChallengesError(true);
      } finally {
        setChallengesLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const openTab = (next: Tab) => {
    setTab(next);
  };

  // Tab + page changes drive all fetching — single source of truth.
  useEffect(() => {
    if (tab === "ratings") fetchRatings(ratingsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, ratingsPage]);

  useEffect(() => {
    if (tab === "challenges") fetchChallenges(challengesPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, challengesPage]);

  const user = userData?.user;
  const stats = userData?.stats;

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.username ||
      user.email?.split("@")[0] ||
      "Unknown user"
    : "Loading…";

  const initials = (displayName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#ece1cf]">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/admin/users")}
              className="shrink-0 w-9 h-9 rounded-xl bg-white border border-[#06182e]/10 flex items-center justify-center text-[#06182e]/60 hover:bg-[#f4ebda] hover:text-[#06182e] transition-all"
              aria-label="Back to users"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
                Admin · User Profile
              </span>
              <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-[#06182e] truncate">
                {displayName}
              </h1>
            </div>
          </div>
          {user && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium self-start sm:self-auto shrink-0 ${
                user.role === "admin"
                  ? "bg-[#e09225]/15 text-[#e09225]"
                  : "bg-[#06182e]/8 text-[#06182e]/60"
              }`}
            >
              <Shield size={12} />
              {user.role}
            </span>
          )}
        </div>

        {/* Identity card */}
        {userError ? (
          <div className="mt-6">
            <ErrorState
              title="Couldn't load this user"
              message="Something went wrong on our end."
              onRetry={fetchUser}
            />
          </div>
        ) : userLoading || !user ? (
          <div className="mt-6">
            <div className="bg-white rounded-2xl border border-[#06182e]/10 p-5 sm:p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#06182e]/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-[#06182e]/8" />
                  <div className="h-3 w-1/2 rounded bg-[#06182e]/6" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-2xl border border-[#06182e]/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e09225]/25 to-[#e09225]/10 flex items-center justify-center shrink-0 border border-[#e09225]/20">
                <span className="text-xl font-bold text-[#e09225]">
                  {initials}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-[#06182e] truncate">
                  {displayName}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#06182e]/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={12} className="text-[#e09225]" />
                    {user.email}
                  </span>
                  {user.username && (
                    <span className="inline-flex items-center gap-1">
                      <UserIcon size={12} />
                      @{user.username}
                    </span>
                  )}
                  {user.createdAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.signedUpFromLogin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-[10px] font-bold">
                      <Sparkles size={9} /> Signed up from login
                    </span>
                  )}
                  {!user.profile_completed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e09225]/12 text-[#e09225] text-[10px] font-bold">
                      Profile incomplete
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Star, label: "Ratings Given", value: stats?.ratingsGiven ?? 0, color: "#0d9488" },
                { icon: Brain, label: "Challenges Played", value: stats?.challengesPlayed ?? 0, color: "#e09225" },
                { icon: Flame, label: "Streak", value: stats?.streak ?? 0, color: "#ea580c" },
                { icon: Trophy, label: "Points", value: stats?.totalPoints ?? 0, color: "#d97706" },
              ].map((t) => (
                <div
                  key={t.label}
                  className="bg-[#ece1cf]/70 rounded-xl border border-[#06182e]/8 p-3.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#06182e]/40">
                      {t.label}
                    </span>
                    <t.icon size={14} style={{ color: t.color }} />
                  </div>
                  <p className="text-2xl font-bold text-[#06182e] tabular-nums leading-none">
                    {t.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Game stats row */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-[#ece1cf]/70 rounded-xl border border-[#06182e]/8 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#06182e]/40 mb-1">
                  XP
                </p>
                <p className="text-lg font-bold text-[#06182e] tabular-nums">
                  {stats?.xp?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="bg-[#ece1cf]/70 rounded-xl border border-[#06182e]/8 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#06182e]/40 mb-1">
                  Coins
                </p>
                <p className="text-lg font-bold text-[#06182e] tabular-nums">
                  {stats?.coins?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="bg-[#ece1cf]/70 rounded-xl border border-[#06182e]/8 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#06182e]/40 mb-1">
                  Match W/R
                </p>
                <p className="text-lg font-bold text-[#06182e] tabular-nums">
                  {stats?.totalWins ?? 0}/{stats?.totalMatches ?? 0}
                  <span className="text-xs text-[#06182e]/40 ml-1">
                    {stats?.winRate ?? 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-[#06182e]/10">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => openTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 -mb-px ${
                  active
                    ? "border-[#e09225] text-[#06182e]"
                    : "border-transparent text-[#06182e]/40 hover:text-[#06182e]/70"
                }`}
              >
                <t.icon size={15} className={active ? "text-[#e09225]" : ""} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ─────────────────────────────────── */}
        <div className="mt-6 pb-16">
          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-3">
              {[
                {
                  icon: Star,
                  title: "Player Ratings",
                  desc: "Every player this user rated, grouped match by match.",
                  color: "#0d9488",
                  bg: "bg-[#0d9488]/10",
                  action: () => openTab("ratings"),
                },
                {
                  icon: Brain,
                  title: "Challenge History",
                  desc: "Each attempt with every question, option, answer & timing.",
                  color: "#e09225",
                  bg: "bg-[#e09225]/12",
                  action: () => openTab("challenges"),
                },
              ].map((c) => (
                <button
                  key={c.title}
                  onClick={c.action}
                  className="w-full group flex items-center gap-4 bg-white rounded-2xl border border-[#06182e]/10 p-5 text-left hover:border-[#e09225]/40 hover:shadow-md hover:shadow-[#06182e]/5 transition-all"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
                  >
                    <c.icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#06182e]">
                      {c.title}
                    </p>
                    <p className="text-xs text-[#06182e]/45 para mt-0.5">
                      {c.desc}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#06182e]/25 group-hover:text-[#e09225] group-hover:translate-x-1 transition-all shrink-0"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Ratings */}
          {tab === "ratings" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star size={13} className="text-[#06182e]/30" />
                <h3 className="text-xs font-bold text-[#06182e]/45 uppercase tracking-wider">
                  Rating history
                </h3>
                {ratings && (
                  <span className="ml-auto text-[11px] font-bold text-[#06182e]/30">
                    {ratings.pagination.totalMatches} match
                    {ratings.pagination.totalMatches !== 1 ? "es" : ""}
                  </span>
                )}
              </div>

              {ratingsLoading && !ratings ? (
                <ListSkeleton rows={4} />
              ) : ratingsError ? (
                <ErrorState
                  title="Couldn't load ratings"
                  message="Something went wrong on our end."
                  onRetry={() => fetchRatings(ratingsPage)}
                />
              ) : ratings && ratings.matches.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No ratings yet"
                  message="This user hasn't rated any players in a finished match."
                />
              ) : ratings ? (
                <div className="space-y-3">
                  {ratings.matches.map((group, groupIndex) => {
                    const isExpanded =
                      expandedMatches[group.match?.id ?? `g${groupIndex}`] ??
                      false;
                    const visiblePlayers = isExpanded
                      ? group.players
                      : group.players.slice(0, 5);
                    return (
                      <div
                        key={group.match?.id ?? `unknown-${groupIndex}`}
                        className="bg-white rounded-2xl border border-[#06182e]/10 overflow-hidden"
                      >
                        {group.match ? (
                          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-[#06182e]">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-[10px] uppercase tracking-wide text-[#e09225] font-bold shrink-0">
                                {group.match.competition}
                              </span>
                              <span className="hidden sm:block h-3 w-px bg-white/15" />
                              <span className="text-sm sm:text-base font-bold text-[#ece1cf] truncate">
                                {group.match.homeTeam?.name}
                              </span>
                              <span className="text-base font-extrabold text-[#e09225] tabular-nums shrink-0">
                                {group.match.homeScore}–{group.match.awayScore}
                              </span>
                              <span className="text-sm sm:text-base font-bold text-[#ece1cf] truncate">
                                {group.match.awayTeam?.name}
                              </span>
                            </div>
                            <span className="hidden sm:inline text-[11px] text-white/40 shrink-0">
                              {timeAgo(group.match.matchDate)}
                            </span>
                          </div>
                        ) : (
                          <div className="px-4 sm:px-5 py-3 bg-[#06182e] text-white/50 text-xs font-semibold">
                            Match unavailable
                          </div>
                        )}

                        <div className="divide-y divide-[#06182e]/6">
                          {visiblePlayers.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center gap-3 px-4 sm:px-5 py-2.5"
                            >
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#ece1cf] flex items-center justify-center shrink-0 border border-[#06182e]/5">
                                {r.player?.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={r.player.image}
                                    alt={r.player.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Shirt
                                    size={14}
                                    className="text-[#e09225]/50"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-[#06182e] leading-tight truncate">
                                  {r.player?.name || "Unknown player"}
                                </p>
                                <p className="text-[11px] text-[#06182e]/40">
                                  {r.player?.position || "—"}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <svg
                                    key={i}
                                    width={11}
                                    height={11}
                                    viewBox="0 0 24 24"
                                    fill={
                                      i <= Math.round(r.rating)
                                        ? "#e09225"
                                        : "rgba(6,24,46,0.12)"
                                    }
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {group.players.length > 5 && (
                          <button
                            onClick={() =>
                              setExpandedMatches((prev) => ({
                                ...prev,
                                [group.match?.id ?? `g${groupIndex}`]:
                                  !isExpanded,
                              }))
                            }
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-[#e09225] hover:bg-[#e09225]/10 transition-colors"
                          >
                            {isExpanded
                              ? "Show fewer players"
                              : `Show all ${group.players.length} players`}
                            <ChevronDown
                              size={13}
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <div className="bg-white rounded-2xl border border-[#06182e]/10 overflow-hidden">
                    <TablePagination
                      page={ratings.pagination.page}
                      totalPages={ratings.pagination.totalPages}
                      total={ratings.pagination.totalMatches}
                      itemLabel="matches"
                      onPageChange={(p) => {
                        setRatingsPage(p);
                        setExpandedMatches({});
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Challenges */}
          {tab === "challenges" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain size={13} className="text-[#06182e]/30" />
                <h3 className="text-xs font-bold text-[#06182e]/45 uppercase tracking-wider">
                  Challenge history
                </h3>
                {challenges && (
                  <span className="ml-auto text-[11px] font-bold text-[#06182e]/30">
                    {challenges.pagination.totalAttempts} completed
                  </span>
                )}
              </div>

              {challengesLoading && !challenges ? (
                <ListSkeleton rows={3} />
              ) : challengesError ? (
                <ErrorState
                  title="Couldn't load challenges"
                  message="Something went wrong on our end."
                  onRetry={() => fetchChallenges(challengesPage)}
                />
              ) : challenges && challenges.attempts.length === 0 ? (
                <EmptyState
                  icon={Brain}
                  title="No challenges played"
                  message="This user hasn't completed any daily challenges yet."
                />
              ) : challenges ? (
                <div className="space-y-3">
                  {challenges.attempts.map((a) => (
                    <ChallengeCard key={a.id} attempt={a} />
                  ))}

                  <div className="bg-white rounded-2xl border border-[#06182e]/10 overflow-hidden">
                    <TablePagination
                      page={challenges.pagination.page}
                      totalPages={challenges.pagination.totalPages}
                      total={challenges.pagination.totalAttempts}
                      itemLabel="challenges"
                      onPageChange={setChallengesPage}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ── Challenge card with per-question breakdown ────────── */

function ChallengeCard({ attempt }: { attempt: ChallengeAttempt }) {
  const [open, setOpen] = useState(false);
  const perfect = attempt.score === attempt.totalQuestions;

  return (
    <div className="bg-white rounded-2xl border border-[#06182e]/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left hover:bg-[#f4ebda] transition-colors"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            perfect ? "bg-[#7c3aed]/10" : "bg-[#e09225]/12"
          }`}
        >
          {perfect ? (
            <Trophy size={17} className="text-[#7c3aed]" />
          ) : (
            <Brain size={17} className="text-[#e09225]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#06182e] truncate">
            {attempt.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="text-xs text-[#06182e]/40">
              {attempt.challengeDate || timeAgo(attempt.submittedAt)}
            </span>
            <span className="text-[#06182e]/15">•</span>
            <span className="text-xs text-[#06182e]/40">
              {formatMs(attempt.completionTimeMs)} total
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p
            className={`text-lg font-bold leading-none tabular-nums ${
              perfect ? "text-[#7c3aed]" : "text-[#06182e]"
            }`}
          >
            {attempt.score}
            <span className="text-xs text-[#06182e]/35 font-medium">
              /{attempt.totalQuestions}
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
        <ChevronDown
          size={15}
          className={`text-[#06182e]/30 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="divide-y divide-[#06182e]/6 border-t border-[#06182e]/8">
          {attempt.questions.map((q, idx) => (
            <div key={q.id} className="px-4 sm:px-5 py-4">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-[#06182e]/30 bg-[#ece1cf] rounded-md px-1.5 py-0.5 mt-0.5 shrink-0">
                  Q{idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#06182e] leading-snug">
                    {q.question}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        q.isCorrect ? "text-[#059669]" : "text-[#dc2626]"
                      }`}
                    >
                      {q.isCorrect ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {q.isCorrect ? "Correct" : "Wrong"}
                    </span>
                    {q.timeTakenMs != null && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#06182e]/40">
                        <Clock size={11} />
                        {formatMs(q.timeTakenMs)}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = q.selectedAnswer === opt;
                      const isCorrectOpt = q.correctAnswer === opt;
                      let cls =
                        "bg-[#ece1cf]/60 border-[#06182e]/8 text-[#06182e]/70";
                      if (isCorrectOpt)
                        cls =
                          "bg-[#059669]/10 border-[#059669]/30 text-[#059669] font-semibold";
                      else if (isSelected)
                        cls =
                          "bg-[#dc2626]/8 border-[#dc2626]/30 text-[#dc2626] font-semibold";
                      return (
                        <div
                          key={oi}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${cls}`}
                        >
                          <span className="text-[10px] font-bold opacity-50 w-3 shrink-0">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="min-w-0 truncate flex-1">
                            {opt}
                          </span>
                          {isCorrectOpt && (
                            <CheckCircle2 size={13} className="shrink-0" />
                          )}
                          {isSelected && !isCorrectOpt && (
                            <XCircle size={13} className="shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!q.answered && (
                    <p className="text-[11px] text-[#06182e]/35 mt-2">
                      No answer recorded for this question.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
