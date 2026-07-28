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

    // Determine if player is a GK
    const positions: string[] = (player as any).positions || [];
    const isGK = positions.includes("GK");

    // Calculate effective stats with upgrades (no cap — stats can go beyond 99)
    const effPace = (player as any).pace + (upgrades.pace || 0);
    const effShooting = (player as any).shooting + (upgrades.shooting || 0);
    const effPassing = (player as any).passing + (upgrades.passing || 0);
    const effDribbling = (player as any).dribbling + (upgrades.dribbling || 0);
    const effDefending = (player as any).defending + (upgrades.defending || 0);
    const effPhysic = (player as any).physic + (upgrades.physic || 0);

    // GK effective stats (use || 0 so non-GK players don't get NaN)
    const effDiving = ((player as any).goalkeeping_diving || 0) + (upgrades.goalkeeping_diving || 0);
    const effHandling = ((player as any).goalkeeping_handling || 0) + (upgrades.goalkeeping_handling || 0);
    const effKicking = ((player as any).goalkeeping_kicking || 0) + (upgrades.goalkeeping_kicking || 0);
    const effPositioning = ((player as any).goalkeeping_positioning || 0) + (upgrades.goalkeeping_positioning || 0);
    const effReflexes = ((player as any).goalkeeping_reflexes || 0) + (upgrades.goalkeeping_reflexes || 0);
    const effSpeed = ((player as any).goalkeeping_speed || 0) + (upgrades.goalkeeping_speed || 0);

    const effOverall = isGK
      ? Math.round((effDiving + effHandling + effKicking + effPositioning + effReflexes + effSpeed) / 6)
      : Math.round((effPace + effShooting + effPassing + effDribbling + effDefending + effPhysic) / 6);

    return NextResponse.json({
      player: {
        _id: (player as any)._id.toString(),
        player_id: (player as any).player_id,
        short_name: (player as any).short_name,
        long_name: (player as any).long_name,
        nationality: (player as any).nationality,
        age: (player as any).age,
        positions,
        // Base stats (field + GK)
        overall: (player as any).overall,
        pace: (player as any).pace,
        shooting: (player as any).shooting,
        passing: (player as any).passing,
        dribbling: (player as any).dribbling,
        defending: (player as any).defending,
        physic: (player as any).physic,
        goalkeeping_diving: (player as any).goalkeeping_diving,
        goalkeeping_handling: (player as any).goalkeeping_handling,
        goalkeeping_kicking: (player as any).goalkeeping_kicking,
        goalkeeping_positioning: (player as any).goalkeeping_positioning,
        goalkeeping_reflexes: (player as any).goalkeeping_reflexes,
        goalkeeping_speed: (player as any).goalkeeping_speed,
        // Effective (upgraded) stats — field
        effective_overall: effOverall,
        effective_pace: effPace,
        effective_shooting: effShooting,
        effective_passing: effPassing,
        effective_dribbling: effDribbling,
        effective_defending: effDefending,
        effective_physic: effPhysic,
        // Effective (upgraded) stats — GK
        effective_goalkeeping_diving: effDiving,
        effective_goalkeeping_handling: effHandling,
        effective_goalkeeping_kicking: effKicking,
        effective_goalkeeping_positioning: effPositioning,
        effective_goalkeeping_reflexes: effReflexes,
        effective_goalkeeping_speed: effSpeed,
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
