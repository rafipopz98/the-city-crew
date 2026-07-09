"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Goal } from "lucide-react";

type Match = {
  _id: string;
  homeTeam: {
    name: string;
    image: string;
  };
  awayTeam: {
    name: string;
    image: string;
  };
  homeTeamScore: number;
  awayTeamScore: number;
  matchDate: string;
  status: string;
  competition: string;
  venue?: string;
  matchday?: number;
  goalScorers?: Array<{
    playerName: string;
    minute: number;
    team: "home" | "away";
    isPenalty: boolean;
    isOwnGoal: boolean;
  }>;
};

type Props = {
  match: Match;
};

const MatchCard = ({ match }: Props) => {
  const matchDate = new Date(match.matchDate);

  const formattedDate = matchDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = matchDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isUpcoming = match.status === "upcoming";
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  // Format goal scorers for display
  const formatGoalScorers = () => {
    const goalScorers = match.goalScorers || [];
    if (goalScorers.length === 0) return null;

    const homeScorers = goalScorers.filter((g) => g.team === "home");
    const awayScorers = goalScorers.filter((g) => g.team === "away");

    const formatScorer = (scorer: any) => {
      let text = `${scorer.playerName} ${scorer.minute}'`;
      if (scorer.isPenalty) text += " (P)";
      if (scorer.isOwnGoal) text += " (OG)";
      return text;
    };

    const formatMultiple = (scorers: any[]) => {
      if (scorers.length === 0) return null;

      // Group by player name to combine minutes
      const grouped: Record<string, number[]> = {};
      scorers.forEach((s: any) => {
        if (!grouped[s.playerName]) grouped[s.playerName] = [];
        grouped[s.playerName].push(s.minute);
      });

      return Object.entries(grouped)
        .map(([name, minutes]) => {
          const minuteStr =
            minutes.length > 1 ? minutes.join("', ") + "'" : minutes[0] + "'";
          const penalty = scorers.some(
            (s: any) => s.playerName === name && s.isPenalty,
          );
          const og = scorers.some(
            (s: any) => s.playerName === name && s.isOwnGoal,
          );
          let text = `${name} ${minuteStr}`;
          if (penalty) text += " (P)";
          if (og) text += " (OG)";
          return text;
        })
        .join(", ");
    };

    const homeText = formatMultiple(homeScorers);
    const awayText = formatMultiple(awayScorers);

    if (!homeText && !awayText) return null;

    return (
      <div className="mt-4 space-y-1.5 text-xs border-t border-black/10 pt-4">
        {homeText && (
          <div className="flex items-center gap-2">
            <Goal size={14} className="text-green-600 shrink-0" />
            <span className="text-black/80 font-medium">{homeText}</span>
          </div>
        )}
        {awayText && (
          <div className="flex items-center gap-2">
            <Goal size={14} className="text-red-500 shrink-0" />
            <span className="text-black/60">{awayText}</span>
          </div>
        )}
      </div>
    );
  };

  const goalScorersDisplay = formatGoalScorers();

  return (
    <Link href={`/match-hub/${match._id}`}>
      <article
        className="
          group

          h-full

          border
          border-black/10

          p-8

          transition-all
          duration-300

          hover:border-[#e09225]
          hover:bg-white/20
        "
      >
        {/* Top */}

        <div className="flex items-start justify-between gap-6">
          <div>
            <p
              className="
                text-xs

                uppercase
                tracking-[0.35em]

                text-black/40
              "
            >
              {match.competition}
            </p>

            {match.matchday && (
              <p className="mt-2 text-sm text-black/40">
                Matchday {match.matchday}
              </p>
            )}
          </div>

          <span
            className={`
              text-xs
              uppercase
              tracking-[0.25em]
              ${
                isLive
                  ? "text-red-500 animate-pulse"
                  : isFinished
                    ? "text-green-600"
                    : "text-black/35"
              }
            `}
          >
            {isLive ? "Live" : isFinished ? "Full Time" : match.status}
          </span>
        </div>

        {/* Teams */}

        <div className="mt-10 space-y-7">
          {/* Home */}

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              <Image
                src={match.homeTeam.image}
                alt={match.homeTeam.name}
                width={54}
                height={54}
                className="shrink-0 object-contain"
              />

              <h2
                className="
                  para

                  text-3xl

                  uppercase

                  leading-none

                  wrap-break-word
                "
              >
                {match.homeTeam.name}
              </h2>
            </div>

            {(isFinished || isLive) && (
              <span
                className="
                  para

                  text-4xl

                  shrink-0
                "
              >
                {match.homeTeamScore}
              </span>
            )}
          </div>

          {/* Divider */}

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-black/10" />

            {isUpcoming ? (
              <span
                className="
                  text-xs

                  uppercase
                  tracking-[0.35em]

                  text-black/30
                "
              >
                VS
              </span>
            ) : (
              <span
                className="
                  text-black/25

                  text-sm

                  uppercase
                "
              >
                Score
              </span>
            )}

            <div className="h-px flex-1 bg-black/10" />
          </div>

          {/* Away */}

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              <Image
                src={match.awayTeam.image}
                alt={match.awayTeam.name}
                width={54}
                height={54}
                className="shrink-0 object-contain"
              />

              <h2
                className="
                  para

                  text-3xl

                  uppercase

                  leading-none

                  wrap-break-word
                "
              >
                {match.awayTeam.name}
              </h2>
            </div>

            {(isFinished || isLive) && (
              <span
                className="
                  para

                  text-4xl

                  shrink-0
                "
              >
                {match.awayTeamScore}
              </span>
            )}
          </div>
        </div>

        {/* Goal Scorers */}

        {goalScorersDisplay}

        {/* Bottom */}

        <div
          className="
            mt-6

            flex
            items-end
            justify-between

            border-t
            border-black/10

            pt-6
          "
        >
          <div>
            <p className="text-sm text-black/50">{formattedDate}</p>

            <p className="mt-1 text-black">{formattedTime}</p>

            {match.venue && (
              <p className="mt-2 text-sm text-black/40">{match.venue}</p>
            )}
          </div>

          <div
            className="
              flex
              items-center
              gap-2

              border-b
              border-black

              pb-1

              uppercase

              transition-all
              duration-300

              group-hover:border-[#e09225]
              group-hover:text-[#e09225]
            "
          >
            View
            <ArrowUpRight
              size={16}
              className="
                transition-transform
                duration-300

                group-hover:translate-x-1
                group-hover:-translate-y-1
              "
            />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default MatchCard;
