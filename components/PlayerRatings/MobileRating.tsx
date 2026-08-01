"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Users, CheckCircle2 } from "lucide-react";
import RatingStars from "./RatingStars";
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

export default function MobileRating({
  players,
  match,
  onRatingSubmit,
}: Props) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [showDone, setShowDone] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const currentPlayer = players[currentIndex];

  // Auto-redirect after 3s when done
  useEffect(() => {
    if (!showDone) return;
    const timer = setTimeout(() => {
      router.push(`/match-hub/${match._id}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showDone, router, match._id]);

  useEffect(() => {
    if (!currentPlayer) return;

    if (currentPlayer.userRating) {
      setSelectedRating(currentPlayer.userRating);
    } else {
      setSelectedRating(null);
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
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else {
      // Reached the end — show done toast
      setShowDone(true);
    }
  };

  const previousPlayer = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRating = (rating: number) => {
    // Allow re-voting: just update the selected rating and call the API
    setSelectedRating(rating);
    onRatingSubmit(currentPlayer._id, rating);

    setTimeout(() => {
      if (currentIndex < players.length - 1) {
        setDirection(1);
        setCurrentIndex((i) => i + 1);
      } else {
        setShowDone(true);
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

  // Direction-aware animation variants
  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -120 : 120,
      opacity: 0,
    }),
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
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentPlayer._id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            {/* Player Image */}
            {currentPlayer.vertical_image ? (
              <Image
                src={
                  failedImages[currentPlayer._id]
                    ? noImage
                    : currentPlayer.vertical_image
                }
                alt={currentPlayer.name}
                fill
                priority
                className="object-cover object-top"
                onError={() =>
                  setFailedImages((prev) => ({
                    ...prev,
                    [currentPlayer._id]: true,
                  }))
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#06182e]">
                <span className="para text-[220px] text-white/10">
                  {currentPlayer.number || "?"}
                </span>
              </div>
            )}
            {/* Bottom Gradient — Tailwind v4 syntax */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

            {/* Back */}
            <Link
              href={`/match-hub/${match._id}`}
              className="absolute left-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl"
            >
              <ArrowLeft size={22} className="text-white" />
            </Link>

            {/* Rating Stars — re-vote always allowed */}
            <div className="absolute left-1/2 top-5 z-30 -translate-x-1/2">
              <RatingStars
                rating={selectedRating || 0}
                onRatingSelect={handleRating}
                disabled={false}
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
                    transition={{ duration: 0.25 }}
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
                {selectedRating !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-xl"
                  >
                    <span className="text-sm text-white">
                      {selectedRating}★ Rated
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* End-of-list toast */}
      <AnimatePresence>
        {showDone && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-6 z-50"
          >
            <div className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-5 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={22} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white">All Done!</h3>
                  <p className="text-sm text-white/70 mt-0.5">
                    You&apos;ve rated all {players.length} players.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/match-hub/${match._id}`)}
                      className="text-xs font-semibold text-[#e09225] hover:underline"
                    >
                      Back to match
                    </button>
                    <span className="text-[10px] text-white/30">
                      Auto-redirects in 3s
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDone(false)}
                  className="shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
