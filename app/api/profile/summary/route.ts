import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { GameUserModel } from "@/lib/game/models/GameUser";
import PlayerRating from "@/lib/models/PlayerRating";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

type UserDoc = {
  username: string | null;
  first_name: string | null;
  email: string | null;
  streak: number;
  totalPoints: number;
  challengesPlayed: number;
  bestTime: number | null;
  createdAt: Date | string;
};

type GameUserDoc = {
  total_matches: number;
  total_wins: number;
  xp: number;
  coins: number;
};

// GET /api/profile/summary - Lightweight overview data (hero + overview tab)
// Single call replaces the three heavy endpoints that used to fire on page load.
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [userDoc, gameUser, ratingAgg, fastestAttempt] = await Promise.all([
      UserModel.findById(user.userId)
        .select(
          "username first_name email streak totalPoints challengesPlayed bestTime createdAt",
        )
        .lean() as unknown as Promise<UserDoc | null>,
      GameUserModel.findOne({ userId: user.userId })
        .select("total_matches total_wins xp coins")
        .lean() as unknown as Promise<GameUserDoc | null>,
      PlayerRating.aggregate<{
        _id: null;
        count: number;
        avg: number | null;
      }>([
        { $match: { user_id: user.userId } },
        { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } },
      ]),
      // Fastest completed attempt — keeps the overview "best time" in sync
      // with the Challenges tab, which computes it from attempts.
      ChallengeAttemptModel.findOne({
        userId: user.userId,
        status: "completed",
        completionTimeMs: { $ne: null },
      })
        .sort({ completionTimeMs: 1 })
        .select("completionTimeMs")
        .lean() as unknown as Promise<{ completionTimeMs: number } | null>,
    ]);

    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const totalMatches = gameUser?.total_matches ?? 0;
    const totalWins = gameUser?.total_wins ?? 0;
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
    const ratingsTotal = ratingAgg[0]?.count ?? 0;
    const ratingsAverage =
      ratingAgg[0]?.avg != null
        ? Math.round(ratingAgg[0].avg * 10) / 10
        : 0;

    return NextResponse.json({
      summary: {
        username: userDoc.username || null,
        firstName:
          userDoc.first_name || userDoc.email?.split("@")[0] || "City Crew",
        joinedDate: userDoc.createdAt,
        streak: userDoc.streak ?? 0,
        totalPoints: userDoc.totalPoints ?? 0,
        challengesPlayed: userDoc.challengesPlayed ?? 0,
        bestTimeMs: fastestAttempt?.completionTimeMs ?? userDoc.bestTime ?? null,
        bestTimeFormatted: fastestAttempt?.completionTimeMs
          ? formatTime(fastestAttempt.completionTimeMs)
          : userDoc.bestTime
            ? formatTime(userDoc.bestTime)
            : null,
        totalMatches,
        totalWins,
        winRate,
        xp: gameUser?.xp ?? 0,
        coins: gameUser?.coins ?? 0,
        ratingsTotal,
        ratingsAverage,
      },
    });
  } catch (error) {
    await logError("/api/profile/summary", "GET", error);
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
