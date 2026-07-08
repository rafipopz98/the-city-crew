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
    <article
      className="
      group

      border-b
      border-black/10

      py-8

      transition-all
      duration-300

      hover:border-[#e09225]
    "
    >
      <div
        className="
        flex
        flex-col
        gap-8

        xl:flex-row
        xl:items-center
      "
      >
        {/* Left */}

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-black/40">
            <span>{match.competition}</span>

            {match.matchday && (
              <>
                <span className="h-1 w-1 rounded-full bg-black/20" />
                <span>MD {match.matchday}</span>
              </>
            )}

            <>
              <span className="h-1 w-1 rounded-full bg-black/20" />
              <span>{match.status}</span>
            </>
          </div>

          {/* Teams */}

          <div className="mt-6 flex items-center gap-8">
            {/* Home */}

            <div className="flex flex-1 items-center justify-end gap-4">
              <h2 className="para text-3xl uppercase">{match.homeTeam.name}</h2>

              <Image
                src={match.homeTeam.image}
                alt={match.homeTeam.name}
                width={52}
                height={52}
              />
            </div>

            {/* Middle */}

            <div className="shrink-0">
              {match.status === "upcoming" ? (
                <h3 className="para text-2xl text-black/35">VS</h3>
              ) : (
                <h3 className="para text-4xl">
                  {match.homeTeamScore}–{match.awayTeamScore}
                </h3>
              )}
            </div>

            {/* Away */}

            <div className="flex flex-1 items-center gap-4">
              <Image
                src={match.awayTeam.image}
                alt={match.awayTeam.name}
                width={52}
                height={52}
              />

              <h2 className="para text-3xl uppercase">{match.awayTeam.name}</h2>
            </div>
          </div>

          {/* Meta */}

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-black/45">
            <div className="flex items-center gap-2">
              <Calendar size={15} />

              {formattedDate}
            </div>

            <div className="flex items-center gap-2">{formattedTime}</div>

            {match.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={15} />

                {match.venue}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}

        <div className="flex items-center gap-6">
          <button
            onClick={() => onEdit(match)}
            className="
            group/edit

            flex
            items-center
            gap-2

            border-b
            border-black

            pb-1

            uppercase

            transition

            hover:border-[#e09225]
            hover:text-[#e09225]
          "
          >
            Edit
            <Edit2
              size={16}
              className="
              transition

              group-hover/edit:rotate-12
            "
            />
          </button>

          <button
            onClick={() => onDelete(match._id)}
            className="
            text-black/35

            transition

            hover:text-red-500
          "
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default MatchRow;
