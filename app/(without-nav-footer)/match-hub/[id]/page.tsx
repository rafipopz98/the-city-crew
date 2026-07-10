import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MatchHero from "@/components/MatchDetail/MatchHero";
import MatchMeta from "@/components/MatchDetail/MatchMeta";
import MatchScorers from "@/components/MatchDetail/MatchScorers";
import PlayerRatingsPreview from "@/components/MatchDetail/PlayerRatingsPreview";

type Props = {
  params: Promise<{
    id: string;
  }>;
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
    .populate("lineup", "name")
    .lean();

  if (!match) {
    notFound();
  }

  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const matchDate = new Date(match.matchDate);
  const formattedDate = matchDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = matchDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ✅ Clean goal scorers - remove _id and convert to plain objects
  const cleanGoalScorers =
    match.goalScorers?.map((scorer: any) => ({
      playerName: scorer.playerName,
      minute: scorer.minute,
      team: scorer.team,
      isPenalty: scorer.isPenalty || false,
      isOwnGoal: scorer.isOwnGoal || false,
    })) || [];

  // ✅ Clean lineup - just get the names
  const lineupPlayers = match.lineup || [];

  return (
    <main className="min-h-screen bg-[#FFF5E5] px-5 pt-28 pb-24 lg:pt-36">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/matches"
          className="
            mb-8
            inline-flex
            items-center
            gap-3
            text-black/40
            transition
            hover:text-black
          "
        >
          <ArrowLeft size={18} />
          <span className="text-sm uppercase tracking-[0.2em]">
            Back to Matches
          </span>
        </Link>

        <MatchHero
          competition={match.competition}
          season={match.season?.year}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homeScore={match.homeTeamScore}
          awayScore={match.awayTeamScore}
          status={match.status}
        />

        <MatchMeta
          date={formattedDate}
          time={formattedTime}
          venue={match.venue}
          matchday={match.matchday}
          isHome={match.isHome}
          matchType={match.matchType}
        />

        {/* Goal Scorers - using cleaned data */}
        {cleanGoalScorers.length > 0 && (
          <MatchScorers
            goalScorers={cleanGoalScorers}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />
        )}

        {/* Lineup Preview */}
        {lineupPlayers.length > 0 && (
          <section className="mt-12 border-t border-black/10 pt-12">
            <h3 className="text-xs uppercase tracking-[0.35em] text-black/40 mb-4">
              City Lineup ({lineupPlayers.length} players)
            </h3>
            <div className="flex flex-wrap gap-2">
              {lineupPlayers.map((player: any) => (
                <span
                  key={player._id}
                  className="px-3 py-1.5 bg-black/5 rounded-full text-sm"
                >
                  {player.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <PlayerRatingsPreview matchId={match._id.toString()} players={[]} />
      </div>
    </main>
  );
}
