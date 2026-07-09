"use client";
import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { Goal, ChevronRight } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MatchesSection = () => {
  const [open, setOpen] = useState<"results" | "fixtures" | null>(null);

  // Fetch latest results (finished matches, most recent first)
  const {
    data: resultsData,
    error: resultsError,
    isLoading: resultsLoading,
  } = useSWR("/api/matches?latest=results&limit=3", fetcher);

  // Fetch upcoming fixtures (upcoming matches, soonest first)
  const {
    data: fixturesData,
    error: fixturesError,
    isLoading: fixturesLoading,
  } = useSWR("/api/matches?latest=fixtures&limit=3", fetcher);

  const recentResults = resultsData?.matches || [];
  const upcomingFixtures = fixturesData?.matches || [];

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const day = d.toLocaleDateString("en-GB", { weekday: "long" });
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} — ${time}`;
  };

  // Format goal scorers for display
  const formatGoalScorers = (goalScorers: any[]) => {
    if (!goalScorers || goalScorers.length === 0) return null;

    const homeScorers = goalScorers.filter((g: any) => g.team === "home");
    const awayScorers = goalScorers.filter((g: any) => g.team === "away");

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
      <div className="space-y-1 text-xs">
        {homeText && (
          <div className="flex items-center gap-1.5">
            <Goal size={12} className="text-green-600 shrink-0" />
            <span className="text-black/70 font-medium">{homeText}</span>
          </div>
        )}
        {awayText && (
          <div className="flex items-center gap-1.5">
            <Goal size={12} className="text-red-500 shrink-0" />
            <span className="text-black/50">{awayText}</span>
          </div>
        )}
      </div>
    );
  };

  const isLoading = resultsLoading || fixturesLoading;

  if (isLoading) {
    return (
      <div className="w-full bg-[#06182e] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-[#ece1cf]/10 rounded w-64 mx-auto"></div>
            <div className="h-16 bg-[#ece1cf]/10 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#06182e] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ===================== */}
        {/* 🔥 LATEST RESULTS ROW */}
        {/* ===================== */}
        <div
          onClick={() => setOpen(open === "results" ? null : "results")}
          className="w-full border-t border-b border-[#ece1cf]/10 py-6 flex justify-between items-center cursor-pointer group"
        >
          <h2 className="text-[8vw] sm:text-[5vw] lg:text-[3rem] font-extrabold uppercase text-[#ece1cf] group-hover:text-[#ece1cf] transition-all">
            Latest Results
          </h2>
          <span
            className={`text-3xl text-[#ece1cf] transition-all duration-300 ${
              open === "results" ? "rotate-90 text-[#ece1cf]" : ""
            }`}
          >
            →
          </span>
        </div>

        {/* 🔽 RESULTS CONTENT */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            open === "results" ? "max-h-200 py-8" : "max-h-0"
          }`}
        >
          {recentResults.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3 pb-4">
              {recentResults.map((match: any) => (
                <Link
                  key={match._id}
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
                      FT
                    </span>
                  </div>

                  {/* Score */}
                  <h3 className="text-5xl font-extrabold my-6 tabular-nums">
                    {match.homeTeamScore} : {match.awayTeamScore}
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
                      <p className="text-sm font-semibold">
                        {match.homeTeam.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Image
                        src={match.awayTeam.image}
                        alt={match.awayTeam.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                      <p className="text-sm text-black/50">
                        {match.awayTeam.name}
                      </p>
                    </div>
                  </div>

                  {/* Goal Scorers */}
                  {formatGoalScorers(match.goalScorers)}

                  {/* Meta */}
                  <div className="mt-4 text-xs text-black/40">
                    <p>{formatDate(match.matchDate)}</p>
                    {match.venue && <p>{match.venue}</p>}
                    {match.matchday && (
                      <p className="mt-1">Matchday {match.matchday}</p>
                    )}
                  </div>

                  {/* View Match Button - Now the whole card is clickable, but keep this for visual */}
                  <div className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4 transition-all group-hover:bg-black group-hover:text-white">
                    <span>VIEW MATCH</span>
                    <span className="text-[#e09225] group-hover:text-[#e09225] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#ece1cf]/40 text-sm uppercase tracking-wider">
                No recent results
              </p>
            </div>
          )}
        </div>

        {/* ===================== */}
        {/* 🔥 FIXTURES ROW */}
        {/* ===================== */}
        <div
          onClick={() => setOpen(open === "fixtures" ? null : "fixtures")}
          className="w-full border-b border-[#ece1cf]/10 py-6 flex justify-between items-center cursor-pointer group"
        >
          <h2 className="text-[8vw] sm:text-[5vw] lg:text-[3rem] font-extrabold uppercase text-[#ece1cf] group-hover:text-[#ece1cf] transition-all">
            Upcoming Fixtures
          </h2>
          <span
            className={`text-3xl text-[#ece1cf] transition-all duration-300 ${
              open === "fixtures" ? "rotate-90 text-[#ece1cf]" : ""
            }`}
          >
            →
          </span>
        </div>

        {/* 🔽 FIXTURES CONTENT */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            open === "fixtures" ? "max-h-200 py-8" : "max-h-0"
          }`}
        >
          {upcomingFixtures.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3 pb-4">
              {upcomingFixtures.map((match: any) => (
                <Link
                  key={match._id}
                  href={`/match-hub/${match._id}`}
                  className="min-w-75 lg:min-w-0 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between shrink-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                >
                  {/* Competition & PL Logo */}
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
                    {match.matchday && (
                      <p className="mt-1">Matchday {match.matchday}</p>
                    )}
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
                      <p className="text-sm font-semibold">
                        {match.homeTeam.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Image
                        src={match.awayTeam.image}
                        alt={match.awayTeam.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                      <p className="text-sm text-black/50">
                        {match.awayTeam.name}
                      </p>
                    </div>
                  </div>

                  {/* Goal Scorers - Show for fixtures too (if any) */}
                  {formatGoalScorers(match.goalScorers)}

                  {/* View Details Button */}
                  <div className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4 transition-all group-hover:bg-black group-hover:text-white">
                    <span>VIEW DETAILS</span>
                    <span className="text-[#e09225] group-hover:text-[#e09225] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#ece1cf]/40 text-sm uppercase tracking-wider">
                No upcoming fixtures
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchesSection;
