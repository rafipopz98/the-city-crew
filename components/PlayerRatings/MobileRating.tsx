"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  }, [currentIndex, currentPlayer]);

  if (!players.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06182e]">
        <p className="text-white/50">No players available.</p>
      </main>
    );
  }

  const nextPlayer = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex((p) => p + 1);
    }
  };

  const previousPlayer = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    }
  };

  const handleRating = (rating: number) => {
    setSelectedRating(rating);

    setHasVoted(true);

    onRatingSubmit(currentPlayer._id, rating);

    setTimeout(() => {
      if (currentIndex < players.length - 1) {
        setCurrentIndex((p) => p + 1);
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
    <main className="fixed inset-0 bg-[#06182e] overflow-hidden">
      {/* Header */}

      <header
        className="
      absolute
      inset-x-0
      top-0
      z-30

      flex
      items-center
      justify-between

      px-5
      pt-safe
      pt-6
    "
      >
        <Link
          href={`/match-hub/${match._id}`}
          className="
        flex
        h-11
        w-11
        items-center
        justify-center

        rounded-full

        bg-black/30

        backdrop-blur-md
      "
        >
          <ArrowLeft size={20} className="text-white" />
        </Link>

        <div className="text-center">
          <p
            className="
          text-[10px]

          uppercase

          tracking-[0.35em]

          text-white/40
        "
          >
            Player Ratings
          </p>

          <p className="mt-1 text-sm text-white/70">
            {currentIndex + 1} of {players.length}
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* Swipe Area */}

      <motion.div
        drag="y"
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        className="absolute inset-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer._id}
            initial={{
              opacity: 0,
              y: 80,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -80,
            }}
            transition={{
              duration: 0.35,
            }}
            className="
          relative

          flex
          h-full
          w-full
          items-end
          justify-center
        "
          >
            {/* Player */}

            <div
              className="
            absolute
            inset-0
          "
            >
              {currentPlayer.vertical_image ? (
                <Image
                  src={currentPlayer.vertical_image}
                  alt={currentPlayer.name}
                  fill
                  priority
                  className="object-contain"
                />
              ) : (
                <div
                  className="
                flex
                h-full
                items-center
                justify-center
              "
                >
                  <span
                    className="
                  para

                  text-[180px]

                  text-white/10
                "
                  >
                    {currentPlayer.number || "?"}
                  </span>
                </div>
              )}

              {/* Gradient */}

              <div
                className="
              absolute
              inset-0

              bg-gradient-to-b

              from-[#06182e]/10

              via-transparent

              to-[#06182e]
            "
              />
            </div>

            {/* Bottom Content */}

            <div
              className="
            relative
            z-20

            w-full

            px-8
            pb-10
          "
            >
              <p
                className="
              text-[11px]

              uppercase

              tracking-[0.35em]

              text-white/40
            "
              >
                {currentPlayer.position} • {currentPlayer.country}
              </p>
              <h1
                className="
              para

              mt-3

              text-5xl

              uppercase

              leading-none

              text-white
            "
              >
                {currentPlayer.name}
              </h1>
              <p className="mt-3 text-white/35">
                Shirt #{currentPlayer.number}
              </p>{" "}
              {/* Rating */}
              <div className="mt-8 flex justify-center">
                <RatingStars
                  rating={selectedRating || 0}
                  onRatingSelect={handleRating}
                  disabled={hasVoted}
                  size="large"
                  surface="dark"
                />
              </div>
              {/* Community Rating */}
              <div className="mt-6 text-center">
                {currentPlayer.totalRatings > 0 ? (
                  <>
                    <p
                      className="
                    text-[11px]
                    uppercase
                    tracking-[0.3em]
                    text-white/40
                  "
                    >
                      Community Rating
                    </p>

                    <h2
                      className="
                    mt-2

                    para

                    text-5xl

                    text-[#e09225]
                  "
                    >
                      {currentPlayer.averageRating.toFixed(1)}
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      {currentPlayer.totalRatings} supporters voted
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="
                    text-[11px]
                    uppercase
                    tracking-[0.3em]
                    text-white/40
                  "
                    >
                      Community Rating
                    </p>

                    <h2 className="mt-2 text-2xl text-white/30">
                      No ratings yet
                    </h2>
                  </>
                )}
              </div>
              {/* Success */}
              {hasVoted && (
                <div
                  className="
                mt-6

                rounded-full

                border
                border-[#e09225]/30

                bg-[#e09225]/10

                py-3

                text-center

                text-sm

                text-[#e09225]
              "
                >
                  ✓ Rating submitted
                </div>
              )}
              {/* Swipe Hint */}
              <div className="mt-8 text-center">
                {currentIndex < players.length - 1 ? (
                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Swipe Up For Next Player
                  </p>
                ) : (
                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    You've Rated Everyone
                  </p>
                )}
              </div>
              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-white/35">
                  <span>
                    {currentIndex + 1} / {players.length}
                  </span>

                  <span>
                    {Math.round(((currentIndex + 1) / players.length) * 100)}%
                  </span>
                </div>

                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-[#e09225]"
                    animate={{
                      width: `${((currentIndex + 1) / players.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
