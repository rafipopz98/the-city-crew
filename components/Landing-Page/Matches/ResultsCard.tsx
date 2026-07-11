import Image from "next/image";
import Link from "next/link";
import { GoalScorers } from "./GoalScorers";
import { MATCH_STATUS, BUTTON_LABELS } from "@/constants/match";
import { Match } from "./type-matches";
import { formatDate } from "@/lib/match";

interface ResultsCardProps {
  match: Match;
}

export const ResultsCard = ({ match }: ResultsCardProps) => (
  <Link
    href={`/match-hub/${match._id}`}
    className="min-w-75 lg:min-w-0 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between shrink-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
  >
    {/* Competition & Status */}
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <Image
          src={match.homeTeam.image}
          alt={match.homeTeam.name}
          width={24}
          height={24}
          className="object-contain"
        />
        <span className="text-xs font-medium text-black/50 uppercase">
          {match.competition}
        </span>
      </div>
      <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
        {MATCH_STATUS.FINISHED}
      </span>
    </div>

    {/* Score */}
    <h3 className="text-5xl font-extrabold my-6 tabular-nums">
      {match.homeTeamScore ?? 0} : {match.awayTeamScore ?? 0}
    </h3>

    {/* Teams */}
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <Image
          src={match.homeTeam.image}
          alt={match.homeTeam.name}
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-sm font-semibold">{match.homeTeam.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <Image
          src={match.awayTeam.image}
          alt={match.awayTeam.name}
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-sm text-black/50">{match.awayTeam.name}</p>
      </div>
    </div>

    {/* Goal Scorers */}
    {match.goalScorers && <GoalScorers goalScorers={match.goalScorers} />}

    {/* Meta */}
    <div className="mt-4 text-xs text-black/40">
      <p>{formatDate(match.matchDate)}</p>
      {match.venue && <p>{match.venue}</p>}
      {match.matchday && <p className="mt-1">Matchday {match.matchday}</p>}
    </div>

    {/* View Button */}
    <div className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4 transition-all group-hover:bg-black group-hover:text-white">
      <span>{BUTTON_LABELS.VIEW_MATCH}</span>
      <span className="text-[#e09225] group-hover:text-[#e09225] group-hover:translate-x-1 transition-transform">
        →
      </span>
    </div>
  </Link>
);
