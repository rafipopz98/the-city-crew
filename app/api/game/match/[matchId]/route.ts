import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameMatchModel } from "@/lib/game/models/GameMatch";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { matchId } = await params;
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const match = await GameMatchModel.findById(matchId);

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    // Ensure user owns this match
    if (match.userId.toString() !== payload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      match: {
        id: match._id.toString(),
        userScore: match.user_score,
        opponentScore: match.opponent_score,
        userPossession: match.user_possession,
        opponentPossession: match.opponent_possession,
        userShots: match.user_shots,
        opponentShots: match.opponent_shots,
        userShotsOnTarget: match.user_shots_on_target,
        opponentShotsOnTarget: match.opponent_shots_on_target,
        events: match.events,
        playerOfTheMatch: match.player_of_match,
        matchResult: match.result,
        rewards: {
          xp: match.xp_earned,
          coins: match.coins_earned,
        },
        duration_seconds: match.duration_seconds,
        createdAt: match.createdAt,
      },
    });
  } catch (error) {
    await logError("/api/game/match/[matchId]", "GET", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
