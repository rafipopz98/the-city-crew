"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import ImageWithFallback from "./ImageWithFallback";
import { TeamMember } from "./about-us.data";

type Props = {
  member: TeamMember | null;
  onClose: () => void;
};

const isPlaceholder = (v: string) => /^some (game|moment)$/i.test(v.trim());

const MemberSpotlight = ({ member, onClose }: Props) => {
  useEffect(() => {
    if (!member) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [member, onClose]);

  const hasDetails =
    member &&
    (!isPlaceholder(member.favouriteGame) || !isPlaceholder(member.bestMoment));

  return (
    <AnimatePresence>
      {member && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${member.name} profile`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#06182e]/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl sm:max-w-md sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-[#06182e]/50 transition hover:bg-[#06182e]/5"
            >
              ×
            </button>

            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#e09225]/20 sm:h-32 sm:w-32">
              <ImageWithFallback
                src={member.image}
                fallbackName={member.name}
                alt={member.name}
                fill
                className={
                  member.imageFit === "contain"
                    ? "object-contain p-3"
                    : "object-cover"
                }
              />
            </div>

            <span className="mt-4 inline-block rounded-full bg-[#e09225]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e09225]">
              {member.shortBio}
            </span>
            <h2 className="nav mt-2 text-3xl font-black uppercase text-[#06182e] sm:text-4xl">
              {member.name}
            </h2>

            {hasDetails && (
              <div className="mt-6 space-y-3 text-left">
                {!isPlaceholder(member.favouriteGame) && (
                  <div className="rounded-xl bg-[#FFF5E5] p-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#06182e]/50">
                      Favourite Game
                    </h4>
                    <p className="mt-1 font-semibold text-[#06182e]">
                      {member.favouriteGame}
                    </p>
                  </div>
                )}
                {!isPlaceholder(member.bestMoment) && (
                  <div className="rounded-xl bg-[#FFF5E5] p-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#06182e]/50">
                      Best Moment
                    </h4>
                    <p className="mt-1 font-semibold text-[#06182e]">
                      {member.bestMoment}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemberSpotlight;
