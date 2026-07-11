export const MatchesSectionSkeleton = () => (
  <div className="w-full bg-[#06182e] py-16 px-4">
    <div className="max-w-7xl mx-auto text-center">
      <div className="animate-pulse space-y-8">
        <div className="h-16 bg-[#ece1cf]/10 rounded w-64 mx-auto" />
        <div className="h-16 bg-[#ece1cf]/10 rounded w-64 mx-auto" />
      </div>
    </div>
  </div>
);

export const MatchCardSkeleton = () => (
  <div className="min-w-75 lg:min-w-0 bg-[#ece1cf] rounded-2xl p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-black/10 rounded" />
        <div className="h-4 w-20 bg-black/10 rounded" />
      </div>
      <div className="h-6 w-10 bg-black/10 rounded" />
    </div>
    <div className="h-12 w-32 bg-black/10 rounded my-6" />
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-black/10 rounded" />
        <div className="h-4 w-24 bg-black/10 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-black/10 rounded" />
        <div className="h-4 w-24 bg-black/10 rounded" />
      </div>
    </div>
    <div className="mt-4 space-y-1">
      <div className="h-3 w-16 bg-black/10 rounded" />
      <div className="h-3 w-20 bg-black/10 rounded" />
    </div>
    <div className="mt-6 h-10 bg-black/10 rounded-full" />
  </div>
);
