"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/axios";
import {
  Brain,
  Swords,
  Star,
  Calendar,
  Flame,
  ArrowUpRight,
  LayoutGrid,
  BarChart3,
  Trophy,
  Loader2,
  Shirt,
  ChevronRight,
  Gamepad2,
  Target,
  AlertCircle,
  RefreshCw,
  Rocket,
} from "lucide-react";
import { ChallengesTab, type ChallengesData } from "./ChallengesTab";
import { GameTab, type GameUser, type MatchItem } from "./GameTab";
import { RatingsTab, type RatingsData } from "./RatingsTab";
import { TileSkeleton, EmptyState } from "./ui";

type Tab = "overview" | "challenges" | "game" | "ratings";

type SummaryData = {
  username: string | null;
  firstName: string;
  joinedDate: string;
  streak: number;
  totalPoints: number;
  challengesPlayed: number;
  bestTimeMs: number | null;
  bestTimeFormatted: string | null;
  totalMatches: number;
  totalWins: number;
  winRate: number;
  xp: number;
  coins: number;
  ratingsTotal: number;
  ratingsAverage: number;
};

const TABS: { id: Tab; label: string; icon: typeof Brain }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "challenges", label: "Challenges", icon: Brain },
  { id: "game", label: "Game", icon: Swords },
  { id: "ratings", label: "Player Ratings", icon: Star },
];

const QUICK_LINKS = [
  {
    href: "/daily-challenge",
    icon: Brain,
    label: "TCC Quiz",
    desc: "Play today's daily challenge",
    color: "#e09225",
    bg: "bg-[#e09225]/10",
  },
  {
    href: "/game",
    icon: Gamepad2,
    label: "TCC Manager",
    desc: "Squad, matches & shop",
    color: "#059669",
    bg: "bg-[#059669]/10",
  },
  {
    href: "/lineup-builder",
    icon: Shirt,
    label: "Lineup Builder",
    desc: "Build your dream XI",
    color: "#2563eb",
    bg: "bg-[#2563eb]/10",
  },
  {
    href: "/player-stats",
    icon: BarChart3,
    label: "Player Stats",
    desc: "Season numbers & ratings",
    color: "#0d9488",
    bg: "bg-[#0d9488]/10",
  },
  {
    href: "/matches",
    icon: Trophy,
    label: "Matches",
    desc: "Fixtures, results & hubs",
    color: "#7c3aed",
    bg: "bg-[#7c3aed]/10",
  },
  {
    href: "/daily-challenge/leaderboard",
    icon: Target,
    label: "Leaderboard",
    desc: "Where you rank",
    color: "#d97706",
    bg: "bg-[#d97706]/10",
  },
];

