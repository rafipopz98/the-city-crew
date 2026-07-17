"use client";

import { motion } from "framer-motion";
import RosterRing from "./RosterRing";
import { TEAM } from "./about-us.data";

const About = () => {
  return (
    <div className="min-h-screen w-full bg-[#FFF5E5] px-6 pt-28 pb-20 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mb-10 max-w-2xl text-center lg:mb-14"
      >
        <h1 className="nav text-[clamp(40px,10vw,90px)] font-black uppercase leading-[0.9] text-[#06182e]">
          The <span className="text-[#e09225]">City Crew</span>
        </h1>
        <p className="para mt-4 text-[#06182e]/60">
          Not just fans. A community built around passion, opinions, and moments
          that matter.
        </p>
      </motion.div>

      <RosterRing members={TEAM} />
    </div>
  );
};

export default About;
