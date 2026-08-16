import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameMatchModel } from "@/lib/game/models/GameMatch";
import { GamePendingMatchModel } from "@/lib/game/models/GamePendingMatch";
import { simulateSecondHalf, calculateRewards, type MatchHalfState } from "@/lib/game/engine/matchEngine";
import { buildMatchPlayersFromSelection } from "@/lib/game/utils/loadSquadMatchPlayers";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// POST /api/game/match/continue - Finish a bot match started by
// /api/game/match/start. Optionally applies a halftime squad change
// (substitutions/formation), then plays the second half and finalizes
// rewards. Entry fee was already charged at kickoff.
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

    const { matchId, updatedSquad } = await request.json();
    if (!matchId || typeof matchId !== "string") {
      return NextResponse.json({ message: "matchId is required" }, { status: 400 });
    }

    const pending = await GamePendingMatchModel.findOne({ _id: matchId, userId });
    if (!pending) {
      return NextResponse.json(
        { message: "No pending match found — it may have already finished or expired" },
        { status: 400 },
      );
    }

    const state = pending.state as unknown as MatchHalfState;

    let updatedUserSquad = undefined;
    if (updatedSquad?.players) {
      const players = await buildMatchPlayersFromSelection(userId, updatedSquad.players);
      if (!players) {
        return NextResponse.json(
          { message: "Invalid substitution — check every player is really yours and positions are valid" },
          { status: 400 },
        );
      }
      updatedUserSquad = { players, name: state.userSquad.name };
    }

    const result = simulateSecondHalf(state, updatedUserSquad);

    const matchResult = result.userScore > result.opponentScore
      ? "win"
      : result.userScore < result.opponentScore
        ? "loss"
        : "draw";

    const finalSquad = (updatedUserSquad?.players || state.userSquad.players) as any[];
    const userRating = Math.round(
      finalSquad.reduce((sum, p) => sum + p.overall, 0) / finalSquad.length,
    );
    const rewards = calculateRewards(matchResult, userRating, result.userScore, result.opponentScore);

    const gameUser = await GameUserModel.findOne({ userId });
    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    const match = await GameMatchModel.create({
      userId,
      user_squad: finalSquad.map((p) => ({
        playerId: p._id,
        shortName: p.short_name,
        position: p.position,
      })),
      opponent_name: "Opponent",
      opponent_squad: [],
      user_score: result.userScore,
      opponent_score: result.opponentScore,
      user_possession: result.userPossession,
      opponent_possession: result.opponentPossession,
      user_shots: result.userShots,
      opponent_shots: result.opponentShots,
      user_shots_on_target: result.userShotsOnTarget,
      opponent_shots_on_target: result.opponentShotsOnTarget,
      events: result.events,
      player_of_match: {
        playerId: result.playerOfTheMatch.playerId,
        shortName: result.playerOfTheMatch.shortName,
      },
      result: matchResult,
      xp_earned: rewards.xp,
      coins_earned: rewards.coins,
      duration_seconds: result.duration_seconds,
    });

    gameUser.total_matches += 1;
    gameUser.goals_scored += result.userScore;
    gameUser.goals_conceded += result.opponentScore;

    if (matchResult === "win") {
      gameUser.total_wins += 1;
      gameUser.current_streak += 1;
      if (gameUser.current_streak > gameUser.longest_streak) {
        gameUser.longest_streak = gameUser.current_streak;
      }
    } else if (matchResult === "loss") {
      gameUser.total_losses += 1;
      gameUser.current_streak = 0;
    } else {
      gameUser.total_draws += 1;
    }

    // Fee was already deducted in /start — only apply rewards here.
    gameUser.xp += rewards.xp;
    gameUser.coins += rewards.coins;
    await gameUser.save();

    await GamePendingMatchModel.deleteOne({ _id: matchId });

    return NextResponse.json({
      matchId: match._id.toString(),
      // Events past minute 45 (halftime) — the client uses this to
      // continue the reveal animation from where it paused, rather than
      // re-showing the first half it already played.
      secondHalfEvents: result.events.filter((e) => e.minute > 45),
      result: {
        ...result,
        matchResult,
        rewards,
        userRating,
        feeDeducted: 5,
        breakdown: {
          goalsScored: result.userScore,
          goalsConceded: result.opponentScore,
          cleanSheet: result.opponentScore === 0,
        },
      },
      gameUser: {
        xp: gameUser.xp,
        coins: gameUser.coins,
        total_matches: gameUser.total_matches,
        total_wins: gameUser.total_wins,
        total_losses: gameUser.total_losses,
        total_draws: gameUser.total_draws,
      },
    });
  } catch (error) {
    await logError("/api/game/match/continue", "POST", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
