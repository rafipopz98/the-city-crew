"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import RatingStars from "./RatingStars";
import RatingProgress from "./RatingProgress";
const noImage = "/players-image/no-player-img-vertical.png";

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
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const currentPlayer = players[selectedIndex];

  // Auto-redirect after 3s when done
  useEffect(() => {
    if (!showDone) return;
    const timer = setTimeout(() => {
      router.push(`/match-hub/${match._id}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showDone, router, match._id]);

  // Check if user already rated this player
  const handlePlayerSelect = (index: number) => {
    setSelectedIndex(index);
    const player = players[index];
    setSelectedRating(player.userRating || null);
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    onRatingSubmit(currentPlayer._id, rating);
  };

  const nextPlayer = () => {
    if (selectedIndex < players.length - 1) {
      handlePlayerSelect(selectedIndex + 1);
    } else {
      setShowDone(true);
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
            <Link href={`/match-hub/${match?._id}`}>
              <ArrowLeft className="text-black/60 hover:text-black transition" />
            </Link>
            <div>
              <h1 className="para text-3xl uppercase">Rate Players</h1>
              <p className="text-sm text-black/50">
                {match?.homeTeam?.name} vs {match?.awayTeam?.name}
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
                      src={
                        failedImages[player._id]
                          ? noImage
                          : player.vertical_image
                      }
                      alt={player.name}
                      fill
                      className="object-cover"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [player._id]: true,
                        }))
                      }
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
                    src={
                      failedImages[currentPlayer._id]
                        ? noImage
                        : currentPlayer.vertical_image
                    }
                    alt={currentPlayer.name}
                    fill
                    className="object-cover object-top"
                    onError={() =>
                      setFailedImages((prev) => ({
                        ...prev,
                        [currentPlayer._id]: true,
                      }))
                    }
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
                    disabled={false}
                    size="large"
                    surface="light"
                  />
                </div>
                {selectedRating !== null ? (
                  <p className="mt-3 text-center text-sm text-[#e09225]">
                    {selectedRating}★ — Tap to change
                  </p>
                ) : (
                  <p className="mt-3 text-center text-sm text-black/40">
                    Tap a star to rate this performance.
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
                    className="border-b border-black pb-1 uppercase transition hover:text-[#e09225] hover:border-[#e09225]"
                  >
                    {selectedIndex === players.length - 1 ? "Done" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End-of-list toast */}
      {showDone && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4 pointer-events-none">
          <div className="pointer-events-auto max-w-md w-full rounded-2xl bg-white shadow-2xl border border-black/10 p-5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-black/90">All Done!</h3>
                <p className="text-sm text-black/60 mt-0.5">
                  You&apos;ve rated all {players.length} players.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/match-hub/${match._id}`)}
                    className="text-xs font-semibold text-[#e09225] hover:underline"
                  >
                    Back to match
                  </button>
                  <span className="text-[10px] text-black/30">
                    Auto-redirects in 3s
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDone(false)}
                className="shrink-0 w-7 h-7 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-black/40"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
