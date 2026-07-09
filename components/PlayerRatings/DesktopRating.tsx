"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import RatingStars from "./RatingStars";
import RatingProgress from "./RatingProgress";

type Player = {
  _id: string;
  name: string;
  position: string;
  country: string;
  vertical_image: string;
  number: string;
  userRating: number | null;
  averageRating: number;
  totalRatings: number;
};

type Props = {
  players: Player[];
  match: any;
  onRatingSubmit: (playerId: string, rating: number) => void;
};

export default function DesktopRating({
  players,
  match,
  onRatingSubmit,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const currentPlayer = players[selectedIndex];

  // Check if user already rated this player
  const handlePlayerSelect = (index: number) => {
    setSelectedIndex(index);
    const player = players[index];
    if (player.userRating) {
      setSelectedRating(player.userRating);
      setHasVoted(true);
    } else {
      setSelectedRating(null);
      setHasVoted(false);
    }
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    setHasVoted(true);
    onRatingSubmit(currentPlayer._id, rating);
  };

  const nextPlayer = () => {
    if (selectedIndex < players.length - 1) {
      handlePlayerSelect(selectedIndex + 1);
    }
  };

  const prevPlayer = () => {
    if (selectedIndex > 0) {
      handlePlayerSelect(selectedIndex - 1);
    }
  };

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center">
        <p className="text-xl text-gray-600">No players in lineup</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5E5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/match-hub/${match._id}`}>
              <ArrowLeft className="text-black/60 hover:text-black transition" />
            </Link>
            <div>
              <h1 className="para text-3xl uppercase">Rate Players</h1>
              <p className="text-sm text-black/50">
                {match.homeTeam?.name} vs {match.awayTeam?.name}
              </p>
            </div>
          </div>
          <div className="text-sm text-black/40">
            {selectedIndex + 1} of {players.length}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Player Carousel */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {players.map((player, index) => (
                <button
                  key={player._id}
                  onClick={() => handlePlayerSelect(index)}
                  className={`
                    relative aspect-3/4 rounded-2xl overflow-hidden border-4 transition-all
                    ${
                      selectedIndex === index
                        ? "border-[#e09225] shadow-lg scale-105"
                        : "border-transparent hover:border-[#e09225]/50"
                    }
                  `}
                >
                  {player.vertical_image ? (
                    <Image
                      src={player.vertical_image}
                      alt={player.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ece1cf] flex items-center justify-center">
                      <span className="text-4xl font-bold text-black/20">
                        {player.number || "?"}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-bold truncate">
                      {player.name}
                    </p>
                    <p className="text-white/60 text-xs">
                      {player.position} • #{player.number}
                    </p>
                  </div>
                  {player.userRating && (
                    <div className="absolute top-2 right-2 bg-[#e09225] text-white text-xs font-bold px-2 py-1 rounded-full">
                      {player.userRating}★
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Player Detail */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 border border-black/10 bg-[#ece1cf] p-5">
              {/* Image — fixed height instead of full aspect ratio, saves a lot of vertical space */}
              <div className="relative h-56 overflow-hidden bg-[#e5d7c0] rounded-lg">
                {currentPlayer.vertical_image ? (
                  <Image
                    src={currentPlayer.vertical_image}
                    alt={currentPlayer.name}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="para text-6xl text-black/15">
                      {currentPlayer.number || "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* Player */}
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-black/35">
                  {currentPlayer.position} • {currentPlayer.country}
                </p>
                <h2 className="para mt-2 text-3xl uppercase leading-none">
                  {currentPlayer.name}
                </h2>
                <p className="mt-2 text-sm text-black/35">
                  Shirt #{currentPlayer.number}
                </p>
              </div>

              {/* Community */}
              {currentPlayer.totalRatings > 0 && (
                <div className="mt-5 border-y border-black/10 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-black/35">
                      Community
                    </p>
                    <p className="text-sm text-black/35">
                      {currentPlayer.totalRatings} supporters
                    </p>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="para text-4xl">
                      {currentPlayer.averageRating.toFixed(1)}
                    </span>
                    <span className="pb-1 text-sm text-black/35">/ 5</span>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.35em] text-black/35">
                  Your Rating
                </p>
                <div className="mt-3 flex justify-center">
                  <RatingStars
                    rating={selectedRating || 0}
                    onRatingSelect={handleRatingSelect}
                    disabled={hasVoted}
                    size="large"
                    surface="light"
                  />
                </div>
                {!hasVoted ? (
                  <p className="mt-3 text-center text-sm text-black/40">
                    Tap a star to rate this performance.
                  </p>
                ) : (
                  <p className="mt-3 text-center text-sm text-[#e09225]">
                    Rating submitted ✓
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-5 border-t border-black/10 pt-4">
                <RatingProgress
                  current={selectedIndex + 1}
                  total={players.length}
                />
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={prevPlayer}
                    disabled={selectedIndex === 0}
                    className="border-b border-black pb-1 uppercase disabled:opacity-20 transition hover:text-[#e09225] hover:border-[#e09225]"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextPlayer}
                    disabled={selectedIndex === players.length - 1}
                    className="border-b border-black pb-1 uppercase disabled:opacity-20 transition hover:text-[#e09225] hover:border-[#e09225]"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
