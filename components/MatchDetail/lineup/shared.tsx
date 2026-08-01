"use client";

import { Star } from "lucide-react";
import { playerImages } from "@/public/players-image";

export type LineupPlayer = {
  _id: string;
  name: string;
  position?: string;
  vertical_image?: string;
  round_image?: string;
  number?: string | number;
};

export type RatingInfo = {
  averageRating: number;
  totalRatings: number;
};

// Position → line grouping used by the pitch and grouped views
const POSITION_LINES: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
  GK: "GK",
  CB: "DEF",
  LB: "DEF",
  RB: "DEF",
  LWB: "DEF",
  RWB: "DEF",
  SW: "DEF",
  CM: "MID",
  CDM: "MID",
  CAM: "MID",
  LM: "MID",
  RM: "MID",
  DM: "MID",
  AM: "MID",
  ST: "FWD",
  CF: "FWD",
  LW: "FWD",
  RW: "FWD",
  LF: "FWD",
  RF: "FWD",
  SS: "FWD",
};

export const getLine = (
  position?: string,
): "GK" | "DEF" | "MID" | "FWD" =>
  POSITION_LINES[(position || "").toUpperCase()] || "MID";

// Preferred short name from playerImages (e.g. "Bettinelli"), falls back to full name
export const getPreferredName = (name: string): string => {
  const found = playerImages.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  return found?.prefferedName || name;
};

export const getRoundImage = (player: LineupPlayer): string | undefined => {
  const found = playerImages.find(
    (p) => p.name.toLowerCase() === player.name.toLowerCase(),
  );
  return found?.roundImage || player.round_image;
};

export const RatingBadge = ({ rating }: { rating: number }) => (
  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#e09225] shadow-sm whitespace-nowrap">
    <Star size={8} className="fill-white text-white" />
    <span className="text-[8px] font-bold text-white">{rating.toFixed(1)}</span>
  </div>
);

export const PlayerAvatar = ({
  player,
  rating,
  className = "",
}: {
  player: LineupPlayer;
  rating?: number;
  className?: string;
}) => {
  const img = getRoundImage(player) || player.vertical_image;

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gradient-to-b from-[#f0e6d8] to-[#e5d7c0] ring-2 ring-[#e09225]/20 flex-shrink-0 ${className}`}
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={player.name}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-bold text-black/20">
            {player.number || "?"}
          </span>
        </div>
      )}
      {rating && rating > 0 && <RatingBadge rating={rating} />}
    </div>
  );
};
