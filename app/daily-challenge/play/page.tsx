"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  AlertCircle,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  RefreshCw,
  Timer,
  Target,
} from "lucide-react";
import api from "@/lib/api/axios";

type QuestionData = {
  _id: string;
  question: string;
  options: string[];
  order: number;
};

type AttemptData = {
  attempt: {
    _id: string;
    status: string;
    score: number;
    startedAt: string;
    completionTimeMs: number | null;
    submittedAt: string | null;
  };
  challenge: {
    _id: string;
    title: string;
    challengeDate: string;
  };
  questions: (QuestionData & {
    answer: { selectedAnswer: string; isCorrect: boolean } | null;
  })[];
};

type SubmitResult = {
  isCorrect: boolean;
  correctAnswer: string;
  currentScore: number;
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${Math.floor(millis / 100)}`;
}

/* ── Skeletons ─────────────────────────────────────────── */

function TopBarSkeleton() {
  return (
    <div className="sticky top-0 z-10 bg-[#FFF5E5]/95 border-b border-[#06182e]/5 animate-pulse">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="h-5 w-24 rounded bg-[#06182e]/8" />
        <div className="h-5 w-12 rounded bg-[#06182e]/8" />
      </div>
      <div className="h-0.5 bg-[#06182e]/5" />
    </div>
  );
}

function QuestionCardSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl animate-pulse">
        <div className="text-center mb-6">
          <div className="h-3 w-32 rounded bg-[#06182e]/8 mx-auto mb-4" />
          <div className="h-10 w-36 rounded bg-[#06182e]/8 mx-auto" />
        </div>
        <div className="bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-5 sm:p-7 mb-5 space-y-2.5">
          <div className="h-5 w-full rounded bg-[#06182e]/8" />
          <div className="h-5 w-3/4 rounded bg-[#06182e]/8" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#e09225]/6 border border-[#06182e]/6"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SubmitResult>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [feedbackData, setFeedbackData] = useState<SubmitResult | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Animation
  const [questionVisible, setQuestionVisible] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/daily-challenge/play");
      return;
    }
    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchAttempt = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/daily-challenge/attempt");
      const attemptData = res.data;

      if (!attemptData.attempt) {
        router.push("/daily-challenge");
        return;
      }

      setData(attemptData);

      const answerMap: Record<string, SubmitResult> = {};
      let firstUnanswered = attemptData.questions.length;

      for (let i = 0; i < attemptData.questions.length; i++) {
        const q = attemptData.questions[i];
        if (q.answer) {
          answerMap[q._id] = {
            isCorrect: q.answer.isCorrect,
            correctAnswer: "",
            currentScore: 0,
          };
        } else if (firstUnanswered === attemptData.questions.length) {
          firstUnanswered = i;
        }
      }

      setCurrentQuestionIndex(
        Math.min(firstUnanswered, attemptData.questions.length - 1),
      );
      setAnswers(answerMap);

      if (
        attemptData.attempt.status === "completed" ||
        Object.keys(answerMap).length === attemptData.questions.length
      ) {
        setIsFinished(true);
        if (attemptData.attempt.completionTimeMs) {
          setCompletionTime(attemptData.attempt.completionTimeMs);
        }
      }

      const startedAt = new Date(attemptData.attempt.startedAt).getTime();
      startTimeRef.current = startedAt;
    } catch (err) {
      setError("Failed to load your attempt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data || isFinished || loading) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - startTimeRef.current;
      setElapsed(diff);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, isFinished, loading]);

  const handleSelectOption = async (option: string) => {
    if (hasAnswered || isSubmitting || isFinished) return;

    setSelectedOption(option);
    setIsSubmitting(true);

    const currentQuestion = data?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const res = await api.post("/daily-challenge/answer", {
        attemptId: data?.attempt._id,
        questionId: currentQuestion._id,
        selectedAnswer: option,
      });

      const result = res.data;
      setFeedbackData(result);
      setHasAnswered(true);

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: result,
      }));
    } catch (err: any) {
      console.error("Failed to submit answer", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (data?.questions.length || 0) - 1) {
      setQuestionVisible(false);

      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
        setHasAnswered(false);
        setFeedbackData(null);
        setQuestionVisible(true);
      }, 200);
    } else {
      submitChallenge();
    }
  };

  const submitChallenge = async () => {
    if (!data) return;
    setIsSubmittingFinal(true);

    try {
      const res = await api.post("/daily-challenge/submit", {
        attemptId: data.attempt._id,
      });

      const finalTime = res.data.completionTimeMs;
      setCompletionTime(finalTime);
      setIsFinished(true);

      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err: any) {
      console.error("Failed to submit challenge", err);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  // ── Auth check ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full bg-[#e09225]/15 animate-ping" />
            <div className="relative w-12 h-12 rounded-full bg-[#e09225] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#06182e]" />
            </div>
          </div>
          <p className="text-sm text-[#06182e]/50 para">Checking you in…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── Loading (skeleton) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex flex-col">
        <TopBarSkeleton />
        <QuestionCardSkeleton />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs bg-[#e09225]/8 border border-[#e09225]/12 rounded-xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
            <AlertCircle size={24} className="text-[#e09225]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#06182e]">
              Something went wrong
            </p>
            <p className="text-sm text-[#06182e]/45 mt-1 para">{error}</p>
          </div>
          <button
            onClick={fetchAttempt}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── No Data ──
  if (!data) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs bg-[#e09225]/8 border border-[#06182e]/5 rounded-xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center">
            <AlertCircle size={24} className="text-[#e09225]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#06182e]">
              No active attempt
            </p>
            <p className="text-sm text-[#06182e]/45 mt-1 para">
              You haven&apos;t started a challenge yet.
            </p>
          </div>
          <button
            onClick={() => router.push("/daily-challenge")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 transition-all"
          >
            <Home size={14} />
            Go to challenge
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = data.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = data.questions.length;

  // ── Finished ──
  if (isFinished) {
    const finalScore =
      data.attempt.score ||
      Object.values(answers).filter((a) => a.isCorrect).length;
    const totalTime = completionTime || elapsed;
    const correctCount = Object.values(answers).filter(
      (a) => a.isCorrect,
    ).length;
    const wrongCount = Object.values(answers).filter(
      (a) => !a.isCorrect,
    ).length;

    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-18 h-18 rounded-full bg-[#e09225]/15 flex items-center justify-center mx-auto mb-4">
              <Trophy size={34} className="text-[#e09225]" />
            </div>

            <h1 className="text-2xl font-bold text-[#06182e] mb-1">
              Challenge complete!
            </h1>
            <p className="text-xs text-[#06182e]/40 para mb-6">
              {data.challenge.title}
            </p>

            {/* Score Display */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#06182e]">
                  {finalScore}
                  <span className="text-xl text-[#06182e]/25">/5</span>
                </p>
                <p className="text-[11px] text-[#06182e]/35 para mt-1">Score</p>
              </div>
              <div className="w-px h-14 bg-[#06182e]/8" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#06182e] tabular-nums">
                  {formatTime(totalTime)}
                </p>
                <p className="text-[11px] text-[#06182e]/35 para mt-1">Time</p>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              {finalScore === 5 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e09225]/15 text-[#e09225] text-xs font-bold">
                  <Zap size={14} />
                  Perfect score
                </div>
              )}
              {finalScore === 4 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06182e]/6 text-[#06182e]/60 text-xs font-bold">
                  <Target size={14} />
                  Great effort
                </div>
              )}
              {finalScore === 3 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e09225]/10 text-[#06182e]/50 text-xs font-bold">
                  <ArrowRight size={14} />
                  Room for improvement
                </div>
              )}
              {finalScore < 3 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06182e]/6 text-[#06182e]/40 text-xs font-bold">
                  <RefreshCw size={14} />
                  Try again tomorrow
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#FFF5E5] rounded-xl p-3">
                <p className="text-lg font-bold text-[#06182e]">
                  {answeredCount}
                </p>
                <p className="text-[10px] text-[#06182e]/35 para">Answered</p>
              </div>
              <div className="bg-[#FFF5E5] rounded-xl p-3">
                <p className="text-lg font-bold text-[#059669]">
                  {correctCount}
                </p>
                <p className="text-[10px] text-[#06182e]/35 para">Correct</p>
              </div>
              <div className="bg-[#FFF5E5] rounded-xl p-3">
                <p className="text-lg font-bold text-[#dc2626]">{wrongCount}</p>
                <p className="text-[10px] text-[#06182e]/35 para">Wrong</p>
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-2 mb-6 text-left">
              {data.questions.map((q, i) => {
                const answer = answers[q._id];
                return (
                  <div
                    key={q._id}
                    className="p-3 rounded-xl flex items-center gap-3 bg-[#FFF5E5] border border-[#06182e]/5"
                  >
                    {answer?.isCorrect ? (
                      <CheckCircle2
                        size={14}
                        className="text-[#059669] shrink-0"
                      />
                    ) : (
                      <XCircle size={14} className="text-[#dc2626] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#06182e] truncate">
                        Q{i + 1}. {q.question}
                      </p>
                      {!answer?.isCorrect && answer?.correctAnswer && (
                        <p className="text-[10px] text-[#06182e]/40 para mt-0.5">
                          Correct: {answer.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/daily-challenge")}
                className="flex-1 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-xs font-bold hover:brightness-110 transition-all"
              >
                Back to lobby
              </button>
              <button
                onClick={() => router.push("/daily-challenge/leaderboard")}
                className="flex-1 py-2.5 rounded-xl bg-[#FFF5E5] text-[#06182e] text-xs font-bold border border-[#06182e]/8 hover:bg-white transition-all"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active Quiz ──
  return (
    <div className="min-h-screen bg-[#FFF5E5] flex flex-col">
      {/* ── Top Bar (minimal) ── */}
      <div className="sticky top-0 z-10 bg-[#FFF5E5]/95 border-b border-[#06182e]/5">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Timer */}
          <div className="flex items-center gap-1.5">
            <Timer size={14} className="text-[#e09225]" />
            <span className="text-sm sm:text-base font-bold text-[#06182e] tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[#e09225]" />
            <span className="text-sm sm:text-base font-bold text-[#06182e]">
              {Object.values(answers).filter((a) => a.isCorrect).length}
            </span>
            <span className="text-xs text-[#06182e]/30">/ {totalQuestions}</span>
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="h-0.5 bg-[#06182e]/5">
          <div
            className="h-full bg-[#e09225] transition-all duration-500"
            style={{
              width: `${((currentQuestionIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* ── Question Area ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl">
          {/* Hero: Question number + Large timer centered */}
          <div className="text-center mb-6">
            <div className="text-[11px] font-bold text-[#06182e]/30 uppercase tracking-[0.15em] mb-3">
              Question {String(currentQuestionIndex + 1).padStart(2, "0")} of{" "}
              {String(totalQuestions).padStart(2, "0")}
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-[#06182e] tabular-nums tracking-tight">
              {formatTime(elapsed)}
            </div>
            <div className="text-[9px] font-bold text-[#06182e]/20 uppercase tracking-[0.2em] mt-1">
              Elapsed
            </div>
          </div>

          {/* Question Card */}
          <div
            className={`transition-all duration-300 ${
              questionVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="bg-[#e09225]/10 rounded-2xl border border-[#06182e]/6 p-5 sm:p-7 mb-5 shadow-[0_4px_18px_rgba(6,24,46,0.04)]">
              <h2 className="text-lg sm:text-xl font-bold text-[#06182e] leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Progress dots — mobile only */}
            <div className="flex items-center justify-center gap-1.5 mb-5 md:hidden">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < currentQuestionIndex
                      ? answers[data.questions[i]._id]?.isCorrect
                        ? "bg-[#059669]"
                        : "bg-[#dc2626]/60"
                      : i === currentQuestionIndex
                        ? "bg-[#e09225] scale-125"
                        : "bg-[#06182e]/8"
                  }`}
                />
              ))}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, optIndex) => {
                const isSelected = selectedOption === option;
                const isCorrectOption =
                  hasAnswered && option === feedbackData?.correctAnswer;
                const isWrongSelected =
                  hasAnswered && isSelected && !feedbackData?.isCorrect;

                let bgClass =
                  "bg-[#e09225]/8 border-[#06182e]/6 hover:border-[#e09225]/30 hover:bg-[#e09225]/12";
                let ringClass = "";

                if (hasAnswered) {
                  if (isCorrectOption) {
                    bgClass = "bg-[#FFF5E5] border-[#059669]/40";
                    ringClass = "ring-1 ring-[#059669]/30";
                  } else if (isWrongSelected) {
                    bgClass = "bg-[#FFF5E5] border-[#dc2626]/30";
                    ringClass = "ring-1 ring-[#dc2626]/20";
                  } else {
                    bgClass = "bg-[#e09225]/5 border-[#06182e]/5 opacity-40";
                  }
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelectOption(option)}
                    disabled={hasAnswered || isSubmitting}
                    className={`w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 ${bgClass} ${ringClass} ${
                      !hasAnswered && !isSubmitting
                        ? "hover:-translate-y-0.5 cursor-pointer"
                        : "cursor-default"
                    } disabled:opacity-60`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isCorrectOption
                          ? "bg-[#059669]/12 text-[#059669]"
                          : isWrongSelected
                            ? "bg-[#dc2626]/12 text-[#dc2626]"
                            : "bg-[#06182e]/6 text-[#06182e]/45"
                      }`}
                    >
                      {isCorrectOption ? (
                        <CheckCircle2 size={14} />
                      ) : isWrongSelected ? (
                        <XCircle size={14} />
                      ) : (
                        getOptionLabel(optIndex)
                      )}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-semibold transition-colors ${
                        isCorrectOption
                          ? "text-[#059669]"
                          : isWrongSelected
                            ? "text-[#dc2626]"
                            : "text-[#06182e]"
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner */}
            {hasAnswered && feedbackData && (
              <div
                className={`mt-4 p-4 rounded-xl border animate-slide-up ${
                  feedbackData.isCorrect
                    ? "bg-[#FFF5E5] border-[#059669]/20"
                    : "bg-[#FFF5E5] border-[#dc2626]/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {feedbackData.isCorrect ? (
                    <CheckCircle2
                      size={20}
                      className="text-[#059669] shrink-0"
                    />
                  ) : (
                    <XCircle size={20} className="text-[#dc2626] shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-[#06182e]">
                      {feedbackData.isCorrect ? "Correct!" : "Wrong"}
                    </p>
                    {!feedbackData.isCorrect && (
                      <p className="text-xs text-[#06182e]/50 para mt-0.5">
                        Correct answer:{" "}
                        <span className="font-bold text-[#059669]">
                          {feedbackData.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmittingFinal}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingFinal ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      Next question
                      <ArrowRight size={14} />
                    </>
                  ) : (
                    <>
                      <Trophy size={14} />
                      Finish challenge
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Submitting indicator */}
          {isSubmitting && !hasAnswered && (
            <div className="flex items-center justify-center mt-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#e09225]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
