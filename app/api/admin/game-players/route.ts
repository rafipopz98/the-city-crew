import { connectDB } from "@/lib/db/mongoose";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

// GET - Fetch all game players with search & pagination
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const rarity = searchParams.get("rarity");
    const position = searchParams.get("position");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query: any = {};

    if (search) {
      query.$or = [
        { short_name: { $regex: search, $options: "i" } },
        { long_name: { $regex: search, $options: "i" } },
        { nationality: { $regex: search, $options: "i" } },
      ];
    }

    if (rarity) {
      query.rarity = rarity;
    }

    if (position) {
      query.positions = position;
    }

    const totalPlayers = await GamePlayerModel.countDocuments(query);
    const totalPages = Math.ceil(totalPlayers / limit);
    const skip = (page - 1) * limit;

    const players = await GamePlayerModel.find(query)
      .sort({ overall: -1, short_name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      players,
      currentPage: page,
      totalPages,
      totalPlayers,
    });
  } catch (error) {
    await logError("/api/admin/game-players", "GET", error);
    console.error("Error fetching game players:", error);
    return NextResponse.json(
      { error: "Failed to fetch game players" },
      { status: 500 },
    );
  }
}

// POST - Create a new game player
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Map frontend field names to schema field names
    const playerData: any = {
      player_id: body.player_id,
      short_name: body.short_name,
      long_name: body.long_name,
      age: body.age || 0,
      nationality: body.nationality || "",
      positions: body.positions || [],
      overall: body.overall || 0,
      pace: body.pace || 0,
      shooting: body.shooting || 0,
      passing: body.passing || 0,
      dribbling: body.dribbling || 0,
      defending: body.defending || 0,
      physic: body.physic || 0,
      image_url: body.image_url || "",
      rarity: body.rarity || "Basic",
      required_xp: body.required_xp || 0,
      price: body.price || 0,
      preferred_foot: body.preferred_foot || "Right",
      weak_foot: body.weak_foot || 3,
      skill_moves: body.skill_moves || 3,
      work_rate: body.work_rate || "Medium/Medium",
      player_traits: body.player_traits || [],
    };

    // Individual attributes
    const attrFields = [
      "attacking_finishing", "attacking_short_passing",
      "skill_ball_control",
      "movement_acceleration", "movement_sprint_speed", "movement_reactions",
      "power_shot_power", "power_stamina", "power_strength",
      "mentality_positioning", "mentality_vision", "mentality_composure",
      "defending_marking_awareness", "defending_standing_tackle", "defending_sliding_tackle",
      "goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking",
      "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed",
    ];
    for (const field of attrFields) {
      if (body[field] !== undefined) playerData[field] = body[field];
    }

    const player = await GamePlayerModel.create(playerData);

    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    await logError("/api/admin/game-players", "POST", error);
    console.error("Error creating game player:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create game player" },
      { status: 500 },
    );
  }
}
