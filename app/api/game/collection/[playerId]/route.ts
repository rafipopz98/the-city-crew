import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";

// GET /api/game/collection/[playerId] - Get a specific player with ownership data
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> },
) {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { playerId } = await params;

    // Fetch the base player
    const player = await GamePlayerModel.findById(playerId).lean();
    if (!player) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }

    // Check if user owns this player + get upgrade data
    const ownedDoc = await GameOwnedPlayerModel.findOne({
      userId: auth.userId,
      playerId,
    })
      .select("upgrades total_upgrade_cost in_squad squad_position squad_slot")
      .lean();

    const upgrades = (ownedDoc as any)?.upgrades || {};
    const isOwned = !!ownedDoc;

    // Calculate effective stats with upgrades (no cap — stats can go beyond 99)
    const effPace = (player as any).pace + (upgrades.pace || 0);
    const effShooting = (player as any).shooting + (upgrades.shooting || 0);
    const effPassing = (player as any).passing + (upgrades.passing || 0);
    const effDribbling = (player as any).dribbling + (upgrades.dribbling || 0);
    const effDefending = (player as any).defending + (upgrades.defending || 0);
    const effPhysic = (player as any).physic + (upgrades.physic || 0);
    const effOverall = Math.round((effPace + effShooting + effPassing + effDribbling + effDefending + effPhysic) / 6);

    return NextResponse.json({
      player: {
        _id: (player as any)._id.toString(),
        player_id: (player as any).player_id,
        short_name: (player as any).short_name,
        long_name: (player as any).long_name,
        nationality: (player as any).nationality,
        age: (player as any).age,
        positions: (player as any).positions,
        // Base stats
        overall: (player as any).overall,
        pace: (player as any).pace,
        shooting: (player as any).shooting,
        passing: (player as any).passing,
        dribbling: (player as any).dribbling,
        defending: (player as any).defending,
        physic: (player as any).physic,
        // Effective (upgraded) stats
        effective_overall: effOverall,
        effective_pace: effPace,
        effective_shooting: effShooting,
        effective_passing: effPassing,
        effective_dribbling: effDribbling,
        effective_defending: effDefending,
        effective_physic: effPhysic,
        upgrade_levels: upgrades,
        total_upgrade_cost: (ownedDoc as any)?.total_upgrade_cost || 0,
        image_url: (player as any).image_url,
        rarity: (player as any).rarity,
        required_xp: (player as any).required_xp,
        price: (player as any).price,
        is_owned: isOwned,
        in_squad: (ownedDoc as any)?.in_squad || false,
        squad_position: (ownedDoc as any)?.squad_position || null,
      },
    });
  } catch (error) {
    await logError("/api/game/collection/[playerId]", "GET", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
