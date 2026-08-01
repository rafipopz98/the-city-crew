"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { getRelativeDayLabel } from "@/lib/match";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Your standings data - you can replace with API later
const standings = [
  { pos: 1, team: "Manchester City", p: 38, w: 28, d: 6, l: 4, pts: 90 },
  { pos: 2, team: "Manchester United", p: 38, w: 27, d: 7, l: 4, pts: 88 },
  { pos: 3, team: "Aston Villa", p: 38, w: 25, d: 8, l: 5, pts: 83 },
  { pos: 4, team: "Arsenal", p: 38, w: 21, d: 8, l: 9, pts: 71 },
  { pos: 5, team: "Chelsea", p: 38, w: 27, d: 6, l: 12, pts: 66 },
  { pos: 6, team: "Liverpool", p: 38, w: 18, d: 9, l: 11, pts: 63 },
  { pos: 7, team: "Brentford", p: 38, w: 18, d: 6, l: 14, pts: 60 },
  { pos: 8, team: "Everton", p: 38, w: 18, d: 6, l: 14, pts: 60 },
];

const StandingsSection = () => {
  const { data } = useSWR("/api/matches?status=upcoming&limit=1", fetcher);

  const nextMatch = data?.matches?.[0];

  const nextMatchDayLabel = nextMatch
    ? getRelativeDayLabel(new Date(nextMatch.matchDate))
    : null;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

  const formatMatchInfo = (date: string) => {
    const d = new Date(date);
    const day = d.toLocaleDateString("en-GB", { weekday: "long" });
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      dayTime: `${day} — ${time}`,
      venue: "",
    };
  };

  return (
    <div className="w-full bg-[#06182e] py-16 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* TABLE */}
        <div className="lg:col-span-2 bg-[#0a223f] rounded-2xl p-4 sm:p-6 border border-[#ece1cf]/10 overflow-x-auto">
          <h2 className="text-[#ece1cf] text-sm font-semibold mb-4 sm:mb-6">
            STANDINGS
          </h2>

          {/* HEADER */}
          <div className="min-w-150 grid grid-cols-[40px_1fr_60px_60px_60px_60px_60px] text-[11px] sm:text-[12px] text-[#ece1cf]/60 pb-3 border-b border-[#ece1cf]/10">
            <span>#</span>
            <span>Team</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">D</span>
            <span className="text-center">L</span>
            <span className="text-center">PTS</span>
          </div>

          {/* ROWS */}
          <div className="mt-2 sm:mt-3 space-y-1 min-w-150">
            {standings.map((team, i) => (
              <div
                key={i}
                className={`grid grid-cols-[40px_1fr_60px_60px_60px_60px_60px] items-center text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 rounded-md transition-all ${
                  i === 0
                    ? "bg-[#e09225] text-black font-bold"
                    : "text-[#ece1cf] hover:bg-[#ece1cf]/5"
                }`}
              >
                <span>{team.pos}</span>
                <span className="font-medium truncate">{team.team}</span>
                <span className="text-center">{team.p}</span>
                <span className="text-center">{team.w}</span>
                <span className="text-center">{team.d}</span>
                <span className="text-center">{team.l}</span>
                <span className="text-center">{team.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEXT MATCH CARD */}
        <div className="bg-[#ece1cf] h-fit text-black rounded-2xl p-4 sm:p-6 flex flex-col justify-between">
          {nextMatch ? (
            <>
              {/* Competition & Teams Badges */}
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-black/50 uppercase">
                  {nextMatch.competition}
                </span>
                <div className="flex -space-x-2">
                  <Image
                    src={nextMatch.homeTeam.image}
                    alt={nextMatch.homeTeam.name}
                    width={28}
                    height={28}
                    className="object-contain rounded-full border-2 border-[#ece1cf]"
                  />
                  <Image
                    src={nextMatch.awayTeam.image}
                    alt={nextMatch.awayTeam.name}
                    width={28}
                    height={28}
                    className="object-contain rounded-full border-2 border-[#ece1cf]"
                  />
                </div>
              </div>

              {/* Date & Venue */}
              <div className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-black/70">
                <p>{formatMatchInfo(nextMatch.matchDate).dayTime}</p>
                {nextMatch.venue && <p>{nextMatch.venue}</p>}
                {nextMatch.competition?.toLowerCase() !== "friendly" &&
                  nextMatch.matchday && (
                    <p className="mt-1 opacity-50">
                      Matchday {nextMatch.matchday}
                    </p>
                  )}
              </div>

              {/* Date */}
              <h3 className="text-3xl sm:text-5xl font-extrabold my-4 sm:my-6">
                {nextMatchDayLabel ?? formatDate(nextMatch.matchDate)}
              </h3>

              {/* Teams */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Image
                    src={nextMatch.homeTeam.image}
                    alt={nextMatch.homeTeam.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <p className="text-xs sm:text-sm font-semibold">
                    {nextMatch.homeTeam.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Image
                    src={nextMatch.awayTeam.image}
                    alt={nextMatch.awayTeam.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <p className="text-xs sm:text-sm text-black/50">
                    {nextMatch.awayTeam.name}
                  </p>
                </div>
              </div>

              {/* View Match Link */}
              <Link
                href="/match-hub"
                className="mt-4 sm:mt-6 border border-black/30 rounded-full py-2 text-[10px] sm:text-xs flex justify-between px-4 items-center hover:bg-black hover:text-white transition-all group"
              >
                <span>MATCH DETAILS</span>
                <span className="text-[#e09225] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </>
          ) : (
            <>
              {/* Empty State */}
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-black/50 uppercase">
                  Premier League
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <p className="text-black/30 text-sm uppercase tracking-wider text-center">
                  No upcoming fixtures
                </p>
                <Link
                  href="/match-hub"
                  className="mt-4 text-xs text-[#e09225] hover:underline"
                >
                  View all matches →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingsSection;
