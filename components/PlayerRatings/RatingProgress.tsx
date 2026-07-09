"use client";

type Props = {
  current: number;
  total: number;
  compact?: boolean;
};

export default function RatingProgress({
  current,
  total,
  compact = false,
}: Props) {
  const percentage = (current / total) * 100;

  if (compact) {
    return (
      <div className="text-sm text-black/40 font-medium">
        {current} / {total}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.35em] text-black/35">
          Progress
        </span>
        <span className="text-sm text-black/45">
          {current} of {total}
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-black/15 border border-black/10">
        <div
          className="h-full rounded-full bg-[#e09225] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
