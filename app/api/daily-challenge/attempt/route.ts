import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { QuestionModel } from "@/lib/models/Question";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { ChallengeAnswerModel } from "@/lib/models/ChallengeAnswer";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const activeChallenge = await DailyChallengeModel.findOne({
      status: "active",
    }).select("_id title challengeDate");

    if (!activeChallenge) {
      return NextResponse.json({ attempt: null, message: "No active challenge" });
    }

    const attempt = await ChallengeAttemptModel.findOne({
      userId: user.userId,
      challengeId: activeChallenge._id,
    });

    if (!attempt) {
      return NextResponse.json({ attempt: null });
    }

    const questions = await QuestionModel.find({
      _id: { $in: attempt.assignedQuestionIds },
    })
      .select("question options order")
      .sort({ order: 1 })
      .lean();

    const answers = await ChallengeAnswerModel.find({
      attemptId: attempt._id,
    })
      .select("questionId selectedAnswer isCorrect")
      .lean();

    // Build a map of questionId -> answer
    const answerMap = new Map();
    for (const ans of answers) {
      answerMap.set(ans.questionId.toString(), {
        selectedAnswer: ans.selectedAnswer,
        isCorrect: ans.isCorrect,
      });
    }

    return NextResponse.json({
      attempt: {
        _id: attempt._id,
        status: attempt.status,
        score: attempt.score,
        startedAt: attempt.startedAt,
        completionTimeMs: attempt.completionTimeMs,
        submittedAt: attempt.submittedAt,
      },
      challenge: {
        _id: activeChallenge._id,
        title: activeChallenge.title,
        challengeDate: activeChallenge.challengeDate,
      },
      questions: questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        order: q.order,
        answer: answerMap.get(q._id.toString()) || null,
      })),
    });
  } catch (error) {
    await logError("/api/daily-challenge/attempt", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
