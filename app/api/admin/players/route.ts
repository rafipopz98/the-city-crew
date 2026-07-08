import { connectDB } from "@/lib/db/mongoose";
import { PlayersModels } from "@/lib/models/Players";
import { playerImages } from "@/public/players-image";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all players with pagination
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");
    const position = searchParams.get("position");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Define position groups mapping
    const positionGroups: Record<string, string[]> = {
      GK: ["GK"],
      DEF: ["CB", "LB", "RB", "LWB", "RWB"],
      MID: ["CM", "CDM", "CAM", "DM", "AM", "LM", "RM"],
      FWD: ["ST", "CF", "LW", "RW", "LF", "RF"],
    };

    let query: any = {};

    if (season) {
      query.season = season;
    }

    if (position) {
      if (positionGroups[position]) {
        query.position = { $in: positionGroups[position] };
      } else {
        query.position = position;
      }
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Get total count for pagination
    const totalPlayers = await PlayersModels.countDocuments(query);
    const totalPages = Math.ceil(totalPlayers / limit);
    const skip = (page - 1) * limit;

    const players = await PlayersModels.find(query)
      .populate("season", "year")
      .sort({ goals: -1, position: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      players,
      currentPage: page,
      totalPages,
      totalPlayers,
      playersPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}

// POST - Create a new player
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // If no images provided but a player image was selected, use those
    let verticalImage = body.verticalImage || "";
    let roundImage = body.roundImage || "";

    if (!verticalImage || !roundImage) {
      const selectedImage = playerImages.find(
        (img) => img.value === body.selectedPlayerImage,
      );
      if (selectedImage) {
        verticalImage = verticalImage || selectedImage.verticalImage;
        roundImage = roundImage || selectedImage.roundImage;
      }
    }

    // Map the form fields to match your schema
    const playerData = {
      name: body.name,
      country: body.country,
      position: body.position,
      season: body.season,
      vertical_image: verticalImage,
      round_image: roundImage,
      goals: body.goals || 0,
      assists: body.assists || 0,
      clean_sheets: body.cleanSheets || 0,
      yellow_cards: body.yellowCards || 0,
      red_cards: body.redCards || 0,
      penalty_goals: body.penaltyGoals || 0,
      penalty_missed: body.penaltyMissed || 0,
      penalty_saved: body.penaltySaved || 0,
      appearances: body.appearances || 0,
      minutes_played: body.minutesPlayed || 0,
      saves: body.saves || 0,
      number: body.shirtNumber ? Number(body.shirtNumber) : undefined,
      age: body.age ? Number(body.age) : undefined,
      is_captain: body.isCaptain || false,
      is_active: body.isActive !== undefined ? body.isActive : true,
    };

    const player = await PlayersModels.create(playerData);

    // Populate the season data before returning
    const populatedPlayer = await PlayersModels.findById(player._id)
      .populate("season", "year")
      .lean();

    return NextResponse.json(populatedPlayer, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 },
    );
  }
}
