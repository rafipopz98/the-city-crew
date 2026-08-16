import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GamePendingMatchModel } from "@/lib/game/models/GamePendingMatch";
import { simulateFirstHalf, MATCH_FEE } from "@/lib/game/engine/matchEngine";
import { loadSquadMatchPlayers } from "@/lib/game/utils/loadSquadMatchPlayers";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// POST /api/game/match/start - Start a new bot match: plays the first half
// only, stopping at halftime so the player gets a real 30s window to make
// substitutions/change formation before POST /api/game/match/continue
// plays the second half and finalizes rewards.
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
    const userId = payload.userId as string;

    await connectDB();

    const gameUser = await GameUserModel.findOne({ userId });
    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    // Get active squad, converted to MatchPlayer[] with upgrades folded in —
    // shared with PvP so both modes use the exact same authoritative pipeline.
    const userMatchPlayers = await loadSquadMatchPlayers(userId);

    if (!userMatchPlayers) {
      return NextResponse.json(
        { message: "You need a complete 5-player squad to play" },
        { status: 400 },
      );
    }

    // Entry fee is charged now, at kickoff — committing to the match,
    // regardless of whether the player finishes the halftime window.
    if (gameUser.coins < MATCH_FEE) {
      return NextResponse.json(
        { message: `You need at least ${MATCH_FEE} coins to play a match. Earn coins by winning matches!` },
        { status: 400 },
      );
    }
    gameUser.coins -= MATCH_FEE;
    await gameUser.save();

    const halfState = simulateFirstHalf({ players: userMatchPlayers, name: gameUser.username });

    const pending = await GamePendingMatchModel.create({ userId, state: halfState });

    return NextResponse.json({
      matchId: pending._id.toString(),
      firstHalf: {
        events: halfState.events,
        userScore: halfState.userScore,
        opponentScore: halfState.opponentScore,
      },
      gameUser: {
        xp: gameUser.xp,
        coins: gameUser.coins,
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
