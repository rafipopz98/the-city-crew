"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  Eye,
  Trash2,
  AlertTriangle,
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
    <div className="group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 border-b border-[#06182e]/5 hover:bg-[#06182e]/[0.02] transition-colors last:border-b-0">
      {/* Title */}
      <div className="min-w-0">
        <Link
          href={`/admin/daily-challenge/${challenge._id}/edit`}
          className="text-sm font-medium text-[#06182e] hover:text-[#e09225] transition-colors truncate block"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#06182e]">
            Daily Challenges
          </h1>
          <p className="text-sm text-[#06182e]/50 mt-1">
            Create and manage daily football quizzes
          </p>
        </div>
        <Link
          href="/admin/daily-challenge/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06182e] text-[#ece1cf] text-sm font-medium hover:bg-[#06182e]/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={16} />
          New Challenge
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#06182e]/30"
          />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#06182e]/10 bg-white/50 text-sm text-[#06182e] placeholder:text-[#06182e]/30 focus:outline-none focus:ring-2 focus:ring-[#e09225]/20 focus:border-[#e09225]/30 transition-all"
          />
        </div>

        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#06182e]/30 pointer-events-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-[#06182e]/10 bg-white/50 text-sm text-[#06182e] focus:outline-none focus:ring-2 focus:ring-[#e09225]/20 focus:border-[#e09225]/30 transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#06182e]/5 overflow-hidden shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-[#06182e]/10 bg-[#06182e]/[0.02]">
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
              className="p-2 rounded-lg border border-[#06182e]/10 text-[#06182e]/50 hover:text-[#06182e] hover:bg-white/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                    : "text-[#06182e]/50 hover:text-[#06182e] hover:bg-white/50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchChallenges(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-[#06182e]/10 text-[#06182e]/50 hover:text-[#06182e] hover:bg-white/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
