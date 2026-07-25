"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trophy,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";
import Link from "next/link";

type Question = {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  order: number;
};

type Challenge = {
  _id: string;
  title: string;
  challengeDate: string;
  status: "draft" | "active" | "completed";
  totalParticipants: number;
};

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await api.get(`/admin/daily-challenge/${params.id}`);
        setChallenge(res.data.challenge);
        setQuestions(res.data.questions);
      } catch (err) {
        toast.error("Failed to load challenge");
        router.push("/admin/daily-challenge");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [params.id, router]);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await api.put(`/admin/daily-challenge/${params.id}`, {
        status: "active",
      });
      toast.success("Challenge published!");
      setChallenge((prev) => (prev ? { ...prev, status: "active" } : null));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleComplete = async () => {
    try {
      setPublishing(true);
      await api.put(`/admin/daily-challenge/${params.id}`, {
        status: "completed",
      });
      toast.success("Challenge completed");
      setChallenge((prev) =>
        prev ? { ...prev, status: "completed" } : null,
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to complete");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#e09225]" />
      </div>
    );
  }

  if (!challenge) return null;

  const isDraft = challenge.status === "draft";
  const isActive = challenge.status === "active";
  const canPublish = isDraft && questions.length === 20;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-[#06182e]/40 hover:text-[#06182e] hover:bg-white/50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
            Challenge Detail
          </span>
        </div>

        <div className="mt-2 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-[#06182e]">
                {challenge.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                  isDraft
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : isActive
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {isDraft ? "Draft" : isActive ? "Active" : "Completed"}
              </span>
            </div>
            <p className="mt-2 text-[#06182e]/60">
              {challenge.challengeDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isActive && (
              <button
                onClick={handleComplete}
                disabled={publishing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 hover:-translate-y-0.5 transition-all"
              >
                {publishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Complete
              </button>
            )}
            {isDraft && canPublish && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
              >
                {publishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trophy size={14} />
                )}
                Publish Challenge
              </button>
            )}
            <Link
              href={`/admin/daily-challenge/${params.id}/stats`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06182e]/5 text-[#06182e]/70 text-sm font-medium hover:bg-[#06182e]/10 hover:-translate-y-0.5 transition-all"
            >
              <BarChart3 size={14} />
              Stats
            </Link>
          </div>
        </div>
      </div>

      {/* Questions Overview */}
      <div className="bg-[#ece1cf] rounded-2xl border border-[#06182e]/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#06182e]">
              Questions ({questions.length}/20)
            </h2>
            <button
              onClick={() => setRevealAnswers(!revealAnswers)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#06182e]/50 hover:text-[#06182e] hover:bg-[#06182e]/5 transition-all"
            >
              {revealAnswers ? (
                <>
                  <EyeOff size={14} /> Hide Answers
                </>
              ) : (
                <>
                  <Eye size={14} /> Reveal Answers
                </>
              )}
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle size={32} className="text-[#06182e]/10 mb-3" />
            <p className="text-sm text-[#06182e]/40">No questions in this challenge</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={q._id}
                className="p-4 rounded-xl bg-[#06182e]/[0.02] border border-[#06182e]/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#06182e]">
                      <span className="text-[#06182e]/30 mr-2">
                        {index + 1}.
                      </span>
                      {q.question}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {q.options.map((opt, oi) => {
                        const letter = String.fromCharCode(65 + oi);
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <span
                            key={oi}
                            className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                              revealAnswers && isCorrect
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-[#06182e]/5 text-[#06182e]/50 border-transparent"
                            }`}
                          >
                            {letter}. {opt}
                            {revealAnswers && isCorrect && (
                              <CheckCircle2
                                size={12}
                                className="inline ml-1 text-emerald-500"
                              />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
