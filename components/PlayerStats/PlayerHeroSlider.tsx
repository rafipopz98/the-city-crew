"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Player = {
  name: string;
  number: string;
  position: string;
  country: string;
  image: string;
  goals: number;
  assists: number;
  cleanSheets: number;
  games: number;
  rating: number;
};
const PLAYERS: Player[] = [
  {
    name: "Erling Haaland",
    number: "09",
    position: "Forward",
    country: "Norway",
    image:
      "https://www.mancity.com/meta/media/dkrjtgah/erling-haaland-elec-blue.png",
    goals: 22,
    assists: 7,
    cleanSheets: 0,
    games: 28,
    rating: 4.6,
  },
  {
    name: "Phil Foden",
    number: "47",
    position: "Midfielder",
    country: "England",
    image:
      "https://www.mancity.com/meta/media/zojjpqqc/phil-foden-elec-blue.png",
    goals: 7,
    assists: 3,
    cleanSheets: 0,
    games: 18,
    rating: 4.2,
  },
  {
    name: "Rodri",
    number: "16",
    position: "Midfielder",
    country: "Spain",
    image: "https://www.mancity.com/meta/media/g2levm42/rodri-elec-blue.png",
    goals: 4,
    assists: 5,
    cleanSheets: 0,
    games: 21,
    rating: 3.2,
  },
  {
    name: "Jérémy Doku",
    number: "11",
    position: "Winger",
    country: "Belgium",
    image:
      "https://www.mancity.com/meta/media/q5nblgds/jeremy-doku-elec-blue.png",
    goals: 5,
    assists: 4,
    cleanSheets: 0,
    games: 17,
    rating: 3.7,
  },
  {
    name: "Rayan Cherki",
    number: "10",
    position: "Midfielder",
    country: "France",
    image:
      "https://www.mancity.com/meta/media/zxxnrwdk/rayan-cherki-elec-blue.png",
    goals: 3,
    assists: 8,
    cleanSheets: 0,
    games: 12,
    rating: 1.4,
  },
  {
    name: "Antoine Semenyo",
    number: "42",
    position: "Forward",
    country: "Ghana",
    image: "https://www.mancity.com/meta/media/jucjgjfh/semenyo-elec-blue.png",
    goals: 15,
    assists: 4,
    cleanSheets: 0,
    games: 26,
    rating: 4.2,
  },
  {
    name: "Rayan Ait-Nouri",
    number: "21",
    position: "Midfielder",
    country: "France",
    image:
      "https://www.mancity.com/meta/media/3yicpatt/rayan-ait-nouri-elec-blue.png?width=900&quality=100",
    goals: 4,
    assists: 2,
    cleanSheets: 0,
    games: 16,
    rating: 2.4,
  },
  {
    name: "James Trafford",
    number: "1",
    position: "Goal Keeper",
    country: "England",
    image:
      "https://www.mancity.com/meta/media/r0ph5qs1/james-trafford-elec-blue.png?width=900&quality=100",
    goals: 0,
    assists: 0,
    cleanSheets: 14,
    games: 14,
    rating: 4.6,
  },
  {
    name: "Gianluigi Donnarumma",
    number: "25",
    position: "Goal Keeper",
    country: "Italy",
    image:
      "https://www.mancity.com/meta/media/4run0q5j/donnaruma-elec-blue.png?width=900&quality=100",
    goals: 0,
    assists: 0,
    cleanSheets: 14,
    games: 14,
    rating: 4.1,
  },
  {
    name: "Ruben Dias",
    number: "3",
    position: "Defender",
    country: "Portugal",
    image:
      "https://www.mancity.com/meta/media/fk4lwkni/ruben-dias-elec-blue.png?width=900&quality=100",
    goals: 0,
    assists: 1,
    cleanSheets: 14,
    games: 14,
    rating: 4.1,
  },
  {
    name: "Josko Gvardiol",
    number: "24",
    position: "Defender",
    country: "Croatia",
    image:
      "https://www.mancity.com/meta/media/afjd5irm/josko-gvardiol-elec-blue.png?width=900&quality=100",
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    games: 0,
    rating: 0,
  },
];

const N = PLAYERS.length;
const mod = (n: number, m: number) => ((n % m) + m) % m;

// slot configs: offset -2, -1, 0, 1, 2
const SLOT_CONFIG = [
  { x: -520, scale: 0.42, opacity: 0.25, zIndex: 0 },
  { x: -300, scale: 0.65, opacity: 0.55, zIndex: 1 },
  { x: 0, scale: 1.0, opacity: 1.0, zIndex: 2 },
  { x: 300, scale: 0.65, opacity: 0.55, zIndex: 1 },
  { x: 520, scale: 0.42, opacity: 0.25, zIndex: 0 },
];

