"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Target,
  Clock,
  Trophy,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  Medal,
  Timer,
  Star,
  Mail,
  Calendar,
} from "lucide-react";
import api from "@/lib/api/axios";

type Participant = {
  rank: number;
  name: string;
  email: string;
  score: number;
  completionTimeMs: number;
  submittedAt: string;
};

type Stats = {
  challenge: {
    title: string;
    challengeDate: string;
    status: string;
  };
  stats: {
    totalParticipants: number;
    completedAttempts: number;
    participationRate: number;
    averageAccuracy: number;
    averageScore: number;
    averageCompletionTimeMs: number;
    bestScore: number;
    bestTimeMs: number;
  };
  scoreDistribution: { score: number; count: number }[];
  mostMissedQuestions: {
    _id: string;
    question: string;
    correctAnswer: string;
    options: string[];
    order: number;
    correctCount: number;
    totalCount: number;
    accuracy: number;
  }[];
  mostCorrectQuestions: {
    _id: string;
    question: string;
    correctAnswer: string;
    options: string[];
    order: number;
    correctCount: number;
    totalCount: number;
    accuracy: number;
  }[];
  dailyCompletionCount: { _id: string; count: number }[];
  participants: Participant[];
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

/* ── Skeleton Components ────────────────────────────── */

function StatsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#06182e]/8" />
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-[#06182e]/8" />
          <div className="h-8 w-64 rounded bg-[#06182e]/8" />
          <div className="h-4 w-32 rounded bg-[#06182e]/8" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#06182e]/8" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 rounded bg-[#06182e]/8" />
                <div className="h-6 w-16 rounded bg-[#06182e]/8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution skeleton */}
      <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-6">
        <div className="h-6 w-40 rounded bg-[#06182e]/8 mb-6" />
        <div className="flex items-end gap-3 h-32">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="h-4 w-8 rounded bg-[#06182e]/8" />
              <div
                className="w-full rounded-lg bg-[#06182e]/8"
                style={{ height: `${25 + i * 10}%` }}
              />
              <div className="h-4 w-8 rounded bg-[#06182e]/8" />
            </div>
          ))}
        </div>
      </div>

      {/* Questions section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded bg-[#06182e]/8" />
              <div className="h-5 w-40 rounded bg-[#06182e]/8" />
            </div>
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="p-3 rounded-xl bg-[#06182e]/[0.02] border border-[#06182e]/5 mb-2"
              >
                <div className="h-4 w-3/4 rounded bg-[#06182e]/8 mb-2" />
                <div className="h-3 w-1/2 rounded bg-[#06182e]/8" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Participants skeleton */}
      <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-6">
        <div className="h-6 w-44 rounded bg-[#06182e]/8 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl bg-[#06182e]/[0.02]"
            >
              <div className="w-8 h-8 rounded-full bg-[#06182e]/8" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/4 rounded bg-[#06182e]/8" />
                <div className="h-3 w-1/3 rounded bg-[#06182e]/8" />
              </div>
              <div className="h-6 w-12 rounded bg-[#06182e]/8" />
              <div className="h-6 w-16 rounded bg-[#06182e]/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
}) {
  return (      <div
      className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
        accent
          ? "bg-[#e09225]/5 border-[#e09225]/10"
          : "bg-[#ece1cf] border-[#06182e]/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl ${
            accent
              ? "bg-[#e09225]/10 text-[#e09225]"
              : "bg-[#06182e]/5 text-[#06182e]/50"
          }`}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[#06182e]/40 font-medium">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#06182e] mt-1">{value}</p>
          {sublabel && (
            <p className="text-xs text-[#06182e]/40 mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Score Distribution Bar ─────────────────────────── */

function ScoreBar({
  score,
  count,
  maxCount,
}: {
  score: number;
  count: number;
  maxCount: number;
}) {
  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const isPerfect = score === 5;
  const isGood = score >= 3;
  const barColor = isPerfect
    ? "bg-emerald-500"
    : isGood
      ? "bg-[#e09225]"
      : "bg-[#06182e]/20";
  return (
    <div className="flex-1 flex flex-col items-center gap-1 self-stretch min-h-0">
      <span className="shrink-0 text-xs text-[#06182e]/40 font-medium tabular-nums">
        {count}
      </span>
      {/* Spacer pushes bar to bottom */}
      <div className="flex-1 w-full flex flex-col justify-end min-h-0">
        <div
          className="w-full rounded-lg bg-[#06182e]/5 overflow-hidden"
          style={{ height: `${Math.max(height, 6)}%` }}
        >
          <div
            className={`w-full h-full rounded-lg ${barColor} transition-all duration-1000`}
          />
        </div>
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-[#06182e]/60 tabular-nums">
        {score}/{score === 5 ? "5" : "5"}
      </span>
    </div>
  );
}

/* ── Main Component ────────────────────────────────── */

export default function ChallengeStatsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/admin/daily-challenge/stats?challengeId=${params.id}`,
        );
        setData(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [params.id]);

  if (loading) return <StatsPageSkeleton />;

  if (!data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#e09225]" />
          <p className="text-sm text-[#06182e]/50">Loading stats...</p>
        </div>
      </div>
    );
  }

  const maxScoreCount = Math.max(
    ...data.scoreDistribution.map((s) => s.count),
    1,
  );
  const displayedParticipants = showAllParticipants
    ? data.participants
    : data.participants.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-[#06182e]/40 hover:text-[#06182e] hover:bg-white/50 transition-all self-start"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
            Challenge Analytics
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-[#06182e] break-words">
            {data.challenge.title}
          </h1>
          <p className="text-sm text-[#06182e]/50 mt-1">
            {data.challenge.challengeDate}
          </p>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Participants"
          value={data.stats.totalParticipants}
          sublabel={`${data.stats.completedAttempts} completed`}
        />
        <StatCard
          icon={Target}
          label="Avg Accuracy"
          value={`${data.stats.averageAccuracy}%`}
          sublabel={`${data.stats.averageScore}/5 avg score`}
          accent
        />
        <StatCard
          icon={Timer}
          label="Avg Time"
          value={formatTime(data.stats.averageCompletionTimeMs)}
          sublabel={`Best: ${data.stats.bestTimeMs ? formatTime(data.stats.bestTimeMs) : "N/A"}`}
        />
        <StatCard
          icon={Trophy}
          label="Best Score"
          value={`${data.stats.bestScore}/5`}
          sublabel={`${data.stats.participationRate}% participation rate`}
        />
      </div>

      {/* ── Score Distribution ── */}
      <div className="bg-[#ece1cf] rounded-2xl border border-[#06182e]/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-[#e09225]" />
          <h2 className="text-lg font-bold text-[#06182e]">
            Score Distribution
          </h2>
        </div>
        <div className="flex items-end gap-2 sm:gap-3 h-36 sm:h-44">
          {[0, 1, 2, 3, 4, 5].map((score) => {
            const item = data.scoreDistribution.find(
              (s) => s.score === score,
            );
            return (
              <ScoreBar
                key={score}
                score={score}
                count={item?.count || 0}
                maxCount={maxScoreCount}
              />
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-[#06182e]/40">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Perfect (5/5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#e09225]" />
            <span>Pass (3-4/5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#06182e]/20" />
            <span>Low (0-2/5)</span>
          </div>
        </div>
      </div>

      {/* ── Question Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Missed */}
        <div className="bg-[#ece1cf] rounded-2xl border border-[#06182e]/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-red-400" />
            <h2 className="text-lg font-bold text-[#06182e]">
              Most Missed Questions
            </h2>
          </div>
          {data.mostMissedQuestions.length > 0 ? (
            <div className="space-y-3">
              {data.mostMissedQuestions.map((q, i) => (
                <div
                  key={q._id}
                  className="p-3 rounded-xl bg-red-50/50 border border-red-100"
                >
                  <p className="text-sm font-medium text-[#06182e]">
                    <span className="text-[#06182e]/30 mr-1.5">{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#06182e]/50">
                    <span className="text-red-500 font-medium">
                      {q.accuracy}% accuracy
                    </span>
                    <span>
                      {q.correctCount}/{q.totalCount} correct
                    </span>
                    <span className="text-emerald-600 font-medium">
                      ✓ {q.correctAnswer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#06182e]/40 text-center py-8">
              No data yet
            </p>
          )}
        </div>

        {/* Most Correct */}
        <div className="bg-[#ece1cf] rounded-2xl border border-[#06182e]/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-[#06182e]">
              Most Correct Questions
            </h2>
          </div>
          {data.mostCorrectQuestions.length > 0 ? (
            <div className="space-y-3">
              {data.mostCorrectQuestions.map((q, i) => (
                <div
                  key={q._id}
                  className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
                >
                  <p className="text-sm font-medium text-[#06182e]">
                    <span className="text-[#06182e]/30 mr-1.5">{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#06182e]/50">
                    <span className="text-emerald-600 font-medium">
                      {q.accuracy}% accuracy
                    </span>
                    <span>
                      {q.correctCount}/{q.totalCount} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#06182e]/40 text-center py-8">
              No data yet
            </p>
          )}
        </div>
      </div>

      {/* ── Participants ── */}
      <div className="bg-[#ece1cf] rounded-2xl border border-[#06182e]/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={18} className="text-[#e09225]" />
          <h2 className="text-lg font-bold text-[#06182e]">
            Participants ({data.participants.length})
          </h2>
        </div>

        {data.participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={40} className="text-[#06182e]/10 mb-3" />
            <p className="text-sm text-[#06182e]/40">No participants yet</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-[#06182e]/5 text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">
              <span>Rank</span>
              <span>Name</span>
              <span>Score</span>
              <span>Time</span>
            </div>

            {/* Participants List */}
            <div className="divide-y divide-[#06182e]/5">
              {displayedParticipants.map((p) => (
                <div
                  key={`${p.email}-${p.rank}`}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-2 sm:gap-4 px-4 py-3 hover:bg-[#06182e]/[0.02] transition-colors items-center"
                >
                  {/* Rank - mobile shows inline */}
                  <div className="flex items-center gap-3 sm:gap-0">
                    <span className="w-8 h-8 rounded-full bg-[#06182e]/5 flex items-center justify-center text-xs font-bold text-[#06182e]/50 shrink-0">
                      {p.rank <= 3 ? (
                        <Medal
                          size={14}
                          className={
                            p.rank === 1
                              ? "text-yellow-500"
                              : p.rank === 2
                                ? "text-gray-400"
                                : "text-orange-400"
                          }
                        />
                      ) : (
                        p.rank
                      )}
                    </span>
                    <div className="sm:hidden min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#06182e] truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#06182e]/40 truncate">
                        {p.email}
                      </p>
                    </div>
                  </div>

                  {/* Name - desktop only */}
                  <div className="hidden sm:block min-w-0">
                    <p className="text-sm font-medium text-[#06182e] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[#06182e]/40 truncate">
                      {p.email}
                    </p>
                  </div>

                  {/* Score & Time - mobile: side by side */}
                  <div className="flex items-center gap-4 sm:gap-0 sm:flex-col sm:items-end ml-11 sm:ml-0">
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="text-[#e09225]" />
                      <span className="text-sm font-bold text-[#06182e] tabular-nums">
                        {p.score}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[#06182e]/30" />
                      <span className="text-xs text-[#06182e]/50 tabular-nums">
                        {formatTime(p.completionTimeMs)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show more / Show less */}
            {data.participants.length > 10 && (
              <button
                onClick={() => setShowAllParticipants(!showAllParticipants)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#06182e]/5 text-sm font-medium text-[#06182e]/50 hover:bg-[#06182e]/10 hover:text-[#06182e] transition-all"
              >
                {showAllParticipants
                  ? "Show less"
                  : `Show all ${data.participants.length} participants`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
