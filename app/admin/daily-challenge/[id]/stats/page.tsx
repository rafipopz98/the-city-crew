"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Target,
  Clock,
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import api from "@/lib/api/axios";

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
};

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
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "bg-[#e09225]/5 border-[#e09225]/10"
          : "bg-white/60 backdrop-blur-sm border-[#06182e]/5 shadow-sm"
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

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function ChallengeStatsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#e09225]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-[#06182e]/40">
        Failed to load stats
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-[#06182e]/40 hover:text-[#06182e] hover:bg-white/50 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#06182e]">
            {data.challenge.title} — Stats
          </h1>
          <p className="text-sm text-[#06182e]/50 mt-1">
            {data.challenge.challengeDate}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
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
          icon={Clock}
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

      {/* Score Distribution */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#06182e]/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#06182e] mb-4">
          Score Distribution
        </h2>
        <div className="flex items-end gap-3 h-40">
          {[0, 1, 2, 3, 4, 5].map((score) => {
            const item = data.scoreDistribution.find(
              (s) => s.score === score,
            );
            const count = item?.count || 0;
            const maxCount = Math.max(
              ...data.scoreDistribution.map((s) => s.count),
              1,
            );
            const height = (count / maxCount) * 100;
            return (
              <div key={score} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-[#06182e]/40 font-medium">
                  {count}
                </span>
                <div
                  className="w-full rounded-lg bg-[#e09225]/20 transition-all duration-500"
                  style={{ height: `${Math.max(height, 4)}%` }}
                >
                  <div
                    className="w-full rounded-lg bg-[#e09225] transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#06182e]/60">
                  {score}/{score === 5 ? "5 ✓" : "5"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Missed / Most Correct */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Missed */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#06182e]/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-red-400" />
            <h2 className="text-lg font-bold text-[#06182e]">
              Most Missed Questions
            </h2>
          </div>
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
                <div className="flex items-center gap-3 mt-2 text-xs text-[#06182e]/50">
                  <span className="text-red-500">{q.accuracy}% accuracy</span>
                  <span>
                    {q.correctCount}/{q.totalCount} correct
                  </span>
                  <span className="text-emerald-600">
                    ✓ {q.correctAnswer}
                  </span>
                </div>
              </div>
            ))}
            {data.mostMissedQuestions.length === 0 && (
              <p className="text-sm text-[#06182e]/40 text-center py-8">
                No data yet
              </p>
            )}
          </div>
        </div>

        {/* Most Correct */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#06182e]/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-[#06182e]">
              Most Correct Questions
            </h2>
          </div>
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
                <div className="flex items-center gap-3 mt-2 text-xs text-[#06182e]/50">
                  <span className="text-emerald-600">
                    {q.accuracy}% accuracy
                  </span>
                  <span>
                    {q.correctCount}/{q.totalCount} correct
                  </span>
                </div>
              </div>
            ))}
            {data.mostCorrectQuestions.length === 0 && (
              <p className="text-sm text-[#06182e]/40 text-center py-8">
                No data yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
