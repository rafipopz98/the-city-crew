import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import PlayerRating from "@/lib/models/PlayerRating";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { verifyToken } from "@/lib/auth/jwt";
import { logError } from "@/lib/errorLogger";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Strict admin check
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

    const [userDoc, ratingCount, challengeCount, gameUser] = await Promise.all([
      UserModel.findById(userId).select("-password").lean(),
      PlayerRating.countDocuments({ user_id: userId }),
      ChallengeAttemptModel.countDocuments({
        userId,
        status: "completed",
      }),
      GameUserModel.findOne({ userId })
        .select("xp coins total_matches total_wins")
        .lean(),
    ]);

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalMatches = gameUser?.total_matches ?? 0;
    const totalWins = gameUser?.total_wins ?? 0;
    const winRate =
      totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    return NextResponse.json({
      user: {
        id: userDoc._id.toString(),
        first_name: userDoc.first_name || null,
        last_name: userDoc.last_name || null,
        username: userDoc.username || null,
        email: userDoc.email,
        role: userDoc.role,
        createdAt: userDoc.createdAt,
        signedUpFromLogin: !!userDoc.signedUpFromLogin,
        profile_completed: !!userDoc.profile_completed,
      },
      stats: {
        ratingsGiven: ratingCount,
        challengesPlayed: challengeCount,
        streak: userDoc.streak ?? 0,
        totalPoints: userDoc.totalPoints ?? 0,
        xp: gameUser?.xp ?? 0,
        coins: gameUser?.coins ?? 0,
        totalMatches,
        totalWins,
        winRate,
      },
    });
  } catch (error) {
    await logError("/api/admin/users/[userId]", "GET", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
