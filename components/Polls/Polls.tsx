"use client";

import { useState } from "react";
import PollCard from "./PollCard";

const ALL_POLLS = [
  {
    id: 1,
    badge: "M28 · Pre-match",
    question: "Will Haaland break the EPL scoring record this season?",
    options: [
      { text: "Yes — he's unstoppable", votes: 2940 },
      { text: "Close but no", votes: 1155 },
      { text: "Injury risk too high", votes: 717 },
    ],
    totalVotes: 4812,
    endsIn: "2 days",
    tag: "active",
  },
  {
    id: 4,
    badge: "UCL · Season",
    question: "Most likely Champions League outcome for City?",
    options: [
      { text: "Winners — we go again", votes: 2980 },
      { text: "Semi-finals exit", votes: 2745 },
      { text: "Quarter-final exit", votes: 2118 },
    ],
    totalVotes: 7843,
    endsIn: "Open",
    tag: "active",
  },
  {
    id: 3,
    badge: "Transfer · Summer",
    question: "Which position should City prioritise in the summer window?",
    options: [
      { text: "Centre-back", votes: 2686 },
      { text: "Defensive midfielder", votes: 2014 },
      { text: "Winger cover", votes: 1404 },
    ],
    totalVotes: 6104,
    endsIn: "5 days",
    tag: "active",
  },

  {
    id: 2,
    badge: "M28 · Tactics",
    question: "Who should start at right-back vs Arsenal?",
    options: [
      { text: "Kyle Walker", votes: 1711 },
      { text: "Rico Lewis", votes: 1349 },
      { text: "Gvardiol shifted wide", votes: 230 },
    ],
    totalVotes: 3290,
    endsIn: "1 day",
    tag: "active",
  },
  {
    id: 5,
    badge: "M27 · Player",
    question: "Man of the match vs Spurs last Saturday?",
    options: [
      { text: "Phil Foden", votes: 2877 },
      { text: "Bernardo Silva", votes: 1517 },
      { text: "Matheus Nunes", votes: 837 },
    ],
    totalVotes: 5231,
    endsIn: "Closed",
    tag: "closed",
  },
  {
    id: 6,
    badge: "Season · Manager",
    question: "Is Pep likely to stay beyond this season?",
    options: [
      { text: "Yes — one more year", votes: 4278 },
      { text: "No — time to move on", votes: 3095 },
      { text: "Too early to call", votes: 1729 },
    ],
    totalVotes: 9102,
    endsIn: "Open",
    tag: "active",
  },
  {
    id: 7,
    badge: "Community · Fun",
    question: "Best City kit of the last decade?",
    options: [
      { text: "2012/13 home (title winners)", votes: 3100 },
      { text: "2018/19 away (light blue)", votes: 2800 },
      { text: "2022/23 third (indigo)", votes: 1900 },
    ],
    totalVotes: 7800,
    endsIn: "Open",
    tag: "active",
  },
  {
    id: 8,
    badge: "M29 · Predict",
    question: "Scoreline prediction vs Chelsea on Saturday?",
    options: [
      { text: "City win 2-0 or more", votes: 5100 },
      { text: "Narrow 1-0 City win", votes: 2400 },
      { text: "Draw or Chelsea win", votes: 900 },
    ],
    totalVotes: 8400,
    endsIn: "3 days",
    tag: "active",
  },
];

const Polls = () => {
  const [tab, setTab] = useState("active");

  const filtered = ALL_POLLS.filter((p) => p.tag === tab);

  return (
    <div className="w-full min-h-screen bg-[#FFF5E5] px-6 md:px-12 lg:px-16 pt-28 pb-20 font-[Barlow]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 pb-6 border-b border-[#06182e]/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#e09225] mb-2">
            <span className="nav w-1.5 h-1.5 rounded-full bg-[#e09225] animate-pulse" />
            Fan Polls · 2024/25
          </div>

          <h1 className="nav text-[clamp(48px,8vw,80px)] font-black leading-[0.85] uppercase text-[#06182e]">
            City <span className="text-[#e09225]">Votes</span>
          </h1>

          <p className="para text-sm text-[#06182e]/50 mt-2">
            Real opinions from the sky blue faithful
          </p>
        </div>

        <div className="flex bg-[#06182e]/5 rounded-md p-1">
          {["active", "closed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                px-5 py-1.5 text-xs para font-bold uppercase tracking-wider rounded
                transition-all duration-200
                ${
                  tab === t
                    ? "bg-[#06182e] text-[#FFF5E5]"
                    : "text-[#06182e]/50 hover:text-[#06182e]"
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-10 mb-8 nav">
        <Stat
          label="Active polls"
          value={ALL_POLLS.filter((p) => p.tag === "active").length}
        />
        <Stat label="Total votes cast" value="47.6k" />
        <Stat label="Voters this week" value="3.2k" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div className="para text-2xl font-extrabold text-[#06182e] leading-none">
      {value}
    </div>
    <div className="para text-[11px] text-[#06182e]/40 mt-1 tracking-wide">
      {label}
    </div>
  </div>
);

export default Polls;
