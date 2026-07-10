import Image from "next/image";
import { Calendar, MapPin, Trophy, Swords } from "lucide-react";
import { STATUS_STYLES, STATUS_LABELS } from "@/constants/hero";
import { Match, Team } from "./types-hero";
import { formatMatchDate } from "@/lib/hero";

interface MatchCardProps {
  match: Match;
}

const MatchStatus = ({
  status,
  date,
}: {
  status: Match["status"];
  date: string;
}) => (
  <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLES[status]}`}>
    {status === "upcoming" ? formatMatchDate(date) : STATUS_LABELS[status]}
  </span>
);

const TeamDisplay = ({ team }: { team: Team }) => (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <Image
      src={team.image}
      alt={team.name}
      width={40}
      height={40}
      className="object-contain"
      loading="lazy"
    />
    <p className="text-[10px] sm:text-xs text-[#ece1cf]/80 text-center leading-tight line-clamp-2">
      {team.name}
    </p>
  </div>
);

const ScoreDisplay = ({ match }: { match: Match }) => {
  if (match.status === "upcoming") {
    return (
      <div className="text-center w-1/3">
        <Swords className="w-8 h-8 text-[#e09225] mx-auto mb-1" />
        <p className="text-[10px] text-[#ece1cf]/50">
          {formatMatchDate(match.matchDate)}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center w-1/3">
      <p className="text-2xl sm:text-3xl font-bold text-[#ece1cf] tracking-widest">
        {match.homeTeamScore ?? 0} : {match.awayTeamScore ?? 0}
      </p>
    </div>
  );
};

export const MatchCard = ({ match }: MatchCardProps) => (
  <div className="bg-[#0a223f] p-5 rounded-xl hover:bg-[#0c2546] transition-colors">
    <div className="flex justify-between items-center mb-4">
      <span className="text-xs text-[#ece1cf]/50 uppercase tracking-wider flex items-center gap-1">
        <Trophy className="w-3 h-3" />
        {match.competition}
      </span>
      <MatchStatus status={match.status} date={match.matchDate} />
    </div>

    <div className="flex items-center justify-between">
      <TeamDisplay team={match.homeTeam} />
      <ScoreDisplay match={match} />
      <TeamDisplay team={match.awayTeam} />
    </div>

    {(match.matchday || match.venue) && (
      <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[#ece1cf]/40 uppercase">
        {match.matchday && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Matchday {match.matchday}
          </span>
        )}
        {match.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.venue}
          </span>
        )}
      </div>
    )}
  </div>
);
