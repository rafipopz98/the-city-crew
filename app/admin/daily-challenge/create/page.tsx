"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

type Question = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
};

function createEmptyQuestion(id: number): Question {
  return {
    id,
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
  };
}

function QuestionCard({
  question,
  index,
  onChange,
  onDelete,
  errors,
}: {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
  errors: Record<string, string>;
}) {
  const options = [
    { key: "optionA", label: "A" },
    { key: "optionB", label: "B" },
    { key: "optionC", label: "C" },
    { key: "optionD", label: "D" },
  ] as const;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-[#06182e]/5 p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#06182e]/30 font-medium">
          Question {index + 1}
        </span>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-[#06182e]/20 hover:text-red-400 hover:bg-red-50 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Question */}
      <div>
        <textarea
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
          placeholder="Enter your question..."
          rows={2}
          className={`w-full bg-transparent text-sm text-[#06182e] placeholder:text-[#06182e]/25 resize-none focus:outline-none border-b ${
            errors[`q_${question.id}_question`]
              ? "border-red-300"
              : "border-[#06182e]/10 focus:border-[#e09225]/50"
          } transition-colors pb-2`}
        />
        {errors[`q_${question.id}_question`] && (
          <p className="text-[11px] text-red-400 mt-1">
            {errors[`q_${question.id}_question`]}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <div key={opt.key}>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium ${
                  question.correctAnswer === question[opt.key]
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#06182e]/5 text-[#06182e]/40"
                }`}
              >
                {opt.label}
              </span>
              <input
                type="text"
                value={question[opt.key]}
                onChange={(e) =>
                  onChange({ ...question, [opt.key]: e.target.value })
                }
                placeholder={`Option ${opt.label}`}
                className={`flex-1 bg-transparent text-sm text-[#06182e] placeholder:text-[#06182e]/25 focus:outline-none border-b ${
                  errors[`q_${question.id}_${opt.key}`]
                    ? "border-red-300"
                    : "border-[#06182e]/10 focus:border-[#e09225]/50"
                } transition-colors pb-1`}
              />
            </div>
            {errors[`q_${question.id}_${opt.key}`] && (
              <p className="text-[11px] text-red-400 mt-1 ml-8">
                {errors[`q_${question.id}_${opt.key}`]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-[#06182e]/30 font-medium block mb-2">
          Correct Answer
        </label>
        <div className="flex gap-2">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() =>
                onChange({ ...question, correctAnswer: question[opt.key] })
              }
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                question.correctAnswer === question[opt.key]
                  ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                  : "bg-[#06182e]/5 text-[#06182e]/40 hover:bg-[#06182e]/10"
              } ${!question[opt.key] ? "opacity-30 cursor-not-allowed" : ""}`}
              disabled={!question[opt.key]}
            >
              {opt.label}
              {question.correctAnswer === question[opt.key] && (
                <CheckCircle2 size={12} className="inline ml-1" />
              )}
            </button>
          ))}
        </div>
        {errors[`q_${question.id}_correct`] && (
          <p className="text-[11px] text-red-400 mt-1">
            {errors[`q_${question.id}_correct`]}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CreateChallengePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [challengeDate, setChallengeDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 20 }, (_, i) => createEmptyQuestion(i)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleQuestionChange = (updated: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q)),
    );
    // Clear error for this question when user edits
    const newErrors = { ...errors };
    const prefixes = [
      `q_${updated.id}_question`,
      `q_${updated.id}_optionA`,
      `q_${updated.id}_optionB`,
      `q_${updated.id}_optionC`,
      `q_${updated.id}_optionD`,
      `q_${updated.id}_correct`,
    ];
    prefixes.forEach((p) => delete newErrors[p]);
    setErrors(newErrors);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addQuestion = () => {
    const newId =
      questions.length > 0
        ? Math.max(...questions.map((q) => q.id)) + 1
        : 0;
    setQuestions((prev) => [...prev, createEmptyQuestion(newId)]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!challengeDate) {
      toast.error("Challenge date is required");
      return false;
    }

    if (questions.length !== 20) {
      toast.error(`Exactly 20 questions required (${questions.length} provided)`);
      return false;
    }

    questions.forEach((q, i) => {
      if (!q.question.trim())
        newErrors[`q_${q.id}_question`] = "Question is required";
      if (!q.optionA.trim())
        newErrors[`q_${q.id}_optionA`] = "Option A is required";
      if (!q.optionB.trim())
        newErrors[`q_${q.id}_optionB`] = "Option B is required";
      if (!q.optionC.trim())
        newErrors[`q_${q.id}_optionC`] = "Option C is required";
      if (!q.optionD.trim())
        newErrors[`q_${q.id}_optionD`] = "Option D is required";

      if (!q.correctAnswer) {
        newErrors[`q_${q.id}_correct`] = "Select correct answer";
      }

      // Check duplicate options
      const opts = [q.optionA.trim(), q.optionB.trim(), q.optionC.trim(), q.optionD.trim()].filter(Boolean);
      if (new Set(opts).size !== opts.length && opts.length === 4) {
        newErrors[`q_${q.id}_question`] = "Duplicate options detected";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        challengeDate,
        questions: questions.map((q, index) => ({
          question: q.question.trim(),
          options: [q.optionA.trim(), q.optionB.trim(), q.optionC.trim(), q.optionD.trim()],
          correctAnswer: q.correctAnswer.trim(),
          order: index + 1,
        })),
      };

      await api.post("/admin/daily-challenge", payload);
      toast.success("Challenge created successfully!");
      router.push("/admin/daily-challenge");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create challenge",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-[#06182e]/40 hover:text-[#06182e] hover:bg-white/50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#06182e]">
              Create Challenge
            </h1>
            <p className="text-sm text-[#06182e]/50 mt-1">
              Build a daily challenge with exactly 20 questions
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06182e] text-[#ece1cf] text-sm font-medium hover:bg-[#06182e]/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Challenge"}
        </button>
      </div>

      {/* Challenge Info */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#06182e]/5 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#06182e]/30 font-medium block mb-2">
              Challenge Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tuesday Football Quiz"
              className="w-full bg-transparent text-sm text-[#06182e] placeholder:text-[#06182e]/25 focus:outline-none border-b border-[#06182e]/10 focus:border-[#e09225]/50 transition-colors pb-2"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#06182e]/30 font-medium block mb-2">
              Challenge Date
            </label>
            <input
              type="date"
              value={challengeDate}
              onChange={(e) => setChallengeDate(e.target.value)}
              className="w-full bg-transparent text-sm text-[#06182e] focus:outline-none border-b border-[#06182e]/10 focus:border-[#e09225]/50 transition-colors pb-2"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-1.5 rounded-full bg-[#06182e]/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#e09225] transition-all duration-500"
              style={{
                width: `${Math.min(100, (questions.length / 20) * 100)}%`,
              }}
            />
          </div>
          <span
            className={`text-xs font-medium whitespace-nowrap ${
              questions.length === 20
                ? "text-emerald-600"
                : "text-[#06182e]/40"
            }`}
          >
            {questions.length}/20 questions
          </span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#06182e]">Questions</h2>
          {questions.length < 20 && (
            <button
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e09225]/10 text-[#e09225] text-xs font-medium hover:bg-[#e09225]/20 transition-all"
            >
              <Plus size={14} />
              Add Question
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/30 rounded-2xl border border-dashed border-[#06182e]/10">
            <Trophy size={40} className="text-[#06182e]/10 mb-4" />
            <p className="text-sm text-[#06182e]/40 font-medium">
              No questions yet
            </p>
            <button
              onClick={addQuestion}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e09225]/10 text-[#e09225] text-sm font-medium hover:bg-[#e09225]/20 transition-all"
            >
              <Plus size={14} />
              Add First Question
            </button>
          </div>
        ) : (
          questions.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={index}
              onChange={handleQuestionChange}
              onDelete={() => handleDeleteQuestion(q.id)}
              errors={errors}
            />
          ))
        )}

        {/* Bottom Actions */}
        {questions.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-[#06182e]/30">
              {questions.length} question
              {questions.length !== 1 ? "s" : ""} added
              {questions.length < 20
                ? ` (${20 - questions.length} more needed)`
                : ""}
            </p>
            <button
              onClick={handleSave}
              disabled={saving || questions.length !== 20}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06182e] text-[#ece1cf] text-sm font-medium hover:bg-[#06182e]/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save Challenge"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
