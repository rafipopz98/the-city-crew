"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, Shirt } from "lucide-react";
import { PitchView } from "./lineup/PitchView";
import {
  getPreferredName,
  getRoundImage,
  RatingInfo,
  LineupPlayer,
} from "./lineup/shared";

const MatchLineup = ({
  matchId,
  startingXI,
  subs,
  formation,
}: {
  matchId: string;
  startingXI: LineupPlayer[];
  subs: LineupPlayer[];
  formation?: string;
}) => {
  const [ratings, setRatings] = useState<Record<string, RatingInfo>>({});
  const [loadingRatings, setLoadingRatings] = useState(true);

  const fetchRatings = useCallback(async () => {
    setLoadingRatings(true);
    try {
      const res = await fetch(`/api/player-ratings/${matchId}`);
      if (!res.ok) throw new Error("Failed to fetch ratings");
      const data = await res.json();
      const map: Record<string, RatingInfo> = {};
      (data.players || []).forEach((p: any) => {
        map[p._id] = {
          averageRating: p.averageRating,
          totalRatings: p.totalRatings,
        };
      });
      setRatings(map);
    } catch {
      // Ratings are progressive enhancement — fail silently
    } finally {
      setLoadingRatings(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-[#ece1cf] border border-black/5 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#e09225]/20 to-[#e09225]/10">
          <Shirt size={16} className="text-[#e09225]" />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-black/40 font-medium">
            City Lineup
          </h3>            <p className="text-[10px] text-black/25 mt-0.5">
              {formation || "—"} · {startingXI.length} starting · {subs.length} on bench
            </p>
        </div>
      </div>

      {/* Starting XI on the pitch */}
      <PitchView
        startingXI={startingXI}
        ratings={ratings}
        formation={formation}
      />

      {/* Subs */}
      {subs.length > 0 && (
        <div className="mt-6 pt-5 border-t border-black/5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={12} className="text-black/30" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-black/30 font-medium">
              Substitutes ({subs.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {subs.map((player) => {
              const rating = ratings[player._id.toString()];

              return (
                <div
                  key={player._id.toString()}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white border border-black/5 hover:shadow-sm transition-shadow"
                >
                  <div className="relative">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-gradient-to-b from-[#f0e6d8] to-[#e5d7c0] flex-shrink-0">
                      {(getRoundImage(player) || player.vertical_image) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getRoundImage(player) || player.vertical_image}
                          alt={player.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    {!loadingRatings && rating && rating.averageRating > 0 && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-[#e09225] shadow-sm whitespace-nowrap">
                        <span className="text-[7px] font-bold text-white">
                          {rating.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {player.number && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-black/40">
                        #{player.number}
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs font-medium text-black/70 truncate max-w-[80px] sm:max-w-[120px]">
                      {getPreferredName(player.name)}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-black/30 uppercase">
                      {player.position}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default MatchLineup;
