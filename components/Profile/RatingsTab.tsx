"use client";

import { useState } from "react";
import {
  Star,
  Trophy,
  Users,
  BarChart3,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Loader2,
  Shirt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StatTile, TileSkeleton, ListSkeleton, EmptyState, Stars, timeAgo } from "./ui";

type PlayerInfo = {
  id: string;
  name: string;
  position: string;
  image: string;
};

type MatchInfo = {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore: number;
  awayScore: number;
  competition: string;
  matchDate: string;
};

type MatchGroup = {
  match: MatchInfo | null;
  players: {
    id: string;
    rating: number;
    createdAt: string;
    player: PlayerInfo | null;
  }[];
};

export type RatingsData = {
  summary: {
    total: number;
    averageRating: number;
    fiveStars: number;
    uniquePlayers: number;
  };
  matches: MatchGroup[];
  pagination: {
    page: number;
    limit: number;
    totalMatches: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export function RatingsTab({
  data,
  loading,
  error,
  onRetry,
  onLoadMore,
  loadingMore,
}: {
  data: RatingsData | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  loadingMore: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
            Couldn&apos;t load your ratings
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

  const { summary, matches, pagination } = data;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Star}
          label="Ratings given"
          value={summary.total}
          accent="#e09225"
        />
        <StatTile
          icon={BarChart3}
          label="Avg rating"
          value={summary.averageRating}
          accent="#0d9488"
          bg="bg-[#0d9488]/8"
        />
        <StatTile
          icon={Trophy}
          label="Five stars"
          value={summary.fiveStars}
          accent="#d97706"
          bg="bg-[#d97706]/8"
        />
        <StatTile
          icon={Users}
          label="Players rated"
          value={summary.uniquePlayers}
          accent="#7c3aed"
          bg="bg-[#7c3aed]/8"
        />
      </div>

      {/* Match-wise history */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star size={13} className="text-[#06182e]/30" />
          <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
            Rating history
          </h3>
          <span className="ml-auto text-[11px] font-bold text-[#06182e]/30 para">
            {pagination.totalMatches} match
            {pagination.totalMatches !== 1 ? "es" : ""}
          </span>
        </div>

        {matches.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No ratings yet"
            message="After a finished match, head to the match hub and rate the players you watched."
            ctaLabel="Browse matches"
            onCta={() => router.push("/matches")}
          />
        ) : (
          <div className="space-y-2.5">
            {matches.map((group, groupIndex) => {
              const isExpanded = expanded[group.match?.id ?? groupIndex] ?? false;
              const visiblePlayers = isExpanded
                ? group.players
                : group.players.slice(0, 5);

              return (
                <div
                  key={group.match?.id ?? `unknown-${groupIndex}`}
                  className="bg-white/50 rounded-2xl border border-[#06182e]/6 overflow-hidden"
                >
                  {/* Match header — minimal strip */}
                  {group.match ? (
                    <button
                      onClick={() => router.push(`/match-hub/${group.match?.id}`)}
                      className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left bg-[#ece1cf]/60 hover:bg-[#ece1cf] transition-colors group/match"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-[0.14em] text-[#06182e]/35 font-bold shrink-0">
                          {group.match.competition}
                        </span>
                        <span className="hidden sm:block h-3 w-px bg-[#06182e]/10" />
                        <span className="text-[13px] sm:text-sm font-semibold text-[#06182e] truncate">
                          {group.match.homeTeam?.name}
                        </span>
                        <span className="text-sm font-bold text-[#06182e]/70 tabular-nums shrink-0">
                          {group.match.homeScore}–{group.match.awayScore}
                        </span>
                        <span className="text-[13px] sm:text-sm font-semibold text-[#06182e] truncate">
                          {group.match.awayTeam?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline text-[11px] text-[#06182e]/35 para">
                          {timeAgo(group.match.matchDate)}
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-[#06182e]/25 group-hover/match:text-[#e09225] group-hover/match:translate-x-0.5 transition-all"
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="px-4 sm:px-5 py-2.5 bg-[#ece1cf]/60 text-[#06182e]/40 text-xs font-semibold">
                      Match unavailable
                    </div>
                  )}

                  {/* Table header */}
                  {group.players.length > 0 && (
                    <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-3 px-5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#06182e]/30">
                      <span>Player</span>
                      <span className="w-24 text-center">Rating</span>
                      <span className="w-16 text-right">When</span>
                    </div>
                  )}

                  {/* Players — minimal table rows */}
                  <div className="divide-y divide-[#06182e]/5">
                    {visiblePlayers.map((r) => (
                      <div
                        key={r.id}
                        className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-3 px-4 sm:px-5 py-2.5"
                      >
                        {/* Player */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#ece1cf] flex items-center justify-center shrink-0 border border-[#06182e]/5">
                            {r.player?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.player.image}
                                alt={r.player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Shirt size={13} className="text-[#e09225]/50" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#06182e] leading-tight truncate">
                              {r.player?.name || "Unknown player"}
                            </p>
                            <p className="text-[11px] text-[#06182e]/40 para truncate">
                              {r.player?.position || "—"}
                              <span className="text-[#06182e]/25 sm:hidden">
                                {" "}· {timeAgo(r.createdAt)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex sm:w-24 sm:justify-center justify-end">
                          <Stars value={r.rating} size={11} />
                        </div>

                        {/* When — desktop column only */}
                        <span className="hidden sm:block w-16 text-right text-[11px] text-[#06182e]/35 para">
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expand / collapse players */}
                  {group.players.length > 5 && (
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [group.match?.id ?? groupIndex]: !isExpanded,
                        }))
                      }
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-[#e09225] hover:bg-[#e09225]/8 transition-colors"
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

            {/* Load more */}
            {pagination.hasMore && (
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-[#06182e]/10 text-[#06182e]/70 text-sm font-bold hover:bg-[#06182e]/5 hover:text-[#e09225] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ChevronDown size={15} />
                )}
                {loadingMore ? "Loading more…" : "Load more matches"}
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => router.push("/matches")}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06182e] text-[#FFF5E5] text-sm font-bold hover:bg-[#0a223f] active:scale-[0.99] transition-all shadow-sm"
      >
        Browse finished matches
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
