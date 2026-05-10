export default function BlogCardSkeleton() {
  return (
    <div
      className="
        animate-pulse
        bg-white
        border border-[#06182e]/10
        rounded-2xl
        overflow-hidden
      "
    >
      {/* Image */}
      <div className="h-56 bg-[#06182e]/5" />

      <div className="p-5 space-y-4">
        {/* Status */}
        <div className="w-20 h-6 rounded-full bg-[#06182e]/5" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 rounded bg-[#06182e]/5" />
          <div className="h-4 w-3/4 rounded bg-[#06182e]/5" />
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="w-12 h-4 rounded bg-[#06182e]/5" />
          <div className="w-12 h-4 rounded bg-[#06182e]/5" />
          <div className="w-12 h-4 rounded bg-[#06182e]/5" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <div className="flex-1 h-11 rounded-xl bg-[#06182e]/5" />
          <div className="w-11 h-11 rounded-xl bg-[#06182e]/5" />
        </div>
      </div>
    </div>
  );
}
