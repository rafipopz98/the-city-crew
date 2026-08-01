import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import "@/lib/models/DailyChallenge";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

// GET /api/profile/challenges - User's daily challenge history + summary
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [userDoc, attempts] = await Promise.all([
      UserModel.findById(user.userId)
        .select(
          "username first_name last_name streak longestStreak totalPoints totalCorrect challengesPlayed bestTime dailyWins badges createdAt",
        )
        .lean(),
      ChallengeAttemptModel.find({ userId: user.userId, status: "completed" })
        .sort({ submittedAt: -1 })
        .populate("challengeId", "title challengeDate")
        .lean(),
    ]);

    if (!userDoc) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    type ChallengeAttemptDoc = {
      _id: { toString(): string };
      challengeId: {
        _id: { toString(): string };
        title: string;
        challengeDate: string;
      } | null;
      score: number;
      assignedQuestionIds: unknown[];
      completionTimeMs: number | null;
      submittedAt: Date | null;
    };

    const history = (attempts as ChallengeAttemptDoc[]).map((a) => ({
      id: a._id.toString(),
      challengeId: a.challengeId?._id?.toString() ?? null,
      title: a.challengeId?.title ?? "Daily Challenge",
      challengeDate: a.challengeId?.challengeDate ?? null,
      score: a.score ?? 0,
      totalQuestions: a.assignedQuestionIds?.length ?? 5,
      completionTimeMs: a.completionTimeMs ?? null,
      submittedAt: a.submittedAt ?? null,
    }));

    const totalScore = history.reduce((sum, h) => sum + h.score, 0);

    const averageScore =
      history.length > 0
        ? Math.round((totalScore / history.length) * 10) / 10
        : 0;
    const perfectRuns = history.filter(
      (h) => h.score === h.totalQuestions,
    ).length;

    const fastest = history
      .filter(
        (h): h is (typeof history)[number] & { completionTimeMs: number } =>
          h.completionTimeMs != null,
      )
      .sort((a, b) => a.completionTimeMs - b.completionTimeMs)[0];

    return NextResponse.json({
      summary: {
        username: userDoc.username || null,
        firstName:
          userDoc.first_name || userDoc.email?.split("@")[0] || "City Crew",
        lastName: userDoc.last_name,
        joinedDate: userDoc.createdAt,
        streak: userDoc.streak,
        longestStreak: userDoc.longestStreak,
        totalPoints: userDoc.totalPoints,
        totalCorrect: userDoc.totalCorrect,
        challengesPlayed: userDoc.challengesPlayed,
        dailyWins: userDoc.dailyWins,
        badges: userDoc.badges || [],
        bestTimeMs: fastest?.completionTimeMs ?? userDoc.bestTime ?? null,
        bestTimeFormatted: fastest
          ? formatTime(fastest.completionTimeMs)
          : userDoc.bestTime
            ? formatTime(userDoc.bestTime)
            : null,
      },
      history,
      totals: {
        played: history.length,
        averageScore,
        perfectRuns,
        totalScore,
      },
    });
  } catch (error) {
    await logError("/api/profile/challenges", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(
    millis / 100,
  )}`;
}
