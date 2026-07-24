import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { ArrowLeft, Users, Shirt } from "lucide-react";
import Link from "next/link";
import MatchHero from "@/components/MatchDetail/MatchHero";
import MatchMeta from "@/components/MatchDetail/MatchMeta";
import MatchScorers from "@/components/MatchDetail/MatchScorers";
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

  // Clean goal scorers
  const cleanGoalScorers =
    match.goalScorers?.map((scorer: any) => ({
      playerName: scorer.playerName,
      minute: scorer.minute,
      team: scorer.team,
      isPenalty: scorer.isPenalty || false,
      isOwnGoal: scorer.isOwnGoal || false,
    })) || [];

  // Split lineup into Starting XI (first 11) and Subs (rest)
  const allPlayers = match.lineup || [];
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
            Back to Matches
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
          />

          <MatchMeta
            date={formattedDate}
            time={formattedTime}
            venue={match.venue}
            matchday={match.matchday}
            isHome={match.isHome}
            matchType={match.matchType}
            competition={match.competition}
          />

          {cleanGoalScorers.length > 0 && (
            <MatchScorers
              goalScorers={cleanGoalScorers}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
            />
          )}

          {/* Lineup */}
          {allPlayers.length > 0 && (
            <section className="rounded-2xl sm:rounded-3xl bg-white/40 backdrop-blur-sm border border-black/5 p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#e09225]/20 to-[#e09225]/10">
                  <Shirt size={16} className="text-[#e09225]" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.25em] text-black/40 font-medium">
                    City Lineup
                  </h3>
                  <p className="text-[10px] text-black/25 mt-0.5">
                    {startingXI.length} starting · {subs.length} on bench
                  </p>
                </div>
              </div>

              {/* Starting XI — compact row, no vertical images */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2 sm:gap-2.5">
                {startingXI.map((player: any, idx: number) => (
                  <div
                    key={player._id.toString()}
                    className="flex flex-col items-center text-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-white border border-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Small round avatar */}
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-b from-[#f0e6d8] to-[#e5d7c0] ring-2 ring-[#e09225]/20 flex-shrink-0">
                      {player.round_image ? (
                        <img
                          src={player.round_image}
                          alt={player.name}
                          className="w-full h-full object-contain"
                        />
                      ) : player.vertical_image ? (
                        <img
                          src={player.vertical_image}
                          alt={player.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-sm font-bold text-black/20">
                            {player.number || idx + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name + number */}
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-black/35 uppercase tracking-[0.05em] font-medium truncate">
                        {player.position}
                      </p>
                      <p className="text-[10px] sm:text-xs font-bold text-black/80 truncate leading-tight">
                        {player.name}
                      </p>
                      {player.number && (
                        <p className="text-[8px] sm:text-[10px] text-black/30">
                          #{player.number}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subs — simple horizontal scrollable strip */}
              {subs.length > 0 && (
                <div className="mt-6 pt-5 border-t border-black/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={12} className="text-black/30" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-black/30 font-medium">
                      Substitutes ({subs.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {subs.map((player: any) => (
                      <div
                        key={player._id.toString()}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white border border-black/5 hover:shadow-sm transition-shadow"
                      >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-gradient-to-b from-[#f0e6d8] to-[#e5d7c0] flex-shrink-0">
                          {player.round_image ? (
                            <img
                              src={player.round_image}
                              alt={player.name}
                              className="w-full h-full object-contain"
                            />
                          ) : player.vertical_image ? (
                            <img
                              src={player.vertical_image}
                              alt={player.name}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {player.number && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-black/40">
                              #{player.number}
                            </span>
                          )}
                          <span className="text-[10px] sm:text-xs font-medium text-black/70 truncate max-w-[80px] sm:max-w-[120px]">
                            {player.name}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-black/30 uppercase">
                            {player.position}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <PlayerRatingsPreview matchId={match._id.toString()} />
        </div>
      </div>
    </main>
  );
}