export default function PlayerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const go = (direction: number) => {
    setActiveIndex((i) => mod(i + direction, N));
  };

  const handleDragStart = (_: any, info: any) => {
    dragStartX.current = info.point.x;
    isDragging.current = false;
  };

  const handleDrag = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 8) isDragging.current = true;
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 60;
    if (info.offset.x > threshold) go(-1);
    else if (info.offset.x < -threshold) go(1);
  };

  const active = PLAYERS[activeIndex];

  const stats = [
    { label: "Games", value: active.games },
    { label: "Rating", value: active.rating.toFixed(1) },
    active.position === "Goal Keeper"
      ? { label: "Clean Sheets", value: active.cleanSheets }
      : null,
    active.position !== "Goal Keeper"
      ? { label: "Goals", value: active.goals }
      : null,
    active.position !== "Goal Keeper"
      ? { label: "Assists", value: active.assists }
      : null,
  ]
    .filter(Boolean)
    .filter((s) => Number(s!.value) !== 0);

  return (
    <section className="relative w-full min-h-screen bg-[#FFF5E5] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background number */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={active.number}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[38vw] sm:text-[28vw] font-black text-[#06182e]/4 leading-none"
          >
            {active.number}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Carousel track */}
      <div
        className="relative w-full flex items-end justify-center"
        style={{ height: "clamp(340px, 60vh, 520px)" }}
      >
        <motion.div
          className="absolute inset-0 flex items-end justify-center cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          {[-2, -1, 0, 1, 2].map((offset) => {
            const playerIdx = mod(activeIndex + offset, N);
            const player = PLAYERS[playerIdx];
            const cfg = SLOT_CONFIG[offset + 2];
            const isActive = offset === 0;

            return (
              <motion.div
                key={playerIdx}
                className="absolute bottom-0 flex flex-col items-center"
                animate={{
                  x: cfg.x,
                  scale: cfg.scale,
                  opacity: cfg.opacity,
                  zIndex: cfg.zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                onClick={() => {
                  if (!isDragging.current) {
                    if (offset !== 0) setActiveIndex(playerIdx);
                  }
                }}
                style={{ originY: 1, cursor: isActive ? "grab" : "pointer" }}
              >
                <Image
                  src={player.image}
                  alt={player.name}
                  width={380}
                  height={460}
                  draggable={false}
                  className="object-contain object-bottom w-55 sm:w-70 md:w-85 lg:w-95"
                  style={{ height: "clamp(260px, 48vh, 460px)" }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Player info */}
      <div className="relative z-10 mt-6 flex flex-col items-center px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#e09225] mb-1">
              {active.position} &bull; {active.country}
            </p> */}
            {/* <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#06182e] leading-tight">
              {active.name}
            </h2> */}
            <span className="inline-block text-[9px] font-bold tracking-[0.25em] uppercase text-[#e09225] border border-[#e09225]/40 px-3 py-1 rounded-full mb-3">
              {active.position} · {active.country}
            </span>
            <h2 className="text-2xl sm:text-2xl lg:text-4xl font-black uppercase text-[#06182e]/20 leading-none tracking-tight -mt-1">
              {active.name.split(" ")[0]}
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#06182e] leading-none tracking-tight">
              {active.name.split(" ").slice(1).join(" ")}
            </h2>
            <div className="flex flex-col items-center gap-3">
              <StarRating rating={active.rating} />

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-center w-full max-w-55">
                {stats.map((stat, i) => {
                  const isLastOdd =
                    stats.length % 2 !== 0 && i === stats.length - 1;

                  return (
                    <div
                      key={i}
                      className={
                        isLastOdd ? "col-span-2 flex justify-center" : ""
                      }
                    >
                      <Stat label={stat!.label} value={stat!.value} />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot navigation */}
      <div className="relative z-10 flex gap-2 mt-8">
        {PLAYERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              background: i === activeIndex ? "#e09225" : "#06182e33",
            }}
            aria-label={`Go to ${PLAYERS[i].name}`}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 sm:px-6 pointer-events-none z-20">
        {[
          { dir: -1, label: "←" },
          { dir: 1, label: "→" },
        ].map(({ dir, label }) => (
          <button
            key={dir}
            onClick={() => go(dir)}
            className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold text-[#06182e] bg-white/60 backdrop-blur-sm border border-[#06182e]/10 hover:bg-white/90 transition-all active:scale-95"
            aria-label={dir === -1 ? "Previous player" : "Next player"}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className="text-2xl sm:text-3xl font-black text-[#06182e]">
        {value}
      </span>
      <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#e09225] mt-0.5">
        {label}
      </span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.round(rating);

  return (
    <div className="flex flex-col items-center leading-none">
      <div className="flex gap-0.5 text-lg">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < fullStars ? "text-[#e09225]" : "text-[#06182e]/20"}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
