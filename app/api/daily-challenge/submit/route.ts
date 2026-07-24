import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { ChallengeAnswerModel } from "@/lib/models/ChallengeAnswer";
import { QuestionModel } from "@/lib/models/Question";
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
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json(
        { message: "Missing attemptId" },
        { status: 400 },
      );
    }

    await connectDB();

    const attempt = await ChallengeAttemptModel.findOne({
      _id: attemptId,
      userId: user.userId,
      status: "in_progress",
    });

    if (!attempt) {
      return NextResponse.json(
        { message: "Invalid or already submitted attempt" },
        { status: 400 },
      );
    }

    // Count answered questions
    const answeredCount = await ChallengeAnswerModel.countDocuments({
      attemptId: attempt._id,
    });

    if (answeredCount < 5) {
      return NextResponse.json(
        {
          message: `Answer all 5 questions before submitting. ${answeredCount}/5 answered.`,
          answeredCount,
        },
        { status: 400 },
      );
    }

    // Calculate final completion time
    const now = new Date();
    const completionTimeMs = now.getTime() - attempt.startedAt.getTime();

    // Update attempt as completed
    attempt.submittedAt = now;
    attempt.completionTimeMs = completionTimeMs;
    attempt.status = "completed";
    await attempt.save();

    // Update user stats
    const userDoc = await UserModel.findById(user.userId);

    if (userDoc) {
      userDoc.challengesPlayed += 1;
      userDoc.totalCorrect += attempt.score;
      userDoc.totalPoints += attempt.score;

      // Update best time
      if (userDoc.bestTime === null || completionTimeMs < userDoc.bestTime) {
        userDoc.bestTime = completionTimeMs;
      }

      // Update streak
      const today = new Date().toISOString().split("T")[0];
      const activeChallenge = await DailyChallengeModel.findById(
        attempt.challengeId,
      ).select("challengeDate");

      if (activeChallenge) {
        if (userDoc.lastChallengeDate) {
          const lastDate = new Date(userDoc.lastChallengeDate);
          const currentDate = new Date(activeChallenge.challengeDate);
          const diffDays = Math.round(
            (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (diffDays === 1) {
            // Consecutive day
            userDoc.streak += 1;
          } else if (diffDays > 1) {
            // Missed a day, reset streak
            userDoc.streak = 1;
          }
          // diffDays === 0 means same day, don't change streak
        } else {
          userDoc.streak = 1;
        }

        userDoc.lastChallengeDate = activeChallenge.challengeDate;

        // Update longest streak
        if (userDoc.streak > userDoc.longestStreak) {
          userDoc.longestStreak = userDoc.streak;
        }
      }

      // Perfect score tracking
      if (attempt.score === 5) {
        userDoc.dailyWins += 1;
      }

      // Award badges
      const newBadges: string[] = [];

      if (userDoc.challengesPlayed === 1) {
        newBadges.push("first_challenge");
      }
      if (attempt.score === 5) {
        newBadges.push("first_perfect");
      }
      if (userDoc.streak >= 7) {
        newBadges.push("streak_7");
      }
      if (userDoc.streak >= 30) {
        newBadges.push("streak_30");
      }
      if (userDoc.totalCorrect >= 100 && !userDoc.badges.includes("100_correct")) {
        newBadges.push("100_correct");
      }

      // Merge with existing badges, no duplicates
      const existingBadges = new Set(userDoc.badges);
      for (const badge of newBadges) {
        if (!existingBadges.has(badge)) {
          userDoc.badges.push(badge);
        }
      }

      await userDoc.save();
    }

    return NextResponse.json({
      score: attempt.score,
      completionTimeMs,
      totalQuestions: 5,
      message: "Challenge completed!",
    });
  } catch (error) {
    await logError("/api/daily-challenge/submit", "POST", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
