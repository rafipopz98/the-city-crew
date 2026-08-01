"use client";

import { motion } from "framer-motion";
import PitchSvg from "@/components/BuildXI/PitchSvg";
import { generateCoords } from "@/constants/formation";
import {
  getLine,
  getPreferredName,
  PlayerAvatar,
  RatingInfo,
  LineupPlayer,
} from "./shared";

// Row Y positions (fallback when no formation is set on the match)
const LINE_Y: Record<"GK" | "DEF" | "MID" | "FWD", number> = {
  FWD: 20,
  MID: 42,
  DEF: 64,
  GK: 86,
};

export const PitchView = ({
  startingXI,
  ratings,
  formation,
}: {
  startingXI: LineupPlayer[];
  ratings: Record<string, RatingInfo>;
  formation?: string;
}) => {
  const coords =
    formation && formation !== "Free form" ? generateCoords(formation) : [];
  const useFormationCoords = coords.length === 11;

  const byLine = (line: "GK" | "DEF" | "MID" | "FWD") =>
    startingXI.filter((p) => getLine(p.position) === line);

  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[440px] mx-auto rounded-2xl overflow-hidden bg-[#06182e]">
      {/* Pitch background */}
      <div className="absolute inset-0">
        <PitchSvg />
      </div>

      {/* Players positioned on the pitch */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[3/3.4]">
        {useFormationCoords ? (
          // Formation-driven: each starting XI player maps to a formation slot
          startingXI.map((player, idx) => {
            const [left, top] = coords[idx] || [50, 50];
            const rating = ratings[player._id.toString()];

            return (
              <motion.div
                key={player._id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.04 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <PlayerAvatar
                  player={player}
                  rating={rating?.averageRating}
                  className="w-11 h-11 sm:w-13 sm:h-13"
                />
                <div className="text-center leading-tight">
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#ece1cf] max-w-[64px] truncate">
                    {getPreferredName(player.name)}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          // Fallback: group by position line when no formation is stored
          (["FWD", "MID", "DEF", "GK"] as const).map((line) => {
            const players = byLine(line);
            if (players.length === 0) return null;

            return players.map((player, idx) => {
              const rating = ratings[player._id.toString()];
              // Spread players horizontally within the line
              const left = (100 / (players.length + 1)) * (idx + 1);

              return (
                <motion.div
                  key={player._id.toString()}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.04 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
                  style={{ left: `${left}%`, top: `${LINE_Y[line]}%` }}
                >
                  <PlayerAvatar
                    player={player}
                    rating={rating?.averageRating}
                    className="w-11 h-11 sm:w-13 sm:h-13"
                  />
                  <div className="text-center leading-tight">
                    <p className="text-[9px] sm:text-[10px] font-bold text-[#ece1cf] max-w-[64px] truncate">
                      {getPreferredName(player.name)}
                    </p>
                  </div>
                </motion.div>
              );
            });
          })
        )}
      </div>
    </div>
  );
};
