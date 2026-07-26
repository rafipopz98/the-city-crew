import { connectDB } from "@/lib/db/mongoose";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

// GET - Fetch single game player
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const player = await GamePlayerModel.findById(id).lean();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    await logError("/api/admin/game-players/[id]", "GET", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 },
    );
  }
}

// PUT - Update game player
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    // Build update object - only include fields that are sent
    const updateData: any = {};

    const directFields = [
      "player_id", "short_name", "long_name", "age", "nationality",
      "positions", "overall", "pace", "shooting", "passing",
      "dribbling", "defending", "physic", "image_url", "rarity",
      "required_xp", "price", "preferred_foot", "weak_foot",
      "skill_moves", "work_rate", "player_traits",
    ];

    for (const field of directFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

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
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const player = await GamePlayerModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true, context: "query" },
    ).lean();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error: any) {
    await logError("/api/admin/game-players/[id]", "PUT", error);
    return NextResponse.json(
      { error: error.message || "Failed to update player" },
      { status: 500 },
    );
  }
}

// DELETE - Remove game player
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const player = await GamePlayerModel.findByIdAndDelete(id);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    await logError("/api/admin/game-players/[id]", "DELETE", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 },
    );
  }
}
