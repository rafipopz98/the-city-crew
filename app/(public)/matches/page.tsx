import { connectDB } from "@/lib/db/mongoose";
import { SeasonModel } from "@/lib/models/Season";
import MatchesClient from "./client";
import { createMetadata } from "@/lib/seo";
import { getCurrentSeason } from "@/lib/seasonUtils";

export const metadata = createMetadata({
  title: "Manchester City Fixtures & Results",
  description:
    "View all Manchester City matches, fixtures, results, and scores from every competition. Stay updated with The City Crew.",
  path: "/matches",
  keywords: [
    "Manchester City fixtures",
    "Man City results",
    "MCFC matches",
    "Premier League fixtures",
    "UCL fixtures",
    "City scores",
    "match schedule",
  ],
});

export default async function MatchesPage() {
  await connectDB();

  // Get current season
  const currentSeasonYear = getCurrentSeason();

  // Find current season in DB
  let season = await SeasonModel.findOne({ year: currentSeasonYear });

  // If not found, get the latest season
  if (!season) {
    season = await SeasonModel.findOne().sort({ year: -1 }).limit(1);
  }

  // Get all seasons for dropdown
  const allSeasons = await SeasonModel.find().sort({ year: -1 }).lean();

  return (
    <MatchesClient
      initialSeason={season?._id?.toString() || ""}
      allSeasons={allSeasons.map((s: any) => ({
        _id: s._id.toString(),
        year: s.year,
      }))}
    />
  );
}
