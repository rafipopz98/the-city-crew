import { createMetadata } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongoose";
import { SeasonModel } from "@/lib/models/Season";
import { PlayersModels } from "@/lib/models/Players";
import PlayersPageClient from "./client";
import { getCurrentSeason } from "@/lib/seasonUtils";

export const metadata = createMetadata({
  title: "Manchester City Squad & Player Stats",
  description:
    "Explore the Manchester City squad, player profiles, ratings, appearances, goals, assists, clean sheets and more from The City Crew.",
  path: "/player-stats",
  keywords: [
    "Manchester City players",
    "Manchester City squad",
    "Manchester City player stats",
    "Manchester City ratings",
    "Haaland stats",
    "Phil Foden stats",
    "Rodri stats",
    "MCFC squad",
  ],
});

export default async function PlayersPage() {
  await connectDB();

  // 1. Get current season (e.g., "2025-26")
  const currentSeasonYear = getCurrentSeason();

  // 2. Try to find current season in DB
  let season = await SeasonModel.findOne({ year: currentSeasonYear });

  // 3. If not found, get the latest season
  if (!season) {
    season = await SeasonModel.findOne().sort({ year: -1 }).limit(1);
  }

  // 4. If no seasons exist at all, return empty state
  if (!season) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">No seasons data available</p>
      </div>
    );
  }

  // 5. Fetch players for this season
  const playersData = await PlayersModels.find({
    season: season._id,
    is_active: true,
  })
    .lean()
    .populate("season");

  // 6. Map to match your frontend Player type
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

  // 7. Get all seasons for dropdown
  const allSeasons = await SeasonModel.find().sort({ year: -1 }).lean();

  return (
    <PlayersPageClient
      initialPlayers={players}
      currentSeason={season.year}
      allSeasons={allSeasons.map((s: any) => s.year)}
    />
  );
}
