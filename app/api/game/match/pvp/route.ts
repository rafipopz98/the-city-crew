import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameMatchModel } from "@/lib/game/models/GameMatch";
import { logError } from "@/lib/errorLogger";
import { MATCH_FEE } from "@/lib/game/engine/matchEngine";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// POST /api/game/match/pvp - Save PvP match result and awards rewards
export async function POST(request: Request) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const {
      matchId: socketMatchId,
      opponentName,
      userScore,
      opponentScore,
      userPossession,
      opponentPossession,
      userShots,
      opponentShots,
      userShotsOnTarget,
      opponentShotsOnTarget,
      xpEarned,
      coinsEarned,
      result,
      events,
      playerOfTheMatch,
    } = await request.json();

    const gameUser = await GameUserModel.findOne({ userId: payload.userId });
    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    // Save match to DB
    const match = await GameMatchModel.create({
      userId: payload.userId,
      user_squad: [],
      opponent_name: opponentName || "PvP Opponent",
      opponent_squad: [],
      user_score: userScore || 0,
      opponent_score: opponentScore || 0,
      user_possession: userPossession || 50,
      opponent_possession: opponentPossession || 50,
      user_shots: userShots || 0,
      opponent_shots: opponentShots || 0,
      user_shots_on_target: userShotsOnTarget || 0,
      opponent_shots_on_target: opponentShotsOnTarget || 0,
      events: events || [],
      player_of_match: {
        playerId: "",
        shortName: playerOfTheMatch || "Unknown",
      },
      result: result || "draw",
      xp_earned: xpEarned || 0,
      coins_earned: coinsEarned || 0,
      duration_seconds: 25,
    });

    // Update user stats
    gameUser.total_matches += 1;
    gameUser.goals_scored += userScore || 0;
    gameUser.goals_conceded += opponentScore || 0;

    if (result === "win") {
      gameUser.total_wins += 1;
      gameUser.current_streak += 1;
      if (gameUser.current_streak > gameUser.longest_streak) {
        gameUser.longest_streak = gameUser.current_streak;
      }
    } else if (result === "loss") {
      gameUser.total_losses += 1;
      gameUser.current_streak = 0;
    } else {
      gameUser.total_draws += 1;
    }

    // Deduct match fee
    if (gameUser.coins < MATCH_FEE) {
      return NextResponse.json(
        { message: `You need at least ${MATCH_FEE} coins to play. Earn coins by winning matches!` },
        { status: 400 },
      );
    }
    gameUser.coins -= MATCH_FEE;

    gameUser.xp += xpEarned || 0;
    gameUser.coins += coinsEarned || 0;
    await gameUser.save();

    return NextResponse.json({
      message: "Match saved!",
      matchId: match._id.toString(),
      gameUser: {
        xp: gameUser.xp,
        coins: gameUser.coins,
        total_matches: gameUser.total_matches,
        total_wins: gameUser.total_wins,
      },
    });
  } catch (error) {
    await logError("/api/game/match/pvp", "POST", error);
    console.error("PvP match save error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
