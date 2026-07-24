"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowUpRight, Users, Loader2 } from "lucide-react";

const DISPLAY_LIMIT = 10;

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

  // Always show the section, even when loading — we show skeleton
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: DISPLAY_LIMIT }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-xl sm:rounded-2xl bg-black/5" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-black/5" />
                <div className="h-2 w-1/2 rounded-full bg-black/5" />
              </div>
            </div>
          ))}
        </div>        ) : error ? (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {players.slice(0, DISPLAY_LIMIT).map((player, idx) => (
            <Link
              key={player._id}
              href={`/match-hub/${matchId}/ratings`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-black/5 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Player Image */}
              <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-b from-[#f0e6d8] to-[#e5d7c0]">
                {player.vertical_image ? (
                  <Image
                    src={player.vertical_image}
                    alt={player.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-5xl sm:text-6xl font-black text-black/10">
                      {player.number || "?"}
                    </span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Number badge */}
                <div className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="text-[10px] sm:text-xs font-bold text-black/70">
                    {player.number || "-"}
                  </span>
                </div>

                {/* Rating badge */}
                {player.averageRating > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[#e09225]/90 backdrop-blur-sm">
                    <Star size={10} className="fill-white text-white" />
                    <span className="text-[10px] sm:text-xs font-bold text-white">
                      {player.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-black/35 uppercase tracking-[0.1em] font-medium truncate">
                  {player.position}
                </p>
                <h3 className="text-xs sm:text-sm font-bold text-black/80 mt-0.5 truncate group-hover:text-[#e09225] transition-colors">
                  {player.name}
                </h3>
                {player.totalRatings > 0 && (
                  <p className="text-[10px] sm:text-xs text-black/25 mt-1.5 flex items-center gap-1">
                    <Users size={10} />
                    {player.totalRatings} rating{player.totalRatings !== 1 ? "s" : ""}
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
