import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { PlayersModels } from "@/lib/models/Players";
import { SeasonModel } from "@/lib/models/Season";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get current season
    const currentSeason = await SeasonModel.findOne().sort({ year: -1 });

    if (!currentSeason) {
      return NextResponse.json({ error: "No season found" }, { status: 404 });
    }

    // Get latest finished match, or latest upcoming if no finished
    let latestMatch = await MatchesModel.findOne({
      season: currentSeason._id,
      status: "finished",
    })
      .sort({ matchDate: -1 })
      .lean();

    // If no finished match, get the next upcoming match
    if (!latestMatch) {
      latestMatch = await MatchesModel.findOne({
        season: currentSeason._id,
        status: "upcoming",
      })
        .sort({ matchDate: 1 })
        .lean();
    }

    // Get top scorers (sorted by goals, then by name)
    const topScorers = await PlayersModels.find({
      season: currentSeason._id,
      goals: { $gt: 0 },
    })
      .sort({ goals: -1, name: 1 })
      .limit(3)
      .select("name goals round_image vertical_image")
      .lean();

    // Get top assisters (sorted by assists, then by name)
    const topAssisters = await PlayersModels.find({
      season: currentSeason._id,
      assists: { $gt: 0 },
    })
      .sort({ assists: -1, name: 1 })
      .limit(3)
      .select("name assists round_image vertical_image")
      .lean();

    return NextResponse.json({
      latestMatch,
      topScorers,
      topAssisters,
      season: currentSeason.year,
    });
  } catch (error) {
    await logError("/api/landing", "GET", error);
    console.error("Error fetching landing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing data" },
      { status: 500 },
    );
  }
}
