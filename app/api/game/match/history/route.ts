import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameMatchModel } from "@/lib/game/models/GameMatch";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";

// GET /api/game/match/history?page=1&limit=20
export async function GET(request: Request) {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [matches, total] = await Promise.all([
      GameMatchModel.find({ userId: auth.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select({
          user_score: 1,
          opponent_score: 1,
          opponent_name: 1,
          result: 1,
          xp_earned: 1,
          coins_earned: 1,
          user_possession: 1,
          opponent_possession: 1,
          user_shots: 1,
          opponent_shots: 1,
          createdAt: 1,
          duration_seconds: 1,
        })
        .lean(),
      GameMatchModel.countDocuments({ userId: auth.userId }),
    ]);

    return NextResponse.json({
      matches: matches.map((m: any) => ({
        id: m._id.toString(),
        userScore: m.user_score,
        opponentScore: m.opponent_score,
        opponentName: m.opponent_name,
        result: m.result,
        xpEarned: m.xp_earned,
        coinsEarned: m.coins_earned,
        userPossession: m.user_possession,
        opponentPossession: m.opponent_possession,
        userShots: m.user_shots,
        opponentShots: m.opponent_shots,
        createdAt: m.createdAt,
        duration: m.duration_seconds,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    await logError("/api/game/match/history", "GET", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
