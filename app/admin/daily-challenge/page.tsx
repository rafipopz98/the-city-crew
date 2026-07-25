"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
  CheckCircle2,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

type Challenge = {
  _id: string;
  title: string;
  challengeDate: string;
  status: "draft" | "active" | "completed";
  totalParticipants: number;
  questionCount: number;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

function ChallengeRow({
  challenge,
  onDelete,
  onToggleStatus,
  isToggling,
}: {
  challenge: Challenge;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  isToggling: boolean;
}) {
  const router = useRouter();

  return (
    <div className="group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 border-b border-[#06182e]/8 hover:bg-[#f4ebda] transition-colors last:border-b-0">
      {/* Title */}
      <div className="min-w-0">
        <Link
          href={`/admin/daily-challenge/${challenge._id}/edit`}
          className="text-sm font-medium text-[#06182e] hover:text-[#e09225] transition-colors truncate"
        >
          {challenge.title}
        </Link>
        <p className="text-xs text-[#06182e]/40 mt-0.5">
          {challenge.challengeDate}
        </p>
      </div>

      {/* Question Count */}
      <div className="flex items-center gap-1.5 text-xs text-[#06182e]/50 whitespace-nowrap">
        <CheckCircle2 size={14} />
        <span>{challenge.questionCount}/20</span>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-1.5 text-xs text-[#06182e]/50 whitespace-nowrap">
        <Users size={14} />
        <span>{challenge.totalParticipants}</span>
      </div>

      {/* Status Badge */}
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_COLORS[challenge.status]} whitespace-nowrap`}
      >
        {STATUS_LABELS[challenge.status]}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {challenge.status === "draft" && (
          <button
            onClick={() => onToggleStatus(challenge._id, "active")}
            disabled={challenge.questionCount < 20 || isToggling}
            title={
              challenge.questionCount < 20
                ? "Add all 20 questions first"
                : "Publish challenge"
            }
            className="p-2 rounded-lg text-[#06182e]/40 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trophy size={16} />
          </button>
        )}
        {challenge.status === "active" && (
          <button
            onClick={() => onToggleStatus(challenge._id, "completed")}
            disabled={isToggling}
            title="Mark as completed"
            className="p-2 rounded-lg text-[#06182e]/40 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <CheckCircle2 size={16} />
          </button>
        )}
        <Link
          href={`/admin/daily-challenge/${challenge._id}/edit`}
          className="p-2 rounded-lg text-[#06182e]/40 hover:text-[#06182e] hover:bg-[#06182e]/5 transition-all"
          title="Edit"
        >
          <Eye size={16} />
        </Link>
        {challenge.status !== "active" && (
          <button
            onClick={() => onDelete(challenge._id)}
            className="p-2 rounded-lg text-[#06182e]/40 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDailyChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isToggling, setIsToggling] = useState(false);

  const fetchChallenges = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (statusFilter) params.set("status", statusFilter);

      const res = await api.get(
        `/admin/daily-challenge?${params.toString()}`,
      );
      setChallenges(res.data.challenges);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchChallenges(1);
  }, [fetchChallenges]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await api.delete(`/admin/daily-challenge/${id}`);
      toast.success("Challenge deleted");
      fetchChallenges(pagination.page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      setIsToggling(true);
      await api.put(`/admin/daily-challenge/${id}`, { status: newStatus });
      toast.success(
        newStatus === "active"
          ? "Challenge published!"
          : "Challenge completed",
      );
      fetchChallenges(pagination.page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setIsToggling(false);
    }
  };

  const draftCount = challenges.filter((c) => c.status === "draft").length;
  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed").length;
  const totalParticipants = challenges.reduce(
    (sum, c) => sum + c.totalParticipants,
    0,
  );

  const statsCards = [
    { label: "Total Challenges", value: pagination.total },
    { label: "Draft", value: draftCount },
    { label: "Active", value: activeCount },
    { label: "Completed", value: completedCount },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
          Quiz Management
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#06182e]">
          Daily Challenges
        </h1>
        <p className="mt-2 text-[#06182e]/60 max-w-xl">
          Create and manage daily football quizzes, track participation, and
          monitor performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-5 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-[#06182e]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[#06182e]/55">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] p-5 shadow-sm w-full sm:w-auto sm:min-w-[480px]">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#06182e]/40"
              />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-xl border border-[#06182e]/10 bg-[#ece1cf] pl-11 pr-4 text-[#06182e] placeholder:text-[#06182e]/30 outline-none transition focus:border-[#e09225]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 rounded-xl border border-[#06182e]/10 bg-[#ece1cf] px-4 text-[#06182e] outline-none transition focus:border-[#e09225]"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <Link
          href="/admin/daily-challenge/create"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#e09225] hover:bg-[#e09225]/90 text-white px-5 py-3 font-medium transition-all hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={18} />
          New Challenge
        </Link>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#06182e]">All Challenges</h2>
          <p className="text-sm text-[#06182e]/55 mt-1">
            {loading
              ? "Loading..."
              : `${pagination.total} challenge${pagination.total !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-[#06182e]/10">
          <span className="text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">
            Challenge
          </span>
          <span className="text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">
            Questions
          </span>
          <span className="text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">
            Players
          </span>
          <span className="text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">
            Status
          </span>
          <span className="text-[11px] uppercase tracking-wider text-[#06182e]/40 font-medium">
            Actions
          </span>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#e09225]" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy size={40} className="text-[#06182e]/10 mb-4" />
            <p className="text-sm text-[#06182e]/40 font-medium">
              No challenges yet
            </p>
            <p className="text-xs text-[#06182e]/30 mt-1">
              Create your first daily challenge to get started
            </p>
            <Link
              href="/admin/daily-challenge/create"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e09225]/10 text-[#e09225] text-sm font-medium hover:bg-[#e09225]/20 transition-all"
            >
              <Plus size={14} />
              Create Challenge
            </Link>
          </div>
        ) : (
          challenges.map((challenge) => (
            <ChallengeRow
              key={challenge._id}
              challenge={challenge}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isToggling={isToggling}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#06182e]/40">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchChallenges(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-[#06182e]/10 text-[#06182e]/50 hover:text-[#06182e] hover:bg-[#f4ebda] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from(
              { length: pagination.totalPages },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => fetchChallenges(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  p === pagination.page
                    ? "bg-[#06182e] text-white"
                    : "text-[#06182e]/50 hover:text-[#06182e] hover:bg-[#f4ebda]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchChallenges(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-[#06182e]/10 text-[#06182e]/50 hover:text-[#06182e] hover:bg-[#f4ebda] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
