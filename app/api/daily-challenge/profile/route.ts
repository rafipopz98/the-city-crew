import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userDoc = await UserModel.findById(user.userId)
      .select(
        "username first_name last_name email streak longestStreak totalPoints totalCorrect challengesPlayed bestTime dailyWins badges lastChallengeDate createdAt",
      )
      .lean();

    if (!userDoc) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    // Calculate average accuracy
    const averageAccuracy =
      userDoc.challengesPlayed > 0
        ? Math.round((userDoc.totalCorrect / (userDoc.challengesPlayed * 5)) * 100)
        : 0;

    // Format best time
    const bestTimeFormatted = userDoc.bestTime
      ? formatTime(userDoc.bestTime)
      : null;

    return NextResponse.json({
      profile: {
        username: userDoc.username || null,
        firstName:
          userDoc.first_name || userDoc.email?.split("@")[0] || "City Crew",
        lastName: userDoc.last_name,
        email: userDoc.email,
        joinedDate: userDoc.createdAt,
        streak: userDoc.streak,
        longestStreak: userDoc.longestStreak,
        totalPoints: userDoc.totalPoints,
        totalCorrect: userDoc.totalCorrect,
        challengesPlayed: userDoc.challengesPlayed,
        averageAccuracy,
        bestTimeMs: userDoc.bestTime,
        bestTimeFormatted,
        dailyWins: userDoc.dailyWins,
        badges: userDoc.badges || [],
      },
      hasUsername: !!userDoc.username,
    });
  } catch (error) {
    await logError("/api/daily-challenge/profile", "GET", error);
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
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(millis / 100)}`;
}
