import { connectDB } from "@/lib/db/mongoose";
import { PlayersModels } from "@/lib/models/Players";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch single player
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params; // Await params in Next.js 15

    const player = await PlayersModels.findById(id)
      .populate("season", "year")
      .lean();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 },
    );
  }
}

// PUT - Update player
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params; // Await params in Next.js 15
    const body = await req.json();

    // Build update object dynamically - only include fields that are sent
    const playerData: any = {};

    // Only include fields that are explicitly sent in the request
    if (body.name !== undefined) playerData.name = body.name;
    if (body.country !== undefined) playerData.country = body.country;
    if (body.position !== undefined) playerData.position = body.position;
    if (body.season !== undefined) playerData.season = body.season;

    // Images - only update if provided
    if (body.verticalImage !== undefined)
      playerData.vertical_image = body.verticalImage;
    if (body.roundImage !== undefined) playerData.round_image = body.roundImage;

    // Stats - use nullish coalescing to allow 0 values
    if (body.goals !== undefined) playerData.goals = body.goals;
    if (body.assists !== undefined) playerData.assists = body.assists;
    if (body.clean_sheets !== undefined)
      playerData.clean_sheets = body.clean_sheets;
    if (body.yellow_cards !== undefined)
      playerData.yellow_cards = body.yellow_cards;
    if (body.red_cards !== undefined) playerData.red_cards = body.red_cards;
    if (body.penalty_goals !== undefined)
      playerData.penalty_goals = body.penalty_goals;
    if (body.penalty_missed !== undefined)
      playerData.penalty_missed = body.penalty_missed;
    if (body.penalty_saved !== undefined)
      playerData.penalty_saved = body.penalty_saved;
    if (body.appearances !== undefined)
      playerData.appearances = body.appearances;
    if (body.minutes_played !== undefined)
      playerData.minutes_played = body.minutes_played;
    if (body.saves !== undefined) playerData.saves = body.saves;

    // Boolean flags
    if (body.isCaptain !== undefined) playerData.is_captain = body.isCaptain;
    if (body.isActive !== undefined) playerData.is_active = body.isActive;

    // Optional fields
    if (body.shirtNumber !== undefined)
      playerData.number = Number(body.shirtNumber);
    if (body.age !== undefined) playerData.age = Number(body.age);

    const player = await PlayersModels.findByIdAndUpdate(
      id,
      { $set: playerData }, // Use $set to only update provided fields
      {
        new: true,
        runValidators: true,
        // This tells Mongoose to only validate the fields being updated
        context: "query",
      },
    )
      .populate("season", "year")
      .lean();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error: any) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update player" },
      { status: 500 },
    );
  }
}

// DELETE - Remove player
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params; // Await params in Next.js 15

    const player = await PlayersModels.findByIdAndDelete(id);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 },
    );
  }
}
