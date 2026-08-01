"use client";

import {
  Swords,
  Trophy,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Clock,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StatTile, TileSkeleton, ListSkeleton, EmptyState, timeAgo } from "./ui";

export type GameUser = {
  username: string;
  xp: number;
  coins: number;
  total_matches: number;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  goals_scored: number;
  goals_conceded: number;
  current_streak: number;
  longest_streak: number;
  ownedCount?: number;
  hasSquad?: boolean;
};

export type MatchItem = {
  id: string;
  userScore: number;
  opponentScore: number;
  opponentName: string;
  result: "win" | "loss" | "draw";
  xpEarned: number;
  coinsEarned: number;
  userShots: number;
  opponentShots: number;
  createdAt: string;
};

export function GameTab({
  gameUser,
  matches,
  userLoading,
  historyLoading,
  error,
  onRetry,
}: {
  gameUser: GameUser | null;
  matches: MatchItem[];
  userLoading: boolean;
  historyLoading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const router = useRouter();

  if (userLoading) {
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

  if (error || !gameUser) {
    return (
      <div className="flex flex-col items-center gap-4 text-center bg-[#e09225]/8 border border-[#e09225]/12 rounded-2xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
          <AlertCircle size={24} className="text-[#e09225]" />
        </div>
        <div>
          <p className="text-base font-bold text-[#06182e]">
            Couldn&apos;t load game stats
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

  const winRate =
    gameUser.total_matches > 0
      ? Math.round((gameUser.total_wins / gameUser.total_matches) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Currency row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#e09225]/20 bg-gradient-to-br from-[#e09225]/15 to-[#e09225]/5 p-4 sm:p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#e09225]/15 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-[#e09225]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#06182e] tabular-nums leading-none">
              {gameUser.xp.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#06182e]/45 para font-semibold uppercase tracking-wider mt-1">
              Total XP
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#d97706]/20 bg-gradient-to-br from-[#d97706]/12 to-[#d97706]/4 p-4 sm:p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#d97706]/12 flex items-center justify-center shrink-0">
            <Star size={20} className="text-[#d97706]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#06182e] tabular-nums leading-none">
              {gameUser.coins.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#06182e]/45 para font-semibold uppercase tracking-wider mt-1">
              Coins
            </p>
          </div>
        </div>
      </div>

      {/* Career stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Swords}
          label="Matches"
          value={gameUser.total_matches}
          accent="#2563eb"
          bg="bg-[#2563eb]/8"
        />
        <StatTile
          icon={Trophy}
          label="Wins"
          value={gameUser.total_wins}
          accent="#059669"
          bg="bg-[#059669]/8"
        />
        <StatTile
          icon={TrendingUp}
          label="Win rate"
          value={winRate}
          suffix="%"
          accent="#e09225"
        />
        <StatTile
          icon={Zap}
          label="Best streak"
          value={gameUser.longest_streak}
          suffix={gameUser.longest_streak === 1 ? " win" : " wins"}
          accent="#7c3aed"
          bg="bg-[#7c3aed]/8"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Target}
          label="Goals for"
          value={gameUser.goals_scored}
          accent="#0d9488"
          bg="bg-[#0d9488]/8"
        />
        <StatTile
          icon={Shield}
          label="Goals against"
          value={gameUser.goals_conceded}
          accent="#dc2626"
          bg="bg-[#dc2626]/8"
        />
        <StatTile
          icon={Swords}
          label="Losses"
          value={gameUser.total_losses}
          accent="#dc2626"
          bg="bg-[#dc2626]/8"
        />
        <StatTile
          icon={Swords}
          label="Draws"
          value={gameUser.total_draws}
          accent="#64748b"
          bg="bg-[#64748b]/8"
        />
      </div>

      {/* Recent matches */}
      <div className="bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={13} className="text-[#06182e]/30" />
          <h3 className="text-xs font-bold text-[#06182e]/45 para uppercase tracking-wider">
            Recent matches
          </h3>
          <button
            onClick={() => router.push("/game/history")}
            className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#e09225] font-bold hover:underline"
          >
            View all history
            <ChevronRight size={12} />
          </button>
        </div>

        {historyLoading ? (
          <ListSkeleton rows={3} />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="No matches played yet"
            message="Step into the manager's seat and play your first TCC Manager match."
            ctaLabel="Play now"
            onCta={() => router.push("/game")}
          />
        ) : (
          <div className="divide-y divide-[#06182e]/6">
            {matches.map((m) => {
              const isWin = m.result === "win";
              const isLoss = m.result === "loss";
              const color = isWin
                ? "#059669"
                : isLoss
                  ? "#dc2626"
                  : "#64748b";
              return (
                <button
                  key={m.id}
                  onClick={() => router.push(`/game/match/${m.id}`)}
                  className="w-full flex items-center gap-3 py-3 text-left group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}14` }}
                  >
                    <Swords size={16} style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#06182e] leading-tight truncate">
                      vs {m.opponentName}
                    </p>
                    <p className="text-xs text-[#06182e]/40 para mt-0.5">
                      {timeAgo(m.createdAt)} · +{m.xpEarned} XP ·{" "}
                      {m.userShots}–{m.opponentShots} shots
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="text-base font-extrabold leading-none tabular-nums"
                      style={{ color }}
                    >
                      {m.userScore}–{m.opponentScore}
                    </p>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color }}
                    >
                      {m.result}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => router.push("/game/home")}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06182e] text-[#FFF5E5] text-sm font-bold hover:bg-[#0a223f] active:scale-[0.99] transition-all shadow-sm"
      >
        Open TCC Manager
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
