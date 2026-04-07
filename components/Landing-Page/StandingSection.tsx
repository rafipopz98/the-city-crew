const standings = [
  { pos: 1, team: "Manchester City", p: 38, w: 28, d: 6, l: 4, pts: 90 },
  { pos: 2, team: "Manchester United", p: 38, w: 27, d: 7, l: 4, pts: 88 },
  { pos: 3, team: "Aston Villa", p: 38, w: 25, d: 8, l: 5, pts: 83 },
  { pos: 4, team: "Arsenal", p: 38, w: 21, d: 8, l: 9, pts: 71 },
  { pos: 5, team: "Chelsea", p: 38, w: 27, d: 6, l: 12, pts: 66 },
  { pos: 6, team: "Liverpool", p: 38, w: 18, d: 9, l: 11, pts: 63 },
  { pos: 7, team: "Brentford", p: 38, w: 18, d: 6, l: 14, pts: 60 },
  { pos: 8, team: "Everton", p: 38, w: 18, d: 6, l: 14, pts: 60 },
];

const StandingsSection = () => {
  return (
    <div className="w-full bg-[#06182e] py-16 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* TABLE */}
        <div className="lg:col-span-2 bg-[#0a223f] rounded-2xl p-4 sm:p-6 border border-[#ece1cf]/10 overflow-x-auto">
          <h2 className="text-[#ece1cf] text-sm font-semibold mb-4 sm:mb-6">
            STANDINGS
          </h2>

          {/* HEADER */}
          <div className="min-w-150 grid grid-cols-[40px_1fr_60px_60px_60px_60px_60px] text-[11px] sm:text-[12px] text-[#ece1cf]/60 pb-3 border-b border-[#ece1cf]/10">
            <span>#</span>
            <span>Team</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">D</span>
            <span className="text-center">L</span>
            <span className="text-center">PTS</span>
          </div>

          {/* ROWS */}
          <div className="mt-2 sm:mt-3 space-y-1 min-w-150">
            {standings.map((team, i) => (
              <div
                key={i}
                className={`grid grid-cols-[40px_1fr_60px_60px_60px_60px_60px] items-center text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 rounded-md transition-all ${
                  i === 0
                    ? "bg-[#e09225] text-black font-bold"
                    : "text-[#ece1cf] hover:bg-[#ece1cf]/5"
                }`}
              >
                <span>{team.pos}</span>

                <span className="font-medium truncate">{team.team}</span>

                <span className="text-center">{team.p}</span>
                <span className="text-center">{team.w}</span>
                <span className="text-center">{team.d}</span>
                <span className="text-center">{team.l}</span>

                <span className="text-center">{team.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-[#ece1cf] h-fit text-black rounded-2xl p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/sco/thumb/e/eb/Manchester_City_FC_badge.svg/1280px-Manchester_City_FC_badge.svg.png"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
          </div>

          <div className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-black/70">
            <p>Sunday — 17:30</p>
            <p>Etihad Stadium — Manchester</p>
          </div>

          <h3 className="text-3xl sm:text-5xl font-extrabold my-4 sm:my-6">
            03 MAR
          </h3>

          <div className="text-xs sm:text-sm font-semibold">
            <p>Manchester City</p>
            <p className="text-black/50">Aston Villa</p>
          </div>

          <div className="mt-4 sm:mt-6 border border-black/30 rounded-full py-2 text-[10px] sm:text-xs flex justify-between px-4 items-center">
            <span>BUY TICKETS</span>
            <span className="text-[#e09225]">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsSection;
