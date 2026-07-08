"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const HeroSection = () => {
  const { data: blogData } = useSWR("/api/blogs/home", fetcher);
  const { data: landingData } = useSWR("/api/landing", fetcher);

  const blog = blogData?.data;
  const latestMatch = landingData?.latestMatch;
  const topScorers = landingData?.topScorers || [];
  const topAssisters = landingData?.topAssisters || [];

  const formatMatchDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const getGoalScorers = (match: any) => {
    // This would need actual goal scorer data from your match model
    // For now, we'll show match stats if available
    if (!match) return "";
    if (match.status === "upcoming") {
      return formatMatchDate(match.matchDate);
    }
    return match.homeTeamScore + " - " + match.awayTeamScore;
  };

  return (
    <section className="w-full bg-[#06182e] pt-20 sm:pt-28 px-4" data-scroll>
      {/* SEO only */}
      <div className="sr-only">
        <h2>Manchester City News and Fan Community</h2>
        <p>
          The City Crew brings you the latest Manchester City news, matchday
          coverage, blogs, player statistics, polls, and everything happening
          around Manchester City Football Club.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured Story */}
        <div className="lg:col-span-2 relative w-full h-[60vh] xs:h-[60vh] sm:h-[40vh] md:h-[40vh] lg:h-[56vh] rounded-xl overflow-hidden">
          {blog?.thumbnail && (
            <Image
              src={blog.thumbnail}
              alt={blog.title || "Featured Manchester City article"}
              fill
              priority
              sizes="(max-width:768px) 100vw, (max-width:1200px) 66vw, 66vw"
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-[#06182e] via-[#06182e]/70 to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 lg:p-10">
            <h1 className="uppercase text-[6vw] sm:text-[4vw] lg:text-[3rem] leading-[0.9] font-bold text-white">
              {blog?.title}
            </h1>

            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                href="/match-hub"
                className="bg-[#e09225] text-black font-bold px-4 sm:px-5 py-2 rounded-[5px] uppercase text-xs sm:text-sm transition-colors hover:bg-[#f2a63b]"
              >
                Match Hub
              </Link>

              {blog?.slug && (
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="border border-[#ece1cf]/30 text-[#ece1cf] px-4 sm:px-5 py-2 rounded-[5px] uppercase text-xs sm:text-sm hover:bg-[#e09225] hover:text-black transition-all inline-flex items-center justify-center"
                >
                  Read Full Story
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Latest Match Card */}
          {latestMatch && (
            <div className="bg-[#0a223f] p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-[#ece1cf]/50 uppercase tracking-wider">
                  {latestMatch.competition}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    latestMatch.status === "finished"
                      ? "bg-green-500/20 text-green-400"
                      : latestMatch.status === "live"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {latestMatch.status === "finished"
                    ? "FT"
                    : latestMatch.status === "live"
                      ? "LIVE"
                      : formatMatchDate(latestMatch.matchDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 w-1/3">
                  <Image
                    src={latestMatch.homeTeam.image}
                    alt={latestMatch.homeTeam.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <p className="text-[10px] sm:text-xs text-[#ece1cf]/80 text-center leading-tight">
                    {latestMatch.homeTeam.name}
                  </p>
                </div>

                {/* Score */}
                <div className="text-center w-1/3">
                  {latestMatch.status === "upcoming" ? (
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#ece1cf]">VS</p>
                      <p className="text-[10px] text-[#ece1cf]/50 mt-1">
                        {formatMatchDate(latestMatch.matchDate)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-[#ece1cf] tracking-widest">
                      {latestMatch.homeTeamScore} : {latestMatch.awayTeamScore}
                    </p>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 w-1/3">
                  <Image
                    src={latestMatch.awayTeam.image}
                    alt={latestMatch.awayTeam.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <p className="text-[10px] sm:text-xs text-[#ece1cf]/80 text-center leading-tight">
                    {latestMatch.awayTeam.name}
                  </p>
                </div>
              </div>

              {latestMatch.matchday && (
                <p className="text-center text-[10px] text-[#ece1cf]/40 mt-3 uppercase">
                  Matchday {latestMatch.matchday}
                  {latestMatch.venue && ` • ${latestMatch.venue}`}
                </p>
              )}
            </div>
          )}

          {/* Top Scorers */}
          <div className="bg-[#0a223f] p-4 rounded-xl">
            <h3 className="text-[#ece1cf] uppercase text-xs mb-3 tracking-wider">
              Top Scorers
            </h3>

            {topScorers.length > 0 ? (
              topScorers.map((player: any, index: number) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between text-[#ece1cf] py-2 border-b border-white/5 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#ece1cf]/30 w-4">
                      {index + 1}
                    </span>
                    {player.round_image && (
                      <Image
                        src={player.round_image}
                        alt={player.name}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <span className="text-[#e09225] font-bold text-sm">
                    {player.goals}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[#ece1cf]/30 text-xs text-center py-3">
                No goals yet this season
              </p>
            )}
          </div>

          {/* Top Assists */}
          <div className="bg-[#0a223f] p-4 rounded-xl">
            <h3 className="text-[#ece1cf] uppercase text-xs mb-3 tracking-wider">
              Top Assists
            </h3>

            {topAssisters.length > 0 ? (
              topAssisters.map((player: any, index: number) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between text-[#ece1cf] py-2 border-b border-white/5 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#ece1cf]/30 w-4">
                      {index + 1}
                    </span>
                    {player.round_image && (
                      <Image
                        src={player.round_image}
                        alt={player.name}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <span className="text-[#e09225] font-bold text-sm">
                    {player.assists}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[#ece1cf]/30 text-xs text-center py-3">
                No assists yet this season
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
