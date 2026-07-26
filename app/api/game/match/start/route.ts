import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameSquadModel } from "@/lib/game/models/GameSquad";
import { GameMatchModel } from "@/lib/game/models/GameMatch";
import { simulateMatch, calculateRewards, MATCH_FEE, type MatchPlayer } from "@/lib/game/engine/matchEngine";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// POST /api/game/match/start - Start a new match
export async function POST() {
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

    const gameUser = await GameUserModel.findOne({ userId: payload.userId });
    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    // Get active squad
    const squad = await GameSquadModel.findOne({
      userId: payload.userId,
      is_active: true,
    }).populate("players.playerId");

    if (!squad || squad.players.length !== 5) {
      return NextResponse.json(
        { message: "You need a complete 5-player squad to play" },
        { status: 400 },
      );
    }

    // Build user squad for match engine
    const userMatchPlayers: MatchPlayer[] = squad.players.map((sp: any) => {
      const p = sp.playerId;
      return {
        _id: p._id.toString(),
        player_id: p.player_id,
        short_name: p.short_name,
        overall: p.overall,
        pace: p.pace,
        shooting: p.shooting,
        passing: p.passing,
        dribbling: p.dribbling,
        defending: p.defending,
        physic: p.physic,
        position: sp.position,
        attacking_finishing: p.attacking_finishing,
        mentality_positioning: p.mentality_positioning,
        mentality_vision: p.mentality_vision,
        goalkeeping_diving: p.goalkeeping_diving,
        goalkeeping_reflexes: p.goalkeeping_reflexes,
        goalkeeping_positioning: p.goalkeeping_positioning,
        movement_sprint_speed: p.movement_sprint_speed,
        power_shot_power: p.power_shot_power,
        power_stamina: p.power_stamina,
        movement_reactions: p.movement_reactions,
      };
    });

    // Simulate match
    const result = simulateMatch({ players: userMatchPlayers, name: gameUser.username });

    // Calculate result type
    const matchResult = result.userScore > result.opponentScore
      ? "win"
      : result.userScore < result.opponentScore
        ? "loss"
        : "draw";

    // Check entry fee & deduct
    if (gameUser.coins < MATCH_FEE) {
      return NextResponse.json(
        { message: `You need at least ${MATCH_FEE} coins to play a match. Earn coins by winning matches!` },
        { status: 400 },
      );
    }
    gameUser.coins -= MATCH_FEE;

    // Calculate rewards
    const userRating = Math.round(
      userMatchPlayers.reduce((sum, p) => sum + p.overall, 0) / userMatchPlayers.length,
    );
    const rewards = calculateRewards(matchResult, userRating, result.userScore, result.opponentScore);
    const feeDeducted = MATCH_FEE;

    // Save match to DB
    const match = await GameMatchModel.create({
      userId: payload.userId,
      user_squad: userMatchPlayers.map((p) => ({
        playerId: p._id,
        shortName: p.short_name,
        position: p.position,
      })),
      opponent_name: "Opponent",
      opponent_squad: [], // Not storing full opponent details
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

    // Update user stats
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

    // Apply rewards (fee already deducted above)
    gameUser.xp += rewards.xp;
    gameUser.coins += rewards.coins;
    await gameUser.save();

    return NextResponse.json({
      matchId: match._id.toString(),
      result: {
        ...result,
        matchResult,
        rewards,
        userRating,
        feeDeducted: MATCH_FEE,
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
    await logError("/api/game/match/start", "POST", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
