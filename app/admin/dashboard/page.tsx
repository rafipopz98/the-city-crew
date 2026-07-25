"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  PenSquare,
  Heart,
  MessageCircle,
  Trophy,
  Clock,
  Activity,
  Users,
  UserCheck,
  BarChart3,
  Vote,
  TrendingUp,
  Calendar,
  Plus,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  blogs: {
    total: number;
    published: number;
    draft: number;
    views: number;
    likes: number;
    comments: number;
  };
  matches: {
    total: number;
    upcoming: number;
    live: number;
    finished: number;
  };
  players: {
    total: number;
    active: number;
  };
  polls: {
    total: number;
    active: number;
    votes: number;
  };
  users: {
    total: number;
  };
  season: string | null;
}

interface RecentActivity {
  blogs: any[];
  matches: any[];
  players: any[];
  polls: any[];
  dailyChallenges?: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);
  const [dcLoading, setDcLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/admin/dashboard/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      setRecentLoading(true);
      const res = await fetch("/api/admin/dashboard/recent", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch recent activity");
      const data = await res.json();
      setRecent(data);
    } catch (err: any) {
      console.error("Failed to load recent activity:", err);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const fetchDailyChallenges = useCallback(async () => {
    try {
      setDcLoading(true);
      const res = await fetch("/api/admin/daily-challenge?limit=5", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDailyChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error("Failed to load daily challenges:", err);
    } finally {
      setDcLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch both in parallel
    Promise.all([fetchStats(), fetchRecent(), fetchDailyChallenges()]);
  }, [fetchStats, fetchRecent, fetchDailyChallenges]);

  if (!recent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="text-[#e09225] mx-auto animate-spin" />
          <p className="mt-4 text-[#06182e]/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <p className="mt-4 text-[#06182e]/60 font-medium">{error}</p>
          <button
            onClick={() => {
              setError("");
              Promise.all([fetchStats(), fetchRecent()]);
            }}
            className="mt-4 px-4 py-2 bg-[#e09225] text-white rounded-lg hover:bg-[#e09225]/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Blogs",
      value: stats?.blogs.total || 0,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600",
      href: "/admin/blogs",
      loading: statsLoading,
      subStats: [
        {
          label: "Published",
          value: stats?.blogs.published || 0,
          icon: PenSquare,
        },
        { label: "Drafts", value: stats?.blogs.draft || 0, icon: FileText },
      ],
    },
    {
      title: "Blog Engagement",
      value: stats?.blogs.views || 0,
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600",
      href: "/admin/blogs",
      loading: statsLoading,
      subStats: [
        { label: "Likes", value: stats?.blogs.likes || 0, icon: Heart },
        {
          label: "Comments",
          value: stats?.blogs.comments || 0,
          icon: MessageCircle,
        },
      ],
    },
    {
      title: "Total Matches",
      value: stats?.matches.total || 0,
      icon: Trophy,
      color: "bg-orange-500/10 text-orange-600",
      href: "/admin/matches",
      loading: statsLoading,
      subStats: [
        { label: "Upcoming", value: stats?.matches.upcoming || 0, icon: Clock },
        { label: "Live", value: stats?.matches.live || 0, icon: Activity },
      ],
    },
    {
      title: "Total Players",
      value: stats?.players.total || 0,
      icon: Users,
      color: "bg-green-500/10 text-green-600",
      href: "/admin/players",
      loading: statsLoading,
      subStats: [
        { label: "Active", value: stats?.players.active || 0, icon: UserCheck },
      ],
    },
    {
      title: "Total Polls",
      value: stats?.polls.total || 0,
      icon: BarChart3,
      color: "bg-pink-500/10 text-pink-600",
      href: "/admin/polls",
      loading: statsLoading,
      subStats: [
        { label: "Active", value: stats?.polls.active || 0, icon: Activity },
        { label: "Votes", value: stats?.polls.votes || 0, icon: Vote },
      ],
    },
    {
      title: "Total Users",
      value: stats?.users.total || 0,
      icon: Users,
      color: "bg-indigo-500/10 text-indigo-600",
      href: "#",
      loading: statsLoading,
      subStats: [],
    },
  ];

  const quickActions = [
    {
      label: "Create Blog",
      href: "/admin/blogs",
      icon: Plus,
      color: "bg-[#e09225] hover:bg-[#e09225]/90",
    },
    {
      label: "Add Match",
      href: "/admin/matches",
      icon: Plus,
      color: "bg-[#06182e] hover:bg-[#06182e]/90",
    },
    {
      label: "Add Player",
      href: "/admin/players",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Create Poll",
      href: "/admin/polls",
      icon: Plus,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  // Skeleton component for loading cards
  const StatCardSkeleton = () => (
    <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-[#06182e]/10 w-12 h-12" />
        <div className="w-5 h-5 bg-[#06182e]/10 rounded" />
      </div>
      <div className="h-8 bg-[#06182e]/10 rounded w-24 mb-1" />
      <div className="h-4 bg-[#06182e]/10 rounded w-32 mb-4" />
      <div className="border-t border-[#06182e]/8 pt-4 space-y-2">
        <div className="h-4 bg-[#06182e]/10 rounded w-full" />
        <div className="h-4 bg-[#06182e]/10 rounded w-3/4" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
          Overview
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#06182e]">
          Dashboard
        </h1>
        <p className="mt-2 text-[#06182e]/60 max-w-xl">
          Welcome back! Here&apos;s what&apos;s happening with your platform
          {stats?.season && (
            <span className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-[#e09225]">
              <Calendar size={14} />
              Season {stats.season}
            </span>
          )}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`${action.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <action.icon size={20} />
            <span className="font-medium text-sm">{action.label}</span>
            <ArrowUpRight size={16} className="ml-auto opacity-70" />
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-6 hover:border-[#e09225]/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <card.icon size={24} />
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-[#06182e]/30 group-hover:text-[#e09225] transition-colors"
                  />
                </div>

                <p className="text-3xl font-bold text-[#06182e] mb-1">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-[#06182e]/60 font-medium mb-4">
                  {card.title}
                </p>

                {card.subStats.length > 0 && (
                  <div className="border-t border-[#06182e]/8 pt-4 space-y-2">
                    {card.subStats.map((sub) => (
                      <div
                        key={sub.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2 text-[#06182e]/50">
                          <sub.icon size={14} />
                          {sub.label}
                        </span>
                        <span className="font-semibold text-[#06182e]">
                          {sub.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
      </div>

      {/* ── Daily Challenges ── */}
      <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-[#06182e] flex items-center gap-2 min-w-0">
            <BarChart3 size={18} className="text-[#e09225] shrink-0" />
            <span className="truncate">Daily Challenges</span>
          </h2>
          <Link
            href="/admin/daily-challenge"
            className="text-xs sm:text-sm font-medium text-[#e09225] hover:underline shrink-0"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {dcLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse p-2.5 sm:p-3">
                <div className="h-4 bg-[#06182e]/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#06182e]/10 rounded w-1/4" />
              </div>
            ))
          ) : dailyChallenges.length > 0 ? (
            dailyChallenges.map((dc: any) => (
              <div
                key={dc._id}
                className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl hover:bg-[#f4ebda] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#06182e] truncate">
                    {dc.title}
                  </p>
                  <p className="text-xs text-[#06182e]/50 mt-0.5 truncate">
                    {dc.challengeDate} • {dc.totalParticipants || 0} participant{dc.totalParticipants !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${
                    dc.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : dc.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {dc.status}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Link
                href="/admin/daily-challenge/create"
                className="inline-flex items-center gap-2 text-sm text-[#e09225] hover:underline"
              >
                <Plus size={14} />
                Create your first challenge
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Blogs */}
        <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-[#06182e] flex items-center gap-2 min-w-0">
              <FileText size={18} className="text-[#e09225] shrink-0" />
              <span className="truncate">Recent Blogs</span>
            </h2>
            <Link
              href="/admin/blogs"
              className="text-xs sm:text-sm font-medium text-[#e09225] hover:underline shrink-0"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-2.5 sm:p-3">
                  <div className="h-4 bg-[#06182e]/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#06182e]/10 rounded w-1/4" />
                </div>
              ))
            ) : recent?.blogs?.length > 0 ? (
              recent.blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl hover:bg-[#f4ebda] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#06182e] truncate">
                      {blog.title}
                    </p>
                    <p className="text-xs text-[#06182e]/50 mt-0.5 truncate">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-700"
                        : blog.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#06182e]/50 text-center py-6 sm:py-8">
                No blogs yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-[#06182e] flex items-center gap-2 min-w-0">
              <Trophy size={18} className="text-[#e09225] shrink-0" />
              <span className="truncate">Recent Matches</span>
            </h2>
            <Link
              href="/admin/matches"
              className="text-xs sm:text-sm font-medium text-[#e09225] hover:underline shrink-0"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-2.5 sm:p-3">
                  <div className="h-4 bg-[#06182e]/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#06182e]/10 rounded w-1/2" />
                </div>
              ))
            ) : recent?.matches?.length > 0 ? (
              recent.matches.map((match) => (
                <div
                  key={match._id}
                  className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl hover:bg-[#f4ebda] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#06182e] truncate">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    <p className="text-xs text-[#06182e]/50 mt-0.5 truncate">
                      {match.competition}
                      {match.matchDate && ` • ${new Date(match.matchDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${
                      match.status === "finished"
                        ? "bg-blue-100 text-blue-700"
                        : match.status === "live"
                          ? "bg-red-100 text-red-700"
                          : match.status === "upcoming"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {match.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#06182e]/50 text-center py-6 sm:py-8">
                No matches yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Players */}
        <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-[#06182e] flex items-center gap-2 min-w-0">
              <Users size={18} className="text-[#e09225] shrink-0" />
              <span className="truncate">Recent Players</span>
            </h2>
            <Link
              href="/admin/players"
              className="text-xs sm:text-sm font-medium text-[#e09225] hover:underline shrink-0"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-2.5 sm:p-3">
                  <div className="h-4 bg-[#06182e]/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#06182e]/10 rounded w-1/3" />
                </div>
              ))
            ) : recent?.players?.length > 0 ? (
              recent.players.map((player) => (
                <div
                  key={player._id}
                  className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl hover:bg-[#f4ebda] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#06182e] truncate">
                      {player.name}
                    </p>
                    <p className="text-xs text-[#06182e]/50 mt-0.5 truncate">
                      {player.position}
                      {player.number && ` • #${player.number}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] sm:text-xs text-[#06182e]/50 whitespace-nowrap">
                    {new Date(player.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#06182e]/50 text-center py-6 sm:py-8">
                No players yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Polls */}
        <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-[#06182e] flex items-center gap-2 min-w-0">
              <BarChart3 size={18} className="text-[#e09225] shrink-0" />
              <span className="truncate">Recent Polls</span>
            </h2>
            <Link
              href="/admin/polls"
              className="text-xs sm:text-sm font-medium text-[#e09225] hover:underline shrink-0"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-2.5 sm:p-3">
                  <div className="h-4 bg-[#06182e]/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#06182e]/10 rounded w-1/4" />
                </div>
              ))
            ) : recent?.polls?.length > 0 ? (
              recent.polls.map((poll) => (
                <div
                  key={poll._id}
                  className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl hover:bg-[#f4ebda] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#06182e] truncate">
                      {poll.title}
                    </p>
                    <p className="text-xs text-[#06182e]/50 mt-0.5 truncate">
                      {poll.total_votes} vote{poll.total_votes !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${
                      poll.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {poll.is_active ? "Active" : "Closed"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#06182e]/50 text-center py-6 sm:py-8">
                No polls yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
