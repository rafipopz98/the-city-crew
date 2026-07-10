"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Users } from "lucide-react";
import RatingStars from "./RatingStars";

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

export default function MobileRating({
  players,
  match,
  onRatingSubmit,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const currentPlayer = players[currentIndex];

  useEffect(() => {
    if (!currentPlayer) return;

    if (currentPlayer.userRating) {
      setSelectedRating(currentPlayer.userRating);
      setHasVoted(true);
    } else {
      setSelectedRating(null);
      setHasVoted(false);
    }
  }, [currentPlayer]);

  if (!players.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-white/50">No players available.</p>
      </main>
    );
  }

  const nextPlayer = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const previousPlayer = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    setHasVoted(true);

    onRatingSubmit(currentPlayer._id, rating);

    setTimeout(() => {
      if (currentIndex < players.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }, 700);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.y) < 80) return;

    if (info.offset.y < 0) {
      nextPlayer();
    } else {
      previousPlayer();
    }
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        className="absolute inset-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer._id}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.35 }}
            className="relative h-full w-full"
          >
            {" "}
            {/* Player Image */}
            {currentPlayer.vertical_image ? (
              <Image
                src={currentPlayer.vertical_image}
                alt={currentPlayer.name}
                fill
                priority
                className="object-cover object-top"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#06182e]">
                <span className="para text-[220px] text-white/10">
                  {currentPlayer.number || "?"}
                </span>
              </div>
            )}
            {/* Bottom Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
            {/* Back */}
            <Link
              href={`/match-hub/${match._id}`}
              className="absolute left-5 top-safe top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl"
            >
              <ArrowLeft size={22} className="text-white" />
            </Link>
            {/* Rating Stars */}
            <div className="absolute left-1/2 top-safe top-5 z-30 -translate-x-1/2">
              <RatingStars
                rating={selectedRating || 0}
                onRatingSelect={handleRating}
                disabled={hasVoted}
                size="large"
                surface="dark"
              />
            </div>
            {/* Right Sidebar */}
            <div className="absolute bottom-44 right-5 z-30 flex flex-col items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-black/35 p-3 backdrop-blur-xl">
                  <Star className="fill-[#e09225] text-[#e09225]" size={22} />
                </div>

                <span className="mt-2 text-lg font-semibold text-white">
                  {currentPlayer.totalRatings
                    ? currentPlayer.averageRating.toFixed(1)
                    : "--"}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="rounded-full bg-black/35 p-3 backdrop-blur-xl">
                  <Users size={22} className="text-white" />
                </div>

                <span className="mt-2 text-lg font-semibold text-white">
                  {currentPlayer.totalRatings}
                </span>
              </div>
            </div>
            {/* Bottom Content */}
            <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-8">
              <div className="max-w-[75%]">
                <h1 className="para text-[42px] leading-none uppercase text-white">
                  {currentPlayer.name}
                </h1>

                <p className="mt-2 text-base text-white/85">
                  🇪🇸 {currentPlayer.country} • {currentPlayer.position}
                </p>
              </div>

              {/* Progress */}

              <div className="mt-6 flex items-center gap-2">
                {players.map((_, index) => (
                  <motion.div
                    key={index}
                    layout
                    transition={{
                      duration: 0.25,
                    }}
                    className={`rounded-full ${
                      index === currentIndex
                        ? "h-1 w-10 bg-white"
                        : index < currentIndex
                          ? "h-1 w-5 bg-white/70"
                          : "h-1 w-5 bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm tracking-wide text-white/70">
                  {currentIndex + 1} / {players.length}
                </span>

                {hasVoted && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-xl"
                  >
                    <span className="text-sm text-white">
                      ✓ Thanks for voting
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
