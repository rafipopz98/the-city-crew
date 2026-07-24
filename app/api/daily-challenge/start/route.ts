import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { QuestionModel } from "@/lib/models/Question";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { UserModel } from "@/lib/models/User";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the active challenge
    const activeChallenge = await DailyChallengeModel.findOne({
      status: "active",
    });

    if (!activeChallenge) {
      return NextResponse.json(
        { message: "No active challenge available" },
        { status: 400 },
      );
    }

    // Check if user already has an attempt
    const existingAttempt = await ChallengeAttemptModel.findOne({
      userId: user.userId,
      challengeId: activeChallenge._id,
    });

    if (existingAttempt) {
      // If they already started, return their existing attempt
      const questions = await QuestionModel.find({
        _id: { $in: existingAttempt.assignedQuestionIds },
      })
        .select("question options order")
        .sort({ order: 1 })
        .lean();

      return NextResponse.json({
        attempt: {
          _id: existingAttempt._id,
          status: existingAttempt.status,
          score: existingAttempt.score,
          startedAt: existingAttempt.startedAt,
          completionTimeMs: existingAttempt.completionTimeMs,
        },
        questions: questions.map((q) => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          order: q.order,
        })),
      });
    }

    // Fetch all 20 questions for this challenge
    const allQuestions = await QuestionModel.find({
      challengeId: activeChallenge._id,
    }).lean();

    if (allQuestions.length < 5) {
      return NextResponse.json(
        { message: "Not enough questions available" },
        { status: 400 },
      );
    }

    // Randomly select 5 unique questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    // Create a new attempt
    const attempt = await ChallengeAttemptModel.create({
      userId: user.userId,
      challengeId: activeChallenge._id,
      assignedQuestionIds: selected.map((q) => q._id),
      startedAt: new Date(),
      status: "in_progress",
    });

    // Increment participants count
    await DailyChallengeModel.findByIdAndUpdate(activeChallenge._id, {
      $inc: { totalParticipants: 1 },
    });

    // Return questions without correct answers
    return NextResponse.json({
      attempt: {
        _id: attempt._id,
        status: attempt.status,
        score: attempt.score,
        startedAt: attempt.startedAt,
      },
      questions: selected.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        order: q.order,
      })),
    });
  } catch (error) {
    await logError("/api/daily-challenge/start", "POST", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
