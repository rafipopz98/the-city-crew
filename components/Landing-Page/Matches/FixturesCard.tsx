import Image from "next/image";
import Link from "next/link";
import { GoalScorers } from "./GoalScorers";
import { BUTTON_LABELS } from "@/constants/match";
import { Match } from "./type-matches";
import { formatDate, formatTime } from "@/lib/match";

interface FixturesCardProps {
  match: Match;
}

export const FixturesCard = ({ match }: FixturesCardProps) => (
  <Link
    href={`/match-hub/${match._id}`}
    className="min-w-75 lg:min-w-0 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between shrink-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
  >
    {/* Competition & Teams */}
    <div className="flex justify-between items-start">
      <span className="text-xs font-medium text-black/50 uppercase">
        {match.competition}
      </span>
      <div className="flex -space-x-2">
        <Image
          src={match.homeTeam.image}
          alt={match.homeTeam.name}
          width={24}
          height={24}
          className="object-contain rounded-full border-2 border-[#ece1cf]"
        />
        <Image
          src={match.awayTeam.image}
          alt={match.awayTeam.name}
          width={24}
          height={24}
          className="object-contain rounded-full border-2 border-[#ece1cf]"
        />
      </div>
    </div>

    {/* Date & Time */}
    <div className="mt-4 text-xs text-black/70">
      <p>{formatTime(match.matchDate)}</p>
      {match.venue && <p>{match.venue}</p>}
      {match.matchday && <p className="mt-1">Matchday {match.matchday}</p>}
    </div>

    {/* Date Display */}
    <h3 className="text-5xl font-extrabold my-6">
      {formatDate(match.matchDate)}
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

    {/* View Button */}
    <div className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4 transition-all group-hover:bg-black group-hover:text-white">
      <span>{BUTTON_LABELS.VIEW_DETAILS}</span>
      <span className="text-[#e09225] group-hover:text-[#e09225] group-hover:translate-x-1 transition-transform">
        →
      </span>
    </div>
  </Link>
);
