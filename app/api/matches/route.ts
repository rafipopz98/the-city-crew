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
    const limit = parseInt(searchParams.get("limit") || "12");
    const page = parseInt(searchParams.get("page") || "1");
    const latest = searchParams.get("latest");

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

    // Special "latest" filters
    if (latest === "results") {
      query.status = "finished";
      // Use matchDate sorting
    }
    if (latest === "fixtures") {
      query.status = "upcoming";
    }

    const totalMatches = await MatchesModel.countDocuments(query);
    const totalPages = Math.ceil(totalMatches / limit);
    const skip = (page - 1) * limit;

    // Sort logic
    let sortOrder: any = { matchDate: 1 };
    if (latest === "results") {
      sortOrder = { matchDate: -1 };
    } else if (status === "finished") {
      sortOrder = { matchDate: -1 };
    }

    const matches = await MatchesModel.find(query)
      .populate("season", "year")
      .populate("lineup", "name") // Add this for lineup data
      .sort(sortOrder)
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
