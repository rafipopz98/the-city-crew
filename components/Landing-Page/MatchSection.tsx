"use client";
import { useState } from "react";

const dummyFixtures = [
  {
    id: 1,
    date: "03 MAR",
    home: "Manchester City",
    away: "Aston Villa",
    time: "Sunday — 18:30",
    venue: "Etihad Stadium — Manchester",
  },
  {
    id: 2,
    date: "10 MAR",
    home: "Manchester City",
    away: "Arsenal",
    time: "Saturday — 20:00",
    venue: "Etihad Stadium — Manchester",
  },
  {
    id: 3,
    date: "18 MAR",
    home: "Manchester City",
    away: "Chelsea",
    time: "Sunday — 17:30",
    venue: "Etihad Stadium — Manchester",
  },
];

const MatchesSection = () => {
  const [open, setOpen] = useState<"results" | "fixtures" | null>(null);

  return (
    <div className="w-full bg-[#06182e] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ===================== */}
        {/* 🔥 LATEST RESULTS ROW */}
        {/* ===================== */}
        <div
          onClick={() => setOpen(open === "results" ? null : "results")}
          className="w-full border-t border-b border-[#ece1cf]/10 py-6 flex justify-between items-center cursor-pointer group"
        >
          <h2 className="text-[8vw] sm:text-[5vw] lg:text-[3rem] font-extrabold uppercase text-[#ece1cf] group-hover:text-[#ece1cf] transition-all">
            Latest Results
          </h2>

          <span
            className={`text-3xl text-[#ece1cf] transition-all ${
              open === "results" ? "rotate-90 text-[#ece1cf]" : ""
            }`}
          >
            →
          </span>
        </div>

        {/* 🔽 RESULTS CONTENT */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            open === "results" ? "max-h-250 py-8" : "max-h-0"
          }`}
        >
          <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3">
            {dummyFixtures.map((item) => (
              <div
                key={item.id}
                className="min-w-75 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-xs font-bold">FT</span>
                </div>

                <h3 className="text-5xl font-extrabold my-6">3 : 0</h3>

                <div className="text-sm font-semibold">
                  <p>Manchester City</p>
                  <p className="text-black/50">Liverpool</p>
                </div>

                <div className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4">
                  <span>VIEW MATCH</span>
                  <span className="text-[#e09225]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== */}
        {/* 🔥 FIXTURES ROW */}
        {/* ===================== */}
        <div
          onClick={() => setOpen(open === "fixtures" ? null : "fixtures")}
          className="w-full border-b border-[#ece1cf]/10 py-6 flex justify-between items-center cursor-pointer group"
        >
          <h2 className="text-[8vw] sm:text-[5vw] lg:text-[3rem] font-extrabold uppercase text-[#ece1cf] group-hover:text-[#ece1cf] transition-all">
            Upcoming Fixtures
          </h2>

          <span
            className={`text-3xl text-[#ece1cf] transition-all ${
              open === "fixtures" ? "rotate-90 text-[#ece1cf]" : ""
            }`}
          >
            →
          </span>
        </div>

        {/* 🔽 FIXTURES CONTENT */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            open === "fixtures" ? "max-h-250 py-8" : "max-h-0"
          }`}
        >
          <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3">
            {dummyFixtures.map((item) => (
              <div
                key={item.id}
                className="min-w-75 bg-[#ece1cf] rounded-2xl p-6 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg"
                    className="w-6 h-6"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/sco/thumb/e/eb/Manchester_City_FC_badge.svg/1280px-Manchester_City_FC_badge.svg.png"
                    className="w-6 h-6"
                  />
                </div>

                <div className="mt-4 text-xs text-black/70">
                  <p>{item.time}</p>
                  <p>{item.venue}</p>
                </div>

                <h3 className="text-5xl font-extrabold my-6">{item.date}</h3>

                <div className="text-sm font-semibold">
                  <p>{item.home}</p>
                  <p className="text-black/50">{item.away}</p>
                </div>

                <div className="mt-6 border border-black/30 rounded-full py-2 text-xs flex justify-between px-4">
                  <span>BUY TICKETS</span>
                  <span className="text-[#e09225]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchesSection;
