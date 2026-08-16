import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameMatchModel } from "@/lib/game/models/GameMatch";
import { logError } from "@/lib/errorLogger";
import { MATCH_FEE } from "@/lib/game/engine/matchEngine";
import { claimPvPResult } from "@/lib/game/socket/pvpResults";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// POST /api/game/match/pvp - Claim a PvP match's rewards.
//
// Previously this trusted whatever result/score/xp/coins a client POSTed
// directly, with no link back to what the match actually produced — a
// client could forge an arbitrary win, or replay one real match repeatedly
// to farm rewards. It now looks up the true outcome the server itself
// computed and stored when the match ended (see lib/game/socket/handler.ts
// + pvpResults.ts), keyed by matchId, and claims this user's own side of
// it exactly once. Only `matchId` (plus cosmetic display fields — events,
// for the match-history record) are taken from the client; everything that
// affects currency/stats comes from the stored server-authoritative result.
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
    const userId = payload.userId as string;

    await connectDB();

    const { matchId, events } = await request.json();
    if (!matchId || typeof matchId !== "string") {
      return NextResponse.json({ message: "matchId is required" }, { status: 400 });
    }

    const claim = await claimPvPResult(matchId, userId);
    if (!claim) {
      return NextResponse.json(
        { message: "Match result not found, not yours, or already claimed" },
        { status: 400 },
      );
    }

    const gameUser = await GameUserModel.findOne({ userId });
    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    // Save match to DB
    const match = await GameMatchModel.create({
      userId,
      user_squad: [],
      opponent_name: claim.opponentName,
      opponent_squad: [],
      user_score: claim.userScore,
      opponent_score: claim.opponentScore,
      user_possession: claim.userPossession,
      opponent_possession: claim.opponentPossession,
      user_shots: claim.userShots,
      opponent_shots: claim.opponentShots,
      user_shots_on_target: claim.userShotsOnTarget,
      opponent_shots_on_target: claim.opponentShotsOnTarget,
      events: Array.isArray(events) ? events : [],
      player_of_match: {
        playerId: "",
        shortName: claim.playerOfTheMatch || "Unknown",
      },
      result: claim.result,
      xp_earned: claim.rewards.xp,
      coins_earned: claim.rewards.coins,
      duration_seconds: 25,
    });

    // Update user stats
    gameUser.total_matches += 1;
    gameUser.goals_scored += claim.userScore;
    gameUser.goals_conceded += claim.opponentScore;

    if (claim.result === "win") {
      gameUser.total_wins += 1;
      gameUser.current_streak += 1;
      if (gameUser.current_streak > gameUser.longest_streak) {
        gameUser.longest_streak = gameUser.current_streak;
      }
    } else if (claim.result === "loss") {
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

    gameUser.xp += claim.rewards.xp;
    gameUser.coins += claim.rewards.coins;
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
