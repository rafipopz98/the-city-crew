"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import ImageWithFallback from "./ImageWithFallback";
import { TeamMember } from "./about-us.data";

const TILT = [-7, 5, -4, 8, -6, 4, -8, 6];
const RADIUS = 40; // % from center — photos orbit here
const HUB_RADIUS = 26; // % — keeps hub clear of the orbiting photos
const ROTATION_SECONDS = 90;

const isPlaceholder = (v: string) => /^some (game|moment)$/i.test(v.trim());

type Props = { members: TeamMember[] };

const RosterRing = ({ members }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const ringRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const active = members.find((m) => m.id === activeId) ?? null;
  const total = members.length;

  const positionOf = (i: number) => {
    const angle = (i / total) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    return { x: 50 + RADIUS * Math.cos(rad), y: 50 + RADIUS * Math.sin(rad) };
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || !ringRef.current) return;

    const state = { angle: 0 };
    tweenRef.current = gsap.to(state, {
      angle: 360,
      duration: ROTATION_SECONDS,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        if (ringRef.current)
          ringRef.current.style.transform = `rotate(${state.angle}deg)`;
        counterRefs.current.forEach((el) => {
          if (el) el.style.transform = `rotate(${-state.angle}deg)`;
        });
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (activeId) tweenRef.current?.pause();
    else tweenRef.current?.play();
  }, [activeId]);

  const select = (id: string) => {
    setActiveId((cur) => (cur === id ? null : id));
    setPulseKey((k) => k + 1);
  };

  return (
    <>
      <div
        className="relative z-20 mx-auto aspect-square w-[320px] sm:w-110 md:w-135 lg:w-160"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => {
          if (!activeId) tweenRef.current?.play();
        }}
      >
        {/* breathing ambient glow */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6cabdd] blur-3xl"
        />

        <div
          ref={ringRef}
          className="absolute inset-0 z-1"
          style={{
            transformOrigin: "50% 50%",
            willChange: "transform",
            contain: "layout paint",
          }}
        >
          {/* orbit path + tick marks */}
          <svg
            className="absolute inset-0 h-full w-full z-10"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#06182e"
              strokeOpacity="0.08"
              strokeWidth="0.4"
              strokeDasharray="1 2.4"
            />
            {members.map((_, i) => {
              const { x, y } = positionOf(i);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="0.5"
                  fill="#06182e"
                  fillOpacity="0.15"
                />
              );
            })}

            <AnimatePresence>
              {active &&
                (() => {
                  const i = members.findIndex((m) => m.id === active.id);
                  const { x, y } = positionOf(i);
                  return (
                    <motion.line
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke="#e09225"
                      className={"hidden sm:block"}
                      strokeWidth="0.5"
                      strokeDasharray="2 1.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  );
                })()}
            </AnimatePresence>
          </svg>

          {members.map((member, i) => {
            const { x, y } = positionOf(i);
            const isActive = activeId === member.id;
            const isDimmed = activeId !== null && !isActive;

            return (
              <button
                key={member.id}
                onClick={() => select(member.id)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="group absolute z-10 w-18 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none sm:w-24 md:w-28.5 lg:w-33"
              >
                <div
                  ref={(el) => {
                    counterRefs.current[i] = el;
                  }}
                  className="relative will-change-transform"
                >
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-[#06182e] px-2.5 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    {member.name}
                  </span>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                      rotate: TILT[i % TILT.length],
                    }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    animate={{
                      opacity: isDimmed ? 0.35 : 1,
                      scale: isActive ? 1.18 : 1,
                      rotate: isActive ? 0 : TILT[i % TILT.length],
                      y: isActive ? -4 : 0,
                    }}
                    whileHover={{
                      scale: isActive ? 1.18 : 1.1,
                      y: -6,
                      rotate: 0,
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative rounded-lg border-2 bg-white p-1 shadow-md transition-[border-color,box-shadow] duration-300 ${
                      isActive
                        ? "border-[#e09225] shadow-[0_0_0_4px_rgba(224,146,37,0.15),0_8px_20px_rgba(6,24,46,0.25)]"
                        : "border-white group-hover:shadow-lg"
                    }`}
                  >
                    <div className="relative aspect-4/5 z-999 w-full rounded-sm bg-[#06182e]/5">
                      <ImageWithFallback
                        src={member.image}
                        fallbackName={member.name}
                        alt={member.name}
                        fill
                        sizes="140px"
                        className={
                          member.imageFit === "contain"
                            ? "object-contain p-1"
                            : "object-cover"
                        }
                      />
                    </div>

                    {isActive && (
                      <motion.span
                        key={`${activeId}-${pulseKey}`}
                        initial={{ scale: 0.4, opacity: 0.55 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#e09225]"
                      />
                    )}
                  </motion.div>
                </div>
              </button>
            );
          })}
        </div>

        {/* center hub — tablet & up only, mobile gets the card below instead */}
        <div
          style={{ width: `${HUB_RADIUS * 2}%` }}
          className="absolute left-1/2 top-1/2 z-20 hidden aspect-square -translate-x-1/2 -translate-y-1/2 sm:block"
        >
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full bg-white p-[10%] text-center shadow-2xl ring-4 ring-[#e09225]/15"
              >
                <button
                  onClick={() => setActiveId(null)}
                  aria-label="Close"
                  className="absolute right-[14%] top-[14%] flex h-6 w-6 items-center justify-center rounded-full bg-[#06182e]/5 text-sm text-[#06182e]/50 transition hover:bg-[#06182e]/10"
                >
                  ×
                </button>

                <div className="relative aspect-square w-[42%] z-999 overflow-hidden rounded-full ring-2 ring-[#e09225]">
                  <ImageWithFallback
                    src={active.image}
                    fallbackName={active.name}
                    alt={active.name}
                    fill
                    className={
                      active.imageFit === "contain"
                        ? "object-contain p-1"
                        : "object-cover"
                    }
                  />
                </div>

                <span className="mt-2 inline-block rounded-full bg-[#e09225]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#e09225] sm:text-[10px]">
                  {active.shortBio}
                </span>
                <h2 className="nav mt-1 text-base font-black uppercase leading-tight text-[#06182e] sm:text-xl md:text-2xl">
                  {active.name}
                </h2>

                {!isPlaceholder(active.favouriteGame) && (
                  <p className="mt-1.5 line-clamp-2 px-2 text-[9px] leading-snug text-[#06182e]/60 sm:text-[11px]">
                    <span className="font-bold text-[#06182e]">Fave game:</span>{" "}
                    {active.favouriteGame}
                  </p>
                )}
                {!isPlaceholder(active.bestMoment) && (
                  <p className="mt-0.5 line-clamp-2 px-2 text-[9px] leading-snug text-[#06182e]/60 sm:text-[11px]">
                    <span className="font-bold text-[#06182e]">
                      Best moment:
                    </span>{" "}
                    {active.bestMoment}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-xl"
              >
                <span className="nav pointer-events-none absolute text-[9vw] font-black text-[#06182e]/4 lg:text-6xl">
                  MCFC
                </span>
                <motion.span
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-[8%] rounded-full border-2 border-dashed border-[#e09225]/40"
                />
                <p className="para relative z-10 px-6 text-[10px] font-bold uppercase tracking-wider text-[#06182e]/50 sm:text-xs">
                  Tap a face to
                  <br />
                  meet the crew
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* mobile info card — sits below the ring, full width, no cropped text */}
      <div className="mt-6 sm:hidden">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative rounded-2xl bg-white p-5 shadow-lg"
            >
              <button
                onClick={() => setActiveId(null)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#06182e]/5 text-sm text-[#06182e]/50"
              >
                ×
              </button>
              {/* Image */}
              <div className="relative mx-auto mb-4 h-24 w-24 z-999 overflow-hidden rounded-full ring-4 ring-[#e09225]/20">
                <ImageWithFallback
                  src={active.image}
                  fallbackName={active.name}
                  alt={active.name}
                  fill
                  className={
                    active.imageFit === "contain"
                      ? "object-contain p-1"
                      : "object-cover"
                  }
                />
              </div>
              <span className="inline-block rounded-full bg-[#e09225]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e09225]">
                {active.shortBio}
              </span>
              <h2 className="nav mt-2 text-2xl font-black uppercase text-[#06182e]">
                {active.name}
              </h2>

              {(!isPlaceholder(active.favouriteGame) ||
                !isPlaceholder(active.bestMoment)) && (
                <div className="mt-3 space-y-3">
                  {!isPlaceholder(active.favouriteGame) && (
                    <div className="rounded-xl bg-[#FFF5E5] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#06182e]/40">
                        Favourite Game
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#06182e]">
                        {active.favouriteGame}
                      </p>
                    </div>
                  )}
                  {!isPlaceholder(active.bestMoment) && (
                    <div className="rounded-xl bg-[#FFF5E5] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#06182e]/40">
                        Best Moment
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#06182e]">
                        {active.bestMoment}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl border-2 border-dashed border-[#06182e]/15 p-5 text-center"
            >
              <p className="para text-xs font-semibold uppercase tracking-wider text-[#06182e]/40">
                Tap a face above to meet them
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default RosterRing;
