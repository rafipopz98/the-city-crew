"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowUpRight, Users } from "lucide-react";
import { playerImages } from "@/public/players-image";

const DISPLAY_LIMIT = 12;

type Player = {
  _id: string;
  name: string;
  position: string;
  vertical_image: string;
  number: string;
  averageRating: number;
  totalRatings: number;
};

type Props = {
  matchId: string;
};

const getPreferredName = (name: string): string => {
  const found = playerImages.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  return found?.prefferedName || name;
};

const PlayerRatingsPreview = ({ matchId }: Props) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/player-ratings/${matchId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlayers(data.players || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return (
    <section>
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black/35 font-medium">
            Community
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black/90 mt-2 sm:mt-3 leading-tight">
            Player Ratings
          </h2>
          {!loading && !error && (
            <p className="text-xs sm:text-sm text-black/30 mt-1.5">
              Rate the performance of each player
            </p>
          )}
        </div>
        <Link
          href={`/match-hub/${matchId}/ratings`}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-black/60 hover:text-[#e09225] transition-colors pb-1 border-b border-black/20 hover:border-[#e09225] self-start sm:self-auto"
        >
          Rate Players
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex overflow-x-auto pb-2 gap-4 sm:gap-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: DISPLAY_LIMIT }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 animate-pulse shrink-0 snap-start"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/5" />
              <div className="h-2.5 w-14 rounded-full bg-black/5" />
              <div className="h-2 w-9 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-black/5 border border-black/10 p-8 sm:p-10 text-center">
          <Users size={32} className="mx-auto text-black/20 mb-3" />
          <p className="text-sm text-black/40">
            Unable to load player ratings right now.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={fetchRatings}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#e09225] hover:underline"
            >
              Try again
            </button>
            <Link
              href={`/match-hub/${matchId}/ratings`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-black/40 hover:underline"
            >
              Go to ratings <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-2xl bg-black/5 border border-black/10 p-8 sm:p-10 text-center">
          <Users size={32} className="mx-auto text-black/20 mb-3" />
          <p className="text-sm text-black/40">
            No ratings available yet. Be the first to rate!
          </p>
          <Link
            href={`/match-hub/${matchId}/ratings`}
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#e09225] hover:underline"
          >
            Rate players <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-2 gap-4 sm:gap-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {players.map((player) => (
            <Link
              key={player._id}
              href={`/match-hub/${matchId}/ratings`}
              className="group flex flex-col items-center gap-2 w-16 sm:w-20 shrink-0 snap-start"
            >
              {/* Face avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-b from-[#f0e6d8] to-[#e5d7c0] border-2 border-white shadow-md ring-1 ring-black/5 group-hover:ring-[#e09225]/50 transition-all duration-300 group-hover:-translate-y-1">
                {player.vertical_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={player.vertical_image}
                    alt={player.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl font-black text-black/10">
                      {player.number || "?"}
                    </span>
                  </div>
                )}

                {/* Rating badge */}
                {player.averageRating > 0 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e09225] shadow-sm">
                    <Star size={10} className="fill-white text-white" />
                    <span className="text-[10px] font-bold text-white">
                      {player.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-center min-w-0 w-full">
                <p className="text-[9px] text-black/35 uppercase tracking-[0.1em] font-medium truncate">
                  {player.position}
                </p>
                <h3 className="text-[11px] sm:text-xs font-bold text-black/80 truncate group-hover:text-[#e09225] transition-colors">
                  {getPreferredName(player.name)}
                </h3>
                {player.totalRatings > 0 && (
                  <p className="text-[9px] sm:text-[10px] text-black/25 mt-0.5 flex items-center justify-center gap-1">
                    <Users size={9} />
                    {player.totalRatings}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlayerRatingsPreview;
