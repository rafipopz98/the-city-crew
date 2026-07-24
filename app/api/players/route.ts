import { connectDB } from "@/lib/db/mongoose";
import { PlayersModels } from "@/lib/models/Players";
import { SeasonModel } from "@/lib/models/Season";
import { NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const seasonYear = searchParams.get("season");

    if (!seasonYear) {
      return NextResponse.json(
        { error: "Season parameter is required" },
        { status: 400 },
      );
    }

    // Find season by year
    const season = await SeasonModel.findOne({ year: seasonYear });

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    // Fetch players
    const playersData = await PlayersModels.find({
      season: season._id,
      is_active: true,
    }).lean();

    // Map to frontend format
    const players = playersData.map((p: any) => ({
      name: p.name,
      number: String(p.number || "").padStart(2, "0"),
      position: p.position,
      country: p.country,
      image: p.vertical_image,
      goals: p.goals || 0,
      assists: p.assists || 0,
      cleanSheets: p.clean_sheets || 0,
      games: p.appearances || 0,
      rating: p.rating || 0,
      _id: p._id.toString(),
    }));

    return NextResponse.json(players);
  } catch (error) {
    await logError("/api/players", "GET", error);
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}