const HomeLoading = () => (
  <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full bg-[#e09225]/15 animate-ping" />
        <div className="relative w-12 h-12 rounded-full bg-[#e09225] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#06182e]" />
        </div>
      </div>
      <p className="text-sm text-[#06182e]/50 para">Loading your crew…</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  // Overview + hero data — the only endpoint fetched on page load.
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  // Tab data — fetched lazily on first click of each tab.
  const [challenges, setChallenges] = useState<ChallengesData | null>(null);
  const [ratings, setRatings] = useState<RatingsData | null>(null);
  const [gameUser, setGameUser] = useState<GameUser | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);

  const [challengesLoading, setChallengesLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsLoadingMore, setRatingsLoadingMore] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [challengesError, setChallengesError] = useState(false);
  const [ratingsError, setRatingsError] = useState(false);
  const [gameError, setGameError] = useState(false);

  // Tracks which tabs have already been fetched so revisits don't refetch.
  const loadedTabs = useRef<Set<Tab>>(new Set());

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(false);
      const res = await api.get("/profile/summary");
      setSummary(res.data.summary);
      loadedTabs.current.add("overview");
    } catch {
      // Allow auto-retry when the overview is revisited after a failure.
      loadedTabs.current.delete("overview");
      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true);
      setChallengesError(false);
      const res = await api.get("/profile/challenges");
      setChallenges(res.data);
      loadedTabs.current.add("challenges");
    } catch {
      // Allow auto-retry when the tab is revisited after a failure.
      loadedTabs.current.delete("challenges");
      setChallengesError(true);
    } finally {
      setChallengesLoading(false);
    }
  }, []);

  const fetchRatings = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setRatingsLoadingMore(true);
      } else {
        setRatingsLoading(true);
      }
      setRatingsError(false);
      const res = await api.get(`/profile/ratings?page=${page}&limit=5`);
      setRatings((prev) =>
        append && prev
          ? { ...res.data, matches: [...prev.matches, ...res.data.matches] }
          : res.data,
      );
      if (!append) loadedTabs.current.add("ratings");
    } catch {
      // A failed "load more" shouldn't wipe out already-loaded matches.
      if (!append) {
        // Allow auto-retry when the tab is revisited after a failure.
        loadedTabs.current.delete("ratings");
        setRatingsError(true);
      }
    } finally {
      setRatingsLoading(false);
      setRatingsLoadingMore(false);
    }
  }, []);

  const loadMoreRatings = useCallback(() => {
    const nextPage = (ratings?.pagination?.page ?? 0) + 1;
    fetchRatings(nextPage, true);
  }, [ratings, fetchRatings]);

  const fetchGame = useCallback(async () => {
    try {
      setGameLoading(true);
      setGameError(false);
      setHistoryLoading(true);
      const [userRes, historyRes] = await Promise.all([
        api.get("/game/user"),
        api.get("/game/match/history?page=1&limit=5"),
      ]);
      setGameUser(userRes.data.gameUser);
      setMatches(historyRes.data.matches || []);
      loadedTabs.current.add("game");
    } catch {
      // Allow auto-retry when the tab is revisited after a failure.
      loadedTabs.current.delete("game");
      setGameError(true);
    } finally {
      setGameLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  // Fetch a tab's data the first time it's opened. Overview is the default
  // tab and uses the lightweight summary endpoint.
  const openTab = useCallback(
    (next: Tab) => {
      setTab(next);
      if (loadedTabs.current.has(next)) return;
      loadedTabs.current.add(next);
      if (next === "challenges") fetchChallenges();
      else if (next === "game") fetchGame();
      else if (next === "ratings") fetchRatings(1);
    },
    [fetchChallenges, fetchGame, fetchRatings],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/profile");
      return;
    }
    // Only the lightweight summary loads on mount; tab endpoints load lazily.
    loadedTabs.current.add("overview");
    fetchSummary();
  }, [user, authLoading, router, fetchSummary]);

  if (authLoading) return <HomeLoading />;
  if (!user) return null;

  const joinedDate = summary?.joinedDate
    ? new Date(summary.joinedDate).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const displayName =
    user.displayName ||
    summary?.firstName ||
    user.first_name ||
    user.email?.split("@")[0] ||
    "City Crew Member";

  const initials = summary?.username
    ? summary.username.charAt(0).toUpperCase()
    : displayName.charAt(0).toUpperCase();

  const hasAnyActivity =
    (summary?.challengesPlayed ?? 0) > 0 ||
    (summary?.totalMatches ?? 0) > 0 ||
    (summary?.ratingsTotal ?? 0) > 0;

  const overviewTiles = [
    {
      icon: Brain,
      label: "Challenges",
      value: summary?.challengesPlayed ?? 0,
      sub: "Played",
      color: "#e09225",
      bg: "bg-[#e09225]/8",
    },
    {
      icon: Swords,
      label: "Matches",
      value: summary?.totalMatches ?? 0,
      sub: `${summary?.winRate ?? 0}% Win Rate`,
      color: "#2563eb",
      bg: "bg-[#2563eb]/8",
    },
    {
      icon: Star,
      label: "Ratings",
      value: summary?.ratingsTotal ?? 0,
      sub: "Given",
      color: "#0d9488",
      bg: "bg-[#0d9488]/8",
    },
    {
      icon: Trophy,
      label: "Points",
      value: summary?.totalPoints ?? 0,
      sub: "Challenge Points",
      color: "#d97706",
      bg: "bg-[#d97706]/8",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFF5E5] text-[#06182e]">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-10 sm:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#e09225] to-[#c77415] flex items-center justify-center shadow-lg shadow-[#e09225]/25 rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-3xl sm:text-4xl font-bold text-[#06182e] -rotate-3 hover:rotate-0 transition-transform duration-500">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#06182e] flex items-center justify-center border-2 border-[#FFF5E5]">
                <Flame size={13} className="text-[#e09225]" />
              </div>
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06182e] text-[#e09225] text-[10px] font-bold uppercase tracking-[0.16em] mb-3">
                <Calendar size={11} />
                {joinedDate ? `Joined ${joinedDate}` : "The City Crew"}
              </div>
              <h1 className="head text-5xl sm:text-6xl lg:text-7xl leading-[0.95] uppercase text-[#06182e] tracking-tight break-words">
                {summary?.username || displayName}
              </h1>
              <p className="para text-sm sm:text-base text-[#06182e]/50 mt-2">
                Your City Crew profile — challenges, manager career & match
                ratings.
              </p>
            </div>

            {/* Quick stat chips */}
            <div className="flex sm:flex-col gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#e09225]/12 border border-[#e09225]/20 rounded-xl px-4 py-2.5">
                <Flame size={16} className="text-[#e09225]" />
                <div>
                  <p className="text-lg font-bold leading-none text-[#06182e]">
                    {summaryLoading ? "…" : (summary?.streak ?? 0)}
                  </p>
                  <p className="text-[10px] text-[#06182e]/45 para font-semibold uppercase tracking-wider">
                    Streak
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#06182e]/5 border border-[#06182e]/10 rounded-xl px-4 py-2.5">
                <Star size={16} className="text-[#d97706]" />
                <div>
                  <p className="text-lg font-bold leading-none text-[#06182e]">
                    {summaryLoading ? "…" : (summary?.totalPoints ?? 0)}
                  </p>
                  <p className="text-[10px] text-[#06182e]/45 para font-semibold uppercase tracking-wider">
                    Points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick links ──────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid size={14} className="text-[#e09225]" />
          <h2 className="para text-xs font-bold text-[#06182e]/50 uppercase tracking-[0.16em]">
            Quick links
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="group snap-start shrink-0 w-[240px] sm:w-auto bg-[#ece1cf]/60 hover:bg-[#ece1cf] border border-[#06182e]/5 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#06182e]/5"
            >
              <div
                className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300`}
              >
                <link.icon size={18} style={{ color: link.color }} />
              </div>
              <p className="text-sm font-bold text-[#06182e] flex items-center gap-1">
                {link.label}
                <ArrowUpRight
                  size={13}
                  className="text-[#06182e]/30 group-hover:text-[#e09225] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                />
              </p>
              <p className="text-xs text-[#06182e]/45 para mt-0.5">
                {link.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <nav className="border-y border-[#06182e]/8">
        <div className="px-4 sm:px-6 lg:px-12 flex gap-2 overflow-x-auto scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => openTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${
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
        </div>
      </nav>

      {/* ── Tab content ──────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 pb-16">
        {tab === "challenges" && (
          <ChallengesTab
            data={challenges}
            loading={challengesLoading}
            error={challengesError}
            onRetry={fetchChallenges}
          />
        )}
        {tab === "game" && (
          <GameTab
            gameUser={gameUser}
            matches={matches}
            userLoading={gameLoading}
            historyLoading={historyLoading}
            error={gameError}
            onRetry={fetchGame}
          />
        )}
        {tab === "ratings" && (
          <RatingsTab
            data={ratings}
            loading={ratingsLoading}
            error={ratingsError}
            onRetry={() => fetchRatings(1)}
            onLoadMore={loadMoreRatings}
            loadingMore={ratingsLoadingMore}
          />
        )}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Totals band */}
            {summaryLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TileSkeleton key={i} />
                ))}
              </div>
            ) : summaryError ? (
              <div className="flex flex-col items-center gap-4 text-center bg-[#e09225]/8 border border-[#e09225]/12 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
                  <AlertCircle size={24} className="text-[#e09225]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#06182e]">
                    Couldn&apos;t load your overview
                  </p>
                  <p className="text-sm text-[#06182e]/45 mt-1 para">
                    Something went wrong on our end.
                  </p>
                </div>
                <button
                  onClick={fetchSummary}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {overviewTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className={`${tile.bg} rounded-2xl border border-[#06182e]/5 p-4 sm:p-5`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#06182e]/40 para">
                        {tile.label}
                      </span>
                      <tile.icon size={16} style={{ color: tile.color }} />
                    </div>
                    <p className="text-3xl sm:text-4xl text-[#06182e] font-bold tracking-tight leading-none tabular-nums">
                      {tile.value}
                    </p>
                    <p className="text-xs text-[#06182e]/40 para mt-1.5 capitalize">
                      {tile.sub}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Fresh-account empty state */}
            {!summaryLoading && !summaryError && summary && !hasAnyActivity && (
              <EmptyState
                icon={Rocket}
                title="Your City Crew journey starts here"
                message="Play your first challenge, step into the manager's seat, or rate the players you watch — all your history will land here."
                ctaLabel="Play today's challenge"
                onCta={() => router.push("/daily-challenge")}
              />
            )}

            {/* Section cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {[
                {
                  key: "challenges" as Tab,
                  icon: Brain,
                  title: "Daily Challenges",
                  desc: summaryLoading
                    ? "Loading…"
                    : `${summary?.streak ?? 0} day streak · ${summary?.bestTimeFormatted ?? "—"} best time`,
                  color: "#e09225",
                  bg: "bg-[#e09225]/8",
                },
                {
                  key: "game" as Tab,
                  icon: Swords,
                  title: "TCC Manager",
                  desc: summaryLoading
                    ? "Loading…"
                    : `${summary?.xp ?? 0} XP · ${summary?.coins ?? 0} coins · ${summary?.totalMatches ?? 0} matches`,
                  color: "#059669",
                  bg: "bg-[#059669]/8",
                },
                {
                  key: "ratings" as Tab,
                  icon: Star,
                  title: "Player Ratings",
                  desc: summaryLoading
                    ? "Loading…"
                    : `${summary?.ratingsTotal ?? 0} given · ${summary?.ratingsAverage ?? 0}★ average`,
                  color: "#7c3aed",
                  bg: "bg-[#7c3aed]/8",
                },
              ].map((card) => (
                <button
                  key={card.key}
                  onClick={() => openTab(card.key)}
                  className="group bg-[#ece1cf]/60 hover:bg-[#ece1cf] border border-[#06182e]/5 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#06182e]/5"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}
                  >
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                  <p className="text-base font-bold text-[#06182e] flex items-center gap-1.5">
                    {card.title}
                    <ChevronRight
                      size={15}
                      className="text-[#06182e]/25 group-hover:text-[#e09225] group-hover:translate-x-1 transition-all"
                    />
                  </p>
                  <p className="text-xs text-[#06182e]/45 para mt-1">
                    {card.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
