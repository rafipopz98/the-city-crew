const PollCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl border border-[#06182e]/10 bg-[#ece1cf]/35 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-6 w-20 rounded-full bg-[#06182e]/10" />
        <div className="h-4 w-16 rounded bg-[#06182e]/10" />
      </div>

      <div className="space-y-3">
        <div className="h-6 w-5/6 rounded bg-[#06182e]/10" />
        <div className="h-6 w-3/5 rounded bg-[#06182e]/10" />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[#06182e]/10 pt-4">
        <div className="h-4 w-20 rounded bg-[#06182e]/10" />
        <div className="h-4 w-24 rounded bg-[#06182e]/10" />
      </div>
    </div>
  );
};

export default PollCardSkeleton;
