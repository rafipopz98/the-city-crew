"use client";
import { useState } from "react";
import MemberDrawer from "./MemberDrawer";
import TeamCard from "./TeamCard";

type Member = {
  name: string;
  role: string;
};

const TEAM: Member[] = [
  { name: "Ro🇧🇼", role: "Admin" },
  { name: "Craig", role: "Core Member" },
  { name: "tom🕸️", role: "Core Member" },
  { name: "Reece Lindsay", role: "Core Member" },
  { name: "Marshall", role: "Core Member" },
  { name: "Lewis", role: "Core Member" },
  { name: "rafi", role: "Builder" },
  { name: "Archie", role: "Core Member" },
];

const About = () => {
  const [active, setActive] = useState<Member | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#FFF5E5] px-6 md:px-12 lg:px-16 pt-28 pb-20">
      {/* HERO */}
      <div className="mb-20 max-w-4xl">
        <h1 className="nav text-[clamp(48px,8vw,90px)] leading-[0.9] font-black uppercase text-[#06182e]">
          The <span className="text-[#e09225]">City Crew</span>
        </h1>

        <p className="para mt-4 text-[#06182e]/50 max-w-xl">
          Not just fans. A community built around passion, opinions, and moments
          that matter.
        </p>
      </div>

      {/* GRID */}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {TEAM.map((member, i) => (
          <TeamCard key={i} member={member} onClick={() => setActive(member)} />
        ))}
      </div>

      {/* DRAWER */}
      <MemberDrawer member={active} onClose={() => setActive(null)} />
    </div>
  );
};

export default About;
