import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");
    const competition = searchParams.get("competition");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query: any = {};

    if (season) {
      query.season = season;
    }

    if (competition) {
      query.competition = competition;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { "homeTeam.name": { $regex: search, $options: "i" } },
        { "awayTeam.name": { $regex: search, $options: "i" } },
        { competition: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const totalMatches = await MatchesModel.countDocuments(query);
    const totalPages = Math.ceil(totalMatches / limit);
    const skip = (page - 1) * limit;

    const matches = await MatchesModel.find(query)
      .populate("season", "year")
      .sort({ matchDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      matches,
      currentPage: page,
      totalPages,
      totalMatches,
      matchesPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const match = await MatchesModel.create(body);

    const populatedMatch = await MatchesModel.findById(match._id)
      .populate("season", "year")
      .lean();

    return NextResponse.json(populatedMatch, { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 },
    );
  }
}
