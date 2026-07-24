"use client";

import { motion } from "framer-motion";

type Props = {
  competition: string;
  season?: string;
  homeTeam: { name: string; image: string };
  awayTeam: { name: string; image: string };
  homeScore: number;
  awayScore: number;
  status: string;
};

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  live: { label: "LIVE", color: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" },
  finished: { label: "Full Time", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  postponed: { label: "Postponed", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

const MatchHero = ({
  competition,
  season,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
}: Props) => {
  const isUpcoming = status === "upcoming";
  const isLive = status === "live";
  const isFinished = status === "finished";
  const statusCfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.upcoming;

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFF5E5] border border-black/5">

      <div className="relative px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16">
        {/* Competition bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 sm:mb-12">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black/40 font-medium">
              {competition}
            </span>
            {season && (
              <>
                <span className="text-black/20">•</span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black/30">
                  {season}
                </span>
              </>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] ${statusCfg.color}`}
          >
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
            {statusCfg.label}
          </span>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-16">
          {/* Home Team */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center gap-3 sm:gap-4 order-1 sm:order-1"
          >
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white border-2 border-[#06182e]/10 shadow-sm flex items-center justify-center p-2 sm:p-3">
                <img
                  src={homeTeam.image}
                  alt={homeTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#06182e]/90 text-center leading-tight max-w-[120px] sm:max-w-[160px]">
              {homeTeam.name}
            </h2>
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
                  className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none ${
                    isLive
                      ? "text-[#e09225]"
                      : isFinished
                        ? "text-[#06182e]"
                        : "text-[#06182e]/80"
                  }`}
                >
                  {homeScore}
                </span>
                <span className="text-lg sm:text-xl md:text-2xl text-[#06182e]/20 font-light">:</span>
                <span
                  className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none ${
                    isLive
                      ? "text-[#e09225]"
                      : isFinished
                        ? "text-[#06182e]"
                        : "text-[#06182e]/80"
                  }`}
                >
                  {awayScore}
                </span>
              </div>
            ) : (
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#06182e]/30 tracking-[0.15em]">
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white border-2 border-[#06182e]/10 shadow-sm flex items-center justify-center p-2 sm:p-3">
                <img
                  src={awayTeam.image}
                  alt={awayTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#06182e]/90 text-center leading-tight max-w-[120px] sm:max-w-[160px]">
              {awayTeam.name}
            </h2>
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
      </div>
    </section>
  );
};

export default MatchHero;
