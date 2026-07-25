import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameSquadModel } from "@/lib/game/models/GameSquad";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";

// GET /api/game/squad - Get active squad
export async function GET() {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [squad, ownedPlayers] = await Promise.all([
      GameSquadModel.findOne({ userId: auth.userId, is_active: true })
        .populate("players.playerId")
        .lean(),
      GameOwnedPlayerModel.find({ userId: auth.userId })
        .populate("playerId")
        .lean(),
    ]);

    return NextResponse.json({
      squad: squad || null,
      ownedPlayers: ownedPlayers.map((op: any) => ({
        _id: op._id.toString(),
        playerId: op.playerId,
        in_squad: op.in_squad,
        squad_position: op.squad_position,
        squad_slot: op.squad_slot,
      })),
    });
  } catch (error) {
    await logError("/api/game/squad", "GET", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// PUT /api/game/squad - Update squad
export async function PUT(request: Request) {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { players } = await request.json();

    if (!players || players.length !== 5) {
      return NextResponse.json({ message: "Squad must have exactly 5 players" }, { status: 400 });
    }

    // Validate positions
    const validPositions = ["GK", "DEF", "MID", "FWD"];
    const positionCount: Record<string, number> = {};
    for (const p of players) {
      if (!validPositions.includes(p.position)) {
        return NextResponse.json({ message: `Invalid position: ${p.position}` }, { status: 400 });
      }
      positionCount[p.position] = (positionCount[p.position] || 0) + 1;
    }

    if ((positionCount["GK"] || 0) !== 1) {
      return NextResponse.json({ message: "Squad must have exactly 1 goalkeeper" }, { status: 400 });
    }

    // Bulk operations — single DB call instead of loop
    const bulkOps = players.map((p: any) => ({
      updateOne: {
        filter: { _id: p.ownedPlayerId, userId: auth.userId },
        update: { $set: { in_squad: true, squad_position: p.position, squad_slot: p.slot } },
      },
    }));

    // Clear all squad assignments, then set new ones
    await Promise.all([
      GameOwnedPlayerModel.updateMany(
        { userId: auth.userId },
        { $set: { in_squad: false, squad_position: null, squad_slot: null } },
      ),
    ]);

    if (bulkOps.length > 0) {
      await GameOwnedPlayerModel.bulkWrite(bulkOps);
    }

    // Upsert squad
    const squad = await GameSquadModel.findOneAndUpdate(
      { userId: auth.userId, is_active: true },
      {
        $set: {
          name: "My Squad",
          formation: "1-1-2-1",
          players: players.map((p: any) => ({
            ownedPlayerId: p.ownedPlayerId,
            playerId: p.playerId,
            position: p.position,
            slot: p.slot,
          })),
          is_active: true,
        },
      },
      { upsert: true, returnDocument: "after" },
    ).populate("players.playerId");

    await GameUserModel.findOneAndUpdate(
      { userId: auth.userId },
      { $set: { active_squad_id: squad._id } },
    );

    return NextResponse.json({ message: "Squad updated!", squad: squad.toObject() });
  } catch (error) {
    await logError("/api/game/squad", "PUT", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
