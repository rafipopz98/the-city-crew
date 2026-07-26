import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";

export async function GET(request: Request) {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30")));
    const rarity = searchParams.get("rarity");
    const position = searchParams.get("position");
    const search = searchParams.get("search");
    const owned = searchParams.get("owned");

    // Get owned player IDs first (always needed for is_owned flag + upgrade data)
    const ownedPlayers = await GameOwnedPlayerModel.find({ userId: auth.userId })
      .select("playerId squad_position in_squad upgrades total_upgrade_cost")
      .lean();

    const ownedSet = new Set(ownedPlayers.map((op) => op.playerId.toString()));
    const ownedMap = new Map(ownedPlayers.map((op) => [op.playerId.toString(), op]));

    const allTotal = await GamePlayerModel.countDocuments({});
    const ownedCount = ownedSet.size;

    // Build match filter
    const matchFilter: Record<string, any> = {};

    // When filtering by owned, only fetch players the user owns
    if (owned === "owned") {
      matchFilter._id = { $in: Array.from(ownedSet).map((id) => id) };
    } else if (owned === "locked") {
      matchFilter._id = { $nin: Array.from(ownedSet).map((id) => id) };
    }

    if (rarity && rarity !== "all") matchFilter.rarity = rarity;
    if (position) matchFilter.positions = position;
    if (search) {
      matchFilter.$or = [
        { short_name: { $regex: search, $options: "i" } },
        { long_name: { $regex: search, $options: "i" } },
      ];
    }

    // Get filtered + paginated players
    const players = await GamePlayerModel.find(matchFilter)
      .sort({ overall: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const collection = players.map((player: any) => {
      const ownedId = player._id.toString();
      const ownedDoc = ownedMap.get(ownedId) as any;
      const upgrades = ownedDoc?.upgrades || {};

      // Calculate effective stats with upgrades (no cap — stats can go beyond 99)
      const effPace = player.pace + (upgrades.pace || 0);
      const effShooting = player.shooting + (upgrades.shooting || 0);
      const effPassing = player.passing + (upgrades.passing || 0);
      const effDribbling = player.dribbling + (upgrades.dribbling || 0);
      const effDefending = player.defending + (upgrades.defending || 0);
      const effPhysic = player.physic + (upgrades.physic || 0);
      const effOverall = Math.round((effPace + effShooting + effPassing + effDribbling + effDefending + effPhysic) / 6);

      return {
        _id: ownedId,
        player_id: player.player_id,
        short_name: player.short_name,
        long_name: player.long_name,
        nationality: player.nationality,
        positions: player.positions,
        // Base stats
        overall: player.overall,
        pace: player.pace,
        shooting: player.shooting,
        passing: player.passing,
        dribbling: player.dribbling,
        defending: player.defending,
        physic: player.physic,
        // Effective (upgraded) stats
        effective_overall: effOverall,
        effective_pace: effPace,
        effective_shooting: effShooting,
        effective_passing: effPassing,
        effective_dribbling: effDribbling,
        effective_defending: effDefending,
        effective_physic: effPhysic,
        upgrade_levels: upgrades,
        total_upgrade_cost: ownedDoc?.total_upgrade_cost || 0,
        image_url: player.image_url,
        rarity: player.rarity,
        required_xp: player.required_xp,
        price: player.price,
        is_owned: ownedSet.has(ownedId),
        in_squad: ownedDoc?.in_squad || false,
        squad_position: ownedDoc?.squad_position || null,
      };
    });

    const total = owned === "owned"
      ? ownedCount
      : owned === "locked"
        ? allTotal - ownedCount
        : await GamePlayerModel.countDocuments(matchFilter);

    return NextResponse.json({
      collection,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      allTotal,
      ownedCount,
    });
  } catch (error) {
    await logError("/api/game/collection", "GET", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
