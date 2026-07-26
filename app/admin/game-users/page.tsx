"use client";

import { useState, useEffect } from "react";
import { Search, Zap, Coins, User, Activity, Swords } from "lucide-react";

type GameUser = {
  _id: string;
  userId: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  username: string;
  xp: number;
  coins: number;
  has_completed_onboarding: boolean;
  starter_pack_claimed: boolean;
  total_matches: number;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  current_streak: number;
  longest_streak: number;
  goals_scored: number;
  goals_conceded: number;
  createdAt: string;
};

export default function AdminGameUsersPage() {
  const [gameUsers, setGameUsers] = useState<GameUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/game-users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setGameUsers(data.gameUsers);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.error("Error fetching game users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const getWinRate = (wins: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  return (
    <main className="min-h-screen bg-[#ece1cf]">
      <div className="w-full px-5">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
              Game Management
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#06182e]">
              Game Users
            </h1>
            <p className="mt-2 text-sm text-[#06182e]/60">
              {totalUsers} game user{totalUsers !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: totalUsers, icon: User, color: "#e09225" },
            { label: "Total XP", value: gameUsers.reduce((a, u) => a + u.xp, 0).toLocaleString(), icon: Zap, color: "#a855f7" },
            { label: "Total Coins", value: gameUsers.reduce((a, u) => a + u.coins, 0).toLocaleString(), icon: Coins, color: "#f59e0b" },
            { label: "Total Matches", value: gameUsers.reduce((a, u) => a + u.total_matches, 0).toLocaleString(), icon: Swords, color: "#22c55e" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#06182e]/10 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">{stat.label}</p>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-[#06182e] tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#06182e]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#06182e]/10 text-sm text-[#06182e] placeholder:text-[#06182e]/30 focus:outline-none focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#e09225] text-white text-sm font-medium hover:bg-[#e09225]/90 transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-[#06182e]/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#06182e]/10 rounded w-1/3" />
                    <div className="h-3 bg-[#06182e]/10 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : gameUsers.length === 0 ? (
            <div className="p-12 text-center">
              <User size={40} className="mx-auto text-[#06182e]/20 mb-3" />
              <p className="text-sm text-[#06182e]/50">No game users found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#06182e]/8">
              {gameUsers.map((gu) => {
                const winRate = getWinRate(gu.total_wins, gu.total_matches);
                const name = gu.userId
                  ? `${gu.userId.first_name} ${gu.userId.last_name}`
                  : "Unknown";
                return (
                  <div key={gu._id} className="p-4 hover:bg-[#f4ebda] transition-colors">
                    {/* Top row: user info + key stats */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e09225]/20 to-[#e09225]/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#e09225]">
                          {gu.username?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#06182e] truncate">
                          {gu.username}
                        </p>
                        <p className="text-xs text-[#06182e]/50 truncate">
                          {name} · {gu.userId?.email || "no email"}
                        </p>
                      </div>
                      {/* Quick stats */}
                      <div className="hidden sm:flex items-center gap-4 text-xs">
                        <div className="text-center">
                          <p className="font-bold text-[#06182e] tabular-nums">{gu.xp.toLocaleString()}</p>
                          <p className="text-[10px] text-[#06182e]/40">XP</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[#06182e] tabular-nums">{gu.coins.toLocaleString()}</p>
                          <p className="text-[10px] text-[#06182e]/40">Coins</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[#06182e] tabular-nums">{gu.total_matches}</p>
                          <p className="text-[10px] text-[#06182e]/40">Matches</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-bold tabular-nums ${winRate >= 50 ? "text-green-600" : "text-[#06182e]"}`}>
                            {winRate}%
                          </p>
                          <p className="text-[10px] text-[#06182e]/40">Win Rate</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded stats row - mobile friendly */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white/50 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#06182e]/50">
                          <Zap size={11} className="text-purple-500" />
                          <span>XP</span>
                        </div>
                        <p className="text-sm font-bold text-[#06182e] tabular-nums">{gu.xp.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#06182e]/50">
                          <Coins size={11} className="text-amber-500" />
                          <span>Coins</span>
                        </div>
                        <p className="text-sm font-bold text-[#06182e] tabular-nums">{gu.coins.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#06182e]/50">
                          <Swords size={11} className="text-green-500" />
                          <span>Record</span>
                        </div>
                        <p className="text-sm font-bold text-[#06182e] tabular-nums">
                          {gu.total_wins}W · {gu.total_draws}D · {gu.total_losses}L
                        </p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#06182e]/50">
                          <Activity size={11} className="text-blue-500" />
                          <span>Streak</span>
                        </div>
                        <p className="text-sm font-bold text-[#06182e] tabular-nums">
                          {gu.current_streak > 0 ? `🔥 ${gu.current_streak}` : `${gu.current_streak}`}
                        </p>
                      </div>
                    </div>

                    {/* Goals row */}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[#06182e]/50 flex-wrap">
                      <span>⚽ {gu.goals_scored} scored</span>
                      <span>🥅 {gu.goals_conceded} conceded</span>
                      {gu.longest_streak > 0 && (
                        <span>· Best streak: {gu.longest_streak}</span>
                      )}
                      {gu.createdAt && (
                        <span>· Joined {new Date(gu.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}</span>
                      )}
                      <div className="flex gap-2 ml-auto">
                        {!gu.has_completed_onboarding && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            Onboarding incomplete
                          </span>
                        )}
                        {!gu.starter_pack_claimed && gu.has_completed_onboarding && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            Starter pack not claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#06182e]/50 order-2 sm:order-none">
              Page {page} of {totalPages} ({totalUsers} total)
            </p>
            <div className="flex gap-2 order-1 sm:order-none">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#06182e]/10 text-xs sm:text-sm font-medium text-[#06182e]/70 hover:bg-[#f4ebda] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#06182e]/10 text-xs sm:text-sm font-medium text-[#06182e]/70 hover:bg-[#f4ebda] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
