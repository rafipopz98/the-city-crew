"use client";

import Image from "next/image";
import { Calendar, MapPin, Trophy, Edit2, Trash2 } from "lucide-react";

type MatchRowProps = {
  match: any;
  onEdit: (match: any) => void;
  onDelete: (matchId: string) => void;
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  live: "bg-red-100 text-red-800 animate-pulse",
  finished: "bg-green-100 text-green-800",
  postponed: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const MatchRow = ({ match, onEdit, onDelete }: MatchRowProps) => {
  const matchDate = new Date(match.matchDate);
  const formattedDate = matchDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = matchDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="
        group
        border-t
        border-black/10
        py-6
        first:border-t-0
        hover:bg-white/50
        transition-colors
      "
    >
      <div className="flex items-center justify-between gap-4">
        {/* Match Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Competition Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6CABDD]/10 text-[#6CABDD] text-xs font-medium">
              <Trophy size={12} />
              {match.competition}
            </span>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                statusColors[match.status] || statusColors.upcoming
              }`}
            >
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </span>

            {match.matchday && (
              <span className="text-xs text-black/40">MD {match.matchday}</span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center gap-6 mt-3">
            {/* Home Team */}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              <span className="text-base font-medium text-black truncate">
                {match.homeTeam.name}
              </span>
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src={match.homeTeam.image}
                  alt={match.homeTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Score */}
            <div className="shrink-0">
              {match.status === "upcoming" ? (
                <span className="text-lg font-bold text-black/30">vs</span>
              ) : (
                <span className="text-xl font-bold text-black tabular-nums">
                  {match.homeTeamScore} - {match.awayTeamScore}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src={match.awayTeam.image}
                  alt={match.awayTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-base font-medium text-black truncate">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Match Details */}
          <div className="flex items-center gap-4 mt-3 text-sm text-black/50">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
            {match.venue && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>{match.venue}</span>
              </div>
            )}
            {match.isHome && (
              <span className="text-xs text-[#6CABDD] font-medium">(H)</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(match)}
            className="
              p-2
              text-black/40
              hover:text-[#6CABDD]
              hover:bg-[#6CABDD]/10
              transition-colors
            "
            title="Edit match"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(match._id)}
            className="
              p-2
              text-black/40
              hover:text-red-600
              hover:bg-red-50
              transition-colors
            "
            title="Delete match"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchRow;
