import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { QuestionModel } from "@/lib/models/Question";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { ChallengeAnswerModel } from "@/lib/models/ChallengeAnswer";
import { UserModel } from "@/lib/models/User";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { attemptId, questionId, selectedAnswer } = body;

    if (!attemptId || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectDB();

    // Verify the attempt belongs to this user and is in progress
    const attempt = await ChallengeAttemptModel.findOne({
      _id: attemptId,
      userId: user.userId,
      status: "in_progress",
    });

    if (!attempt) {
      return NextResponse.json(
        { message: "Invalid or completed attempt" },
        { status: 400 },
      );
    }

    // Verify this question was assigned to the user
    if (!attempt.assignedQuestionIds.some((id: any) => id.toString() === questionId)) {
      return NextResponse.json(
        { message: "Question not assigned to this attempt" },
        { status: 400 },
      );
    }

    // Check if already answered this question
    const existingAnswer = await ChallengeAnswerModel.findOne({
      attemptId: attempt._id,
      questionId,
    });

    if (existingAnswer) {
      return NextResponse.json({
        isCorrect: existingAnswer.isCorrect,
        correctAnswer: existingAnswer.isCorrect
          ? existingAnswer.selectedAnswer
          : (await QuestionModel.findById(questionId).select("correctAnswer").lean())?.correctAnswer,
        message: "Already answered",
      });
    }

    // Fetch the correct answer from the server (never trust the client)
    const question = await QuestionModel.findById(questionId).select(
      "correctAnswer question",
    );

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 },
      );
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Store the answer
    await ChallengeAnswerModel.create({
      attemptId: attempt._id,
      questionId,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date(),
    });

    // Update the score if correct
    if (isCorrect) {
      attempt.score += 1;
      await attempt.save();
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      currentScore: attempt.score,
    });
  } catch (error) {
    await logError("/api/daily-challenge/answer", "POST", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
