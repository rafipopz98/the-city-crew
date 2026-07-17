"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TeamMember } from "./about-us.data";

type Props = {
  members: TeamMember[];
  hoveredId: string | null;
  expandedId: string | null;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
};

const isPlaceholder = (v: string) => /^some (game|moment)$/i.test(v.trim());

const RosterList = ({
  members,
  hoveredId,
  expandedId,
  onHover,
  onToggle,
}: Props) => {
  return (
    <div className="flex w-full flex-col divide-y divide-[#06182e]/10 lg:w-[28%]">
      {members.map((member, i) => {
        const isActive = hoveredId === member.id || expandedId === member.id;
        const isDimmed = hoveredId !== null && !isActive;
        const isOpen = expandedId === member.id;
        const hasDetails =
          !isPlaceholder(member.favouriteGame) ||
          !isPlaceholder(member.bestMoment);

        return (
          <div
            key={member.id}
            onMouseEnter={() => onHover(member.id)}
            onMouseLeave={() => onHover(null)}
          >
            <motion.button
              onClick={() => onToggle(member.id)}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              animate={{ opacity: isDimmed ? 0.45 : 1 }}
              className="flex w-full items-center justify-between py-4 text-left focus-visible:outline-none"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 rounded-full bg-[#e09225] transition-all duration-300 ${
                    isActive ? "w-6" : "w-3 bg-[#06182e]/20"
                  }`}
                />
                <div>
                  <p className="nav text-lg font-black uppercase leading-none text-[#06182e] md:text-xl">
                    {member.name}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#06182e]/40">
                    {member.shortBio}
                  </p>
                </div>
              </div>

              {hasDetails && (
                <span
                  className={`text-xs text-[#06182e]/40 transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              )}
            </motion.button>

            <AnimatePresence initial={false}>
              {isOpen && hasDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pb-4 pl-5">
                    {!isPlaceholder(member.favouriteGame) && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#06182e]/40">
                          Favourite Game
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#06182e]">
                          {member.favouriteGame}
                        </p>
                      </div>
                    )}
                    {!isPlaceholder(member.bestMoment) && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#06182e]/40">
                          Best Moment
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#06182e]">
                          {member.bestMoment}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default RosterList;
