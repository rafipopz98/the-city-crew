"use client";
import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MatchesSection = () => {
  const [open, setOpen] = useState<"results" | "fixtures" | null>(null);
  const { data, error, isLoading } = useSWR(
    "/api/admin/matches?limit=6",
    fetcher,
  );

  const matches = data?.matches || [];

  // Separate finished and upcoming matches
  const recentResults = matches
    .filter((match: any) => match.status === "finished")
    .sort(
      (a: any, b: any) =>
        new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime(),
    )
    .slice(0, 3);

  const upcomingFixtures = matches
    .filter((match: any) => match.status === "upcoming")
    .sort(
      (a: any, b: any) =>
        new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
    )
    .slice(0, 3);

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
                <div
                  key={match._id}
                  className="min-w-75 lg:min-w-0 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between shrink-0"
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

                  {/* Meta */}
                  <div className="mt-4 text-xs text-black/40">
                    <p>{formatDate(match.matchDate)}</p>
                    {match.venue && <p>{match.venue}</p>}
                    {match.matchday && (
                      <p className="mt-1">Matchday {match.matchday}</p>
                    )}
                  </div>

                  {/* View Match Button */}
                  <Link
                    href={`/match-hub`}
                    className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4 hover:bg-black hover:text-white transition-all group/btn"
                  >
                    <span>VIEW MATCH</span>
                    <span className="text-[#e09225] group-hover/btn:text-[#e09225] group-hover/btn:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                </div>
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
                <div
                  key={match._id}
                  className="min-w-75 lg:min-w-0 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between shrink-0"
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

                  {/* Buy Tickets Button */}
                  <Link
                    href={`/match-hub`}
                    className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4 hover:bg-black hover:text-white transition-all group/btn"
                  >
                    <span>VIEW DETAILS</span>
                    <span className="text-[#e09225] group-hover/btn:text-[#e09225] group-hover/btn:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                </div>
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
