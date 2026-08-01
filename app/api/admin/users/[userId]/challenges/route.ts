import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { ChallengeAnswerModel } from "@/lib/models/ChallengeAnswer";
import { QuestionModel } from "@/lib/models/Question";
import "@/lib/models/DailyChallenge"; // Registers schema for challengeId populate
import { verifyToken } from "@/lib/auth/jwt";
import { logError } from "@/lib/errorLogger";

type RouteContext = { params: Promise<{ userId: string }> };

type AttemptDoc = {
  _id: { toString(): string };
  challengeId: {
    _id: { toString(): string };
    title: string;
    challengeDate: string;
  } | null;
  score: number;
  assignedQuestionIds: { toString(): string }[];
  startedAt: Date;
  submittedAt: Date | null;
  completionTimeMs: number | null;
};

type AnswerDoc = {
  attemptId: { toString(): string };
  questionId: { toString(): string };
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: Date;
};

type QuestionDoc = {
  _id: { toString(): string };
  question: string;
  options: string[];
  correctAnswer: string;
  order: number;
};

// GET /api/admin/users/[userId]/challenges?page=1&limit=3
// Admin-only: paginated challenge history where each attempt includes the
// full per-question breakdown (question, options, correct answer, the user's
// answer, correctness and time spent on each question).
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const adminUser = await UserModel.findById(payload.userId).select("role");
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await context.params;

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      10,
      Math.max(1, parseInt(url.searchParams.get("limit") || "3")),
    );

    const totalAttempts = await ChallengeAttemptModel.countDocuments({
      userId,
      status: "completed",
    });
    const totalPages = Math.max(1, Math.ceil(totalAttempts / limit));
    const skip = (page - 1) * limit;

    const attempts = await ChallengeAttemptModel.find({
      userId,
      status: "completed",
    })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("challengeId", "title challengeDate")
      .lean();

    const docs = attempts as unknown as AttemptDoc[];
    if (docs.length === 0) {
      return NextResponse.json({
        attempts: [],
        pagination: {
          page,
          limit,
          totalAttempts,
          totalPages,
          hasMore: false,
        },
      });
    }

    // All question ids across the page, then fetch questions + answers once.
    const questionIds = Array.from(
      new Set(docs.flatMap((a) => a.assignedQuestionIds.map((q) => q.toString()))),
    );
    const attemptIds = docs.map((a) => a._id.toString());

    const [questions, answers] = await Promise.all([
      QuestionModel.find({ _id: { $in: questionIds } })
        .select("question options correctAnswer order")
        .lean() as unknown as Promise<QuestionDoc[]>,
      ChallengeAnswerModel.find({ attemptId: { $in: attemptIds } })
        .select("attemptId questionId selectedAnswer isCorrect answeredAt")
        .sort({ answeredAt: 1 })
        .lean() as unknown as Promise<AnswerDoc[]>,
    ]);

    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q]),
    );
    // Keyed by attemptId:questionId so the same question assigned to two
    // different attempts on this page can't have their answers conflated.
    const answerMap = new Map<string, AnswerDoc[]>();
    for (const ans of answers) {
      const key = `${ans.attemptId.toString()}:${ans.questionId.toString()}`;
      const arr = answerMap.get(key) || [];
      arr.push(ans);
      answerMap.set(key, arr);
    }

    const attemptsOut = docs.map((a) => {
      const qDetails = a.assignedQuestionIds
        .map((id) => questionMap.get(id.toString()))
        .filter((q): q is QuestionDoc => !!q)
        .sort((x, y) => x.order - y.order);

      // Time spent per question: answer's answeredAt minus the previous
      // answer's answeredAt (first question: minus attempt.startedAt).
      let prevTime = new Date(a.startedAt).getTime();
      const questionsOut = qDetails.map((q) => {
        const ans =
          answerMap.get(`${a._id.toString()}:${q._id.toString()}`)?.[0] ||
          null;
        let timeTakenMs: number | null = null;
        if (ans) {
          const answeredAt = new Date(ans.answeredAt).getTime();
          timeTakenMs = Math.max(0, answeredAt - prevTime);
          prevTime = answeredAt;
        }
        return {
          id: q._id.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          selectedAnswer: ans?.selectedAnswer ?? null,
          isCorrect: ans?.isCorrect ?? false,
          answered: !!ans,
          timeTakenMs,
        };
      });

      return {
        id: a._id.toString(),
        challengeId: a.challengeId?._id?.toString() ?? null,
        title: a.challengeId?.title ?? "Daily Challenge",
        challengeDate: a.challengeId?.challengeDate ?? null,
        score: a.score ?? 0,
        totalQuestions: a.assignedQuestionIds?.length ?? 5,
        completionTimeMs: a.completionTimeMs ?? null,
        submittedAt: a.submittedAt ?? null,
        questions: questionsOut,
      };
    });

    return NextResponse.json({
      attempts: attemptsOut,
      pagination: {
        page,
        limit,
        totalAttempts,
        totalPages,
        hasMore: skip + limit < totalAttempts,
      },
    });
  } catch (error) {
    await logError("/api/admin/users/[userId]/challenges", "GET", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 },
    );
  }
}
