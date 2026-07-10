export const FeaturedStorySkeleton = () => (
  <div className="lg:col-span-2 relative w-full h-[60vh] xs:h-[60vh] sm:h-[40vh] md:h-[40vh] lg:h-[56vh] rounded-xl overflow-hidden bg-[#0a1f3a] animate-pulse">
    <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 lg:p-10">
      <div className="h-12 sm:h-16 lg:h-20 bg-[#0d2a4a] rounded-lg w-3/4 mb-4" />
      <div className="flex gap-3">
        <div className="h-10 w-28 bg-[#0d2a4a] rounded-md" />
        <div className="h-10 w-36 bg-[#0d2a4a] rounded-md" />
      </div>
    </div>
  </div>
);

export const MatchCardSkeleton = () => (
  <div className="bg-[#0a223f] p-5 rounded-xl animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 w-20 bg-[#0d2a4a] rounded" />
      <div className="h-6 w-12 bg-[#0d2a4a] rounded-full" />
    </div>
    <div className="flex items-center justify-between">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-10 h-10 bg-[#0d2a4a] rounded-full" />
          <div className="h-3 w-16 bg-[#0d2a4a] rounded" />
        </div>
      ))}
    </div>
    <div className="h-3 w-24 bg-[#0d2a4a] rounded mx-auto mt-3" />
  </div>
);

export const PlayerListSkeleton = () => (
  <div className="bg-[#0a223f] p-4 rounded-xl animate-pulse">
    <div className="h-4 w-24 bg-[#0d2a4a] rounded mb-3" />
    {[1, 2].map((i) => (
      <div
        key={i}
        className="flex items-center justify-between py-2 border-b border-white/5 last:border-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#0d2a4a] rounded" />
          <div className="w-6 h-6 bg-[#0d2a4a] rounded-full" />
          <div className="h-4 w-20 bg-[#0d2a4a] rounded" />
        </div>
        <div className="h-4 w-6 bg-[#0d2a4a] rounded" />
      </div>
    ))}
  </div>
);
