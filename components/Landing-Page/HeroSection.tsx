const dummyData = {
  id: 1,
  title: "FT: City 3–0 Liverpool",
  description:
    "City cruise past Liverpool with a dominant performance at the Etihad. Goals, control, and total authority from start to finish.",
  image:
    "https://media.telanganatoday.com/wp-content/uploads/2026/02/Premier-League-Man-City-stun-Liverpool-2-1-at-Anfield-to-keep-title-hopes-alive.jpg",
};

const HeroSection = ({ data = dummyData }) => {
  return (
    <div className="w-full bg-[#06182e] pt-20 sm:pt-28 px-4" data-scroll>
      <div className="px-4 sm:px-6 lg:px-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* LEFT - FEATURED */}
        <div
          className="lg:col-span-2 relative w-full h-[60vh] xs:h-[60vh] sm:h-[40vh] md:h-[40vh] lg:h-[56vh]  rounded-xl overflow-hidden bg-center bg-cover transition-all duration-700"
          style={{ backgroundImage: `url(${data?.image})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-[#06182e] via-[#06182e]/70 to-transparent" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 lg:p-10">
            <h1 className="uppercase text-[6vw] sm:text-[4vw] lg:text-[3rem] leading-[0.9] font-bold text-white">
              {data?.title}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#ece1cf] max-w-xl">
              {data?.description}
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <button className="bg-[#e09225] text-black font-bold px-4 sm:px-5 py-2 rounded-[5px] uppercase text-xs sm:text-sm">
                Match Hub
              </button>

              <button className="border border-[#ece1cf]/30 text-[#ece1cf] px-4 sm:px-5 py-2 rounded-[5px] uppercase text-xs sm:text-sm hover:bg-[#e09225] hover:text-black transition-all">
                Read Full Story
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT - STATS */}
        <div className="flex flex-col gap-4">
          {/* SCORECARD (always visible) */}
          <div className="bg-[#0a223f] p-5 rounded-xl">
            <div className="flex justify-center mb-4">
              <span className="text-xs px-4 py-1 border border-[#ece1cf]/20 rounded-full text-[#ece1cf]/70">
                FT
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-2 w-1/3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/sco/thumb/e/eb/Manchester_City_FC_badge.svg/1280px-Manchester_City_FC_badge.svg.png"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <p className="text-[10px] sm:text-xs text-[#ece1cf]/80 text-center">
                  51', 23'
                </p>
              </div>

              <div className="text-center w-1/3">
                <p className="text-2xl sm:text-3xl font-bold text-[#ece1cf] tracking-widest">
                  2 : 1
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 w-1/3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/hif/b/bd/Liverpool_FC.png"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <p className="text-[10px] sm:text-xs text-[#ece1cf]/80 text-center">
                  14'
                </p>
              </div>
            </div>
          </div>

          {/* HIDE BELOW ON MOBILE */}
          <div className="hidden sm:flex flex-col gap-4">
            {/* Top Scorers */}
            <div className="bg-[#0a223f] p-4 rounded-xl">
              <h3 className="text-[#ece1cf] uppercase text-xs mb-3">
                Top Scorers
              </h3>

              {[
                { name: "Haaland", value: 18 },
                { name: "Foden", value: 10 },
                { name: "Alvarez", value: 8 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between text-[#ece1cf] py-1 border-b border-white/5 last:border-none text-sm"
                >
                  <span>{p.name}</span>
                  <span className="text-[#e09225] font-bold">{p.value}</span>
                </div>
              ))}
            </div>

            {/* Top Assists */}
            <div className="bg-[#0a223f] p-4 rounded-xl">
              <h3 className="text-[#ece1cf] uppercase text-xs mb-3">
                Top Assists
              </h3>

              {[
                { name: "De Bruyne", value: 12 },
                { name: "Silva", value: 9 },
                { name: "Doku", value: 7 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between text-[#ece1cf] py-1 border-b border-white/5 last:border-none text-sm"
                >
                  <span>{p.name}</span>
                  <span className="text-[#e09225] font-bold">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
