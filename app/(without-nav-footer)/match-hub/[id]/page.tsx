import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MatchHero from "@/components/MatchDetail/MatchHero";
import MatchLineup from "@/components/MatchDetail/MatchLineup";
import PlayerRatingsPreview from "@/components/MatchDetail/PlayerRatingsPreview";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  await connectDB();
  const match = await MatchesModel.findById(id)
    .populate("season", "year")
    .lean();

  if (!match) {
    return {
      title: "Match Not Found",
      description: "The requested match could not be found.",
    };
  }

  const homeTeam = match.homeTeam?.name || "Unknown";
  const awayTeam = match.awayTeam?.name || "Unknown";
  const competition = match.competition || "Match";

  return createMetadata({
    title: `${homeTeam} vs ${awayTeam} | Match Details`,
    description: `Match details for ${homeTeam} vs ${awayTeam} in the ${competition}. Score, stats, and match information.`,
    path: `/match-hub/${id}`,
    keywords: [
      `${homeTeam} vs ${awayTeam}`,
      `${homeTeam} match`,
      `${awayTeam} match`,
      competition,
      "Manchester City",
      "MCFC",
      "match report",
    ],
  });
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;

  await connectDB();

  const match = await MatchesModel.findById(id)
    .populate("season", "year")
    .populate("lineup", "name position vertical_image round_image number")
    .lean();

  if (!match) {
    notFound();
  }

  // Pass the raw instant to the client and let MatchHero format it in the
  // viewer's own timezone — formatting it here would bake in the server's
  // timezone and show every visitor the same (often wrong) time.
  const matchDateIso = new Date(match.matchDate).toISOString();

  // Clean goal scorers
  const cleanGoalScorers =
    match.goalScorers?.map((scorer: any) => ({
      playerName: scorer.playerName,
      minute: scorer.minute,
      team: scorer.team,
      isPenalty: scorer.isPenalty || false,
      isOwnGoal: scorer.isOwnGoal || false,
    })) || [];

  // Serialize lineup players to plain objects — Mongoose ObjectIds have toJSON
  // methods which Next.js refuses to pass from Server to Client Components.
  const serializePlayer = (p: any) => ({
    _id: p._id?.toString() ?? String(p._id),
    name: p.name,
    position: p.position,
    vertical_image: p.vertical_image,
    round_image: p.round_image,
    number: p.number,
  });

  // Split lineup into Starting XI (first 11) and Subs (rest)
  const allPlayers = (match.lineup || []).map(serializePlayer);
  const startingXI = allPlayers.slice(0, 11);
  const subs = allPlayers.slice(11);

  return (
    <main className="min-h-screen bg-[#FFF5E5]">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="relative px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 max-w-7xl mx-auto">
        <Link
          href="/matches"
          className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-black/30 hover:text-black/70 transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">
            Back to Fixtures
          </span>
        </Link>

        <div className="space-y-8 sm:space-y-10 md:space-y-14">
          <MatchHero
            competition={match.competition}
            season={match.season?.year}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={match.homeTeamScore}
            awayScore={match.awayTeamScore}
            status={match.status}
            venue={match.venue}
            matchDate={matchDateIso}
            matchday={match.matchday}
            goalScorers={cleanGoalScorers}
          />

          {/* Lineup */}
          {allPlayers.length > 0 && (
            <MatchLineup
              matchId={match._id.toString()}
              startingXI={startingXI}
              subs={subs}
              formation={match.formation}
            />
          )}

          <PlayerRatingsPreview matchId={match._id.toString()} />
        </div>
      </div>
    </main>
  );
}
