"use client";

import Image from "next/image";
import { useState } from "react";
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
  },
];

export default function PlayerHeroSlider() {
  const [[index, direction], setIndex] = useState([0, 0]);

  const paginate = (dir: number) => {
    setIndex(([prev]) => [(prev + dir + PLAYERS.length) % PLAYERS.length, dir]);
  };

  const player = PLAYERS[index];
  const prev = PLAYERS[(index - 1 + PLAYERS.length) % PLAYERS.length];
  const next = PLAYERS[(index + 1) % PLAYERS.length];

  return (
    <section className="w-full min-h-screen bg-[#FFF5E5] flex items-center justify-center px-6 sm:pt-4 -mt-5 sm:mt-0 relative overflow-hidden">
      {/* BACKGROUND GLOW */}
      <motion.div
        key={player.number}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute w-150 h-150 bg-[#06182e] blur-[120px] rounded-full"
      />

      {/* BIG NUMBER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={player.number}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute text-[25vw] font-black text-[#06182e]/5 select-none"
        >
          {player.number}
        </motion.div>
      </AnimatePresence>

      {/* MAIN GRID */}
      <motion.div
        className="max-w-6xl w-full grid grid-cols-3 items-center gap-6 z-10"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.x > 100) paginate(-1);
          if (info.offset.x < -100) paginate(1);
        }}
      >
        {/* LEFT PREVIEW */}
        <Preview player={prev} direction="left" onClick={() => paginate(-1)} />

        {/* CENTER */}
        <div className="text-center">
          {/* IMAGE (FIXED ANIMATION) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{
                x: direction > 0 ? 120 : -120,
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                x: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                x: direction > 0 ? -120 : 120,
                opacity: 0,
                scale: 0.95,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={player.image}
                alt={player.name}
                width={400}
                height={400}
                className="h-105 mx-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.3)]"
              />
            </motion.div>
          </AnimatePresence>

          {/* NAME */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={player.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="nav text-[clamp(40px,6vw,80px)] font-black text-[#06182e] uppercase mt-4"
            >
              {player.name}
            </motion.h1>
          </AnimatePresence>

          {/* META */}
          <p className="para text-[#06182e]/50 mt-2 uppercase text-sm tracking-wider">
            {player.position} • {player.country}
          </p>

          {/* STATS */}
          <div className="flex justify-center gap-8 mt-6">
            <Stat label="Goals" value={player.goals} />
            <Stat label="Assists" value={player.assists} />
            {player.cleanSheets > 0 && (
              <Stat label="CS" value={player.cleanSheets} />
            )}
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <Preview player={next} direction="right" onClick={() => paginate(1)} />
      </motion.div>
    </section>
  );
}

function Preview({
  player,
  onClick,
  direction,
}: {
  player: Player;
  onClick: () => void;
  direction: "left" | "right";
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.08,
        x: direction === "left" ? -6 : 6,
      }}
      onClick={onClick}
      className="cursor-pointer opacity-60 hover:opacity-100 text-center"
    >
      <Image
        src={player.image}
        alt={player.name}
        width={100}
        height={100}
        className="h-auto mx-auto object-contain"
      />
      <p className="text-sm font-bold text-[#06182e] mt-2">{player.name}</p>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-4xl font-black text-[#06182e]">{value}</div>
      <div className="text-xs uppercase text-[#e09225]">{label}</div>
    </div>
  );
}
