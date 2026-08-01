"use client";

import { motion } from "framer-motion";
import { Calendar, Clock3, MapPin, Shirt } from "lucide-react";

type GoalScorer = {
  playerName: string;
  minute: number;
  team: "home" | "away";
  isPenalty: boolean;
  isOwnGoal: boolean;
};

type Props = {
  competition: string;
  season?: string;
  homeTeam: { name: string; image: string };
  awayTeam: { name: string; image: string };
  homeScore: number;
  awayScore: number;
  status: string;
  venue?: string;
  date?: string;
  time?: string;
  matchday?: number;
  goalScorers?: GoalScorer[];
};

const ScorerList = ({ scorers }: { scorers: GoalScorer[] }) => (
  <div className="flex flex-col items-center gap-0.5 text-center">
    {scorers.map((scorer, i) => (
      <p
        key={`${scorer.playerName}-${scorer.minute}-${i}`}
        className="text-[11px] sm:text-xs font-semibold text-black/60"
      >
        {scorer.playerName}{" "}
        <span className="text-black/35 tabular-nums">{scorer.minute}&apos;</span>
        {scorer.isPenalty && <span className="text-black/40"> (P)</span>}
        {scorer.isOwnGoal && <span className="text-black/40"> (OG)</span>}
      </p>
    ))}
  </div>
);

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    text: "text-blue-500",
  },
  live: {
    label: "LIVE",
    text: "text-red-500",
  },
  finished: {
    label: "Full Time",
    text: "text-emerald-600",
  },
  postponed: {
    label: "Postponed",
    text: "text-yellow-600",
  },
  cancelled: {
    label: "Cancelled",
    text: "text-gray-500",
  },
};

const MatchHero = ({
  competition,
  season,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  venue,
  date,
  time,
  matchday,
  goalScorers = [],
}: Props) => {
  const isUpcoming = status === "upcoming";
  const isLive = status === "live";
  const isFriendly = competition?.toLowerCase() === "friendly";
  const statusCfg =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.upcoming;

  const homeScorers = goalScorers
    .filter((s) => s.team === "home")
    .sort((a, b) => a.minute - b.minute);
  const awayScorers = goalScorers
    .filter((s) => s.team === "away")
    .sort((a, b) => a.minute - b.minute);

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#ece1cf] border border-black/5 shadow-xl shadow-black/5">
      <div className="relative px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-14">
        {/* Competition bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 sm:mb-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black/50 font-medium">
              {competition}
            </span>
            {season && (
              <>
                <span className="text-black/20">•</span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black/35">
                  {season}
                </span>
              </>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] ${statusCfg.text}`}
          >
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            )}
            {statusCfg.label}
          </span>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-6 md:gap-14">
          {/* Home Team */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center gap-3 sm:gap-4 order-1 sm:order-1"
          >
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white border border-black/10 flex items-center justify-center p-3 sm:p-4 shadow-lg">
                <img
                  src={homeTeam.image}
                  alt={homeTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-black/85 text-center leading-tight max-w-[130px] sm:max-w-[170px]">
              {homeTeam.name}
            </h2>

            {/* FotMob-style home scorers */}
            {homeScorers.length > 0 && <ScorerList scorers={homeScorers} />}
          </motion.div>

          {/* Score / VS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-4 sm:gap-6 order-2 sm:order-2"
          >
            {!isUpcoming ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  className={`text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black leading-none tracking-tighter ${
                    isLive ? "text-[#e09225]" : "text-[#06182e]"
                  }`}
                >
                  {homeScore}
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-black/60 leading-none -mt-1">
                  :
                </span>
                <span
                  className={`text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black leading-none tracking-tighter ${
                    isLive ? "text-[#e09225]" : "text-[#06182e]"
                  }`}
                >
                  {awayScore}
                </span>
              </div>
            ) : (
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-black/25 tracking-[0.15em]">
                VS
              </span>
            )}
          </motion.div>

          {/* Away Team */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center gap-3 sm:gap-4 order-3 sm:order-3"
          >
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white border border-black/10 flex items-center justify-center p-3 sm:p-4 shadow-lg">
                <img
                  src={awayTeam.image}
                  alt={awayTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-black/85 text-center leading-tight max-w-[130px] sm:max-w-[170px]">
              {awayTeam.name}
            </h2>

            {/* FotMob-style away scorers */}
            {awayScorers.length > 0 && <ScorerList scorers={awayScorers} />}
          </motion.div>
        </div>

        {/* Live indicator bar */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-red-500 uppercase tracking-[0.1em]">
                Match in Progress
              </span>
            </div>
          </motion.div>
        )}

        {/* Compact meta bar — integrated into the main card */}
        {(venue || date || time || (!isFriendly && matchday)) && (
          <div className="mt-8 sm:mt-10 pt-5 border-t border-black/10">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5">
              {venue && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-black/55">
                  <MapPin size={13} className="text-[#e09225]" />
                  <span>{venue}</span>
                </div>
              )}
              {date && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-black/55">
                  <Calendar size={13} className="text-[#e09225]" />
                  <span>{date}</span>
                </div>
              )}
              {time && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-black/55">
                  <Clock3 size={13} className="text-[#e09225]" />
                  <span>{time}</span>
                </div>
              )}
              {!isFriendly && matchday && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-black/55">
                  <Shirt size={13} className="text-[#e09225]" />
                  <span>Matchday {matchday}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MatchHero;
