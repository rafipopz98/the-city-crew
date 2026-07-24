"use client";

import { motion } from "framer-motion";
import { Goal, AlertTriangle, PenTool } from "lucide-react";

type GoalScorer = {
  playerName: string;
  minute: number;
  team: "home" | "away";
  isPenalty: boolean;
  isOwnGoal: boolean;
};

type Props = {
  goalScorers: GoalScorer[];
  homeTeamName: string;
  awayTeamName: string;
};

const MatchScorers = ({ goalScorers, homeTeamName, awayTeamName }: Props) => {
  if (!goalScorers || goalScorers.length === 0) return null;

  const sorted = [...goalScorers].sort((a, b) => a.minute - b.minute);

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-sm border border-black/5 p-6 sm:p-8 md:p-10">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
          <Goal size={18} className="text-green-500" />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-black/40 font-medium">
            Goal Scorers
          </h3>
          <p className="text-xs text-black/30 mt-0.5">
            {sorted.length} goal{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] sm:left-[22px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500/30 via-yellow-500/30 to-red-500/30 rounded-full" />

        <div className="space-y-4 sm:space-y-5">
          {sorted.map((scorer, index) => {
            const isHome = scorer.team === "home";
            const teamName = isHome ? homeTeamName : awayTeamName;

            return (
              <motion.div
                key={`${scorer.playerName}-${scorer.minute}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className="relative flex items-start gap-4 sm:gap-5 pl-12 sm:pl-14"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1.5 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 ${
                    isHome
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-bold tabular-nums ${
                      isHome ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {scorer.minute}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-bold text-sm sm:text-base text-black/80 truncate">
                      {scorer.playerName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-black/30 uppercase tracking-[0.1em]">
                      {teamName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {scorer.isPenalty && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle size={10} />
                        Penalty
                      </span>
                    )}
                    {scorer.isOwnGoal && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full font-medium">
                        <PenTool size={10} />
                        OG
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs text-black/25">
                      {scorer.minute}&apos;
                    </span>
                  </div>
                </div>

                {/* Badge */}
                <div
                  className={`shrink-0 self-start px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                    isHome
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {isHome ? "H" : "A"}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MatchScorers;
