import type { LucideIcon } from "lucide-react";

/* ── Time helpers ─────────────────────────────────────────── */

export function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr).getTime();
  if (Number.isNaN(date)) return "";
  const diffMs = Date.now() - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBestTime(ms?: number | null): string {
  if (!ms) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(
    millis / 100,
  )}`;
}

/* ── Stat tile ────────────────────────────────────────────── */

export function StatTile({
  icon: Icon,
  label,
  value,
  suffix = "",
  accent = "#e09225",
  bg = "bg-[#e09225]/8",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  accent?: string;
  bg?: string;
}) {
  return (
    <div
      className={`${bg} rounded-2xl border border-[#06182e]/5 p-4 sm:p-5 transition-all duration-300 hover:border-[#06182e]/10 hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#06182e]/40 para">
          {label}
        </span>
        <Icon size={16} style={{ color: accent }} />
      </div>
      <p className="text-3xl sm:text-4xl text-[#06182e] font-bold tracking-tight leading-none tabular-nums">
        {value}
        {suffix && (
          <span className="text-base sm:text-lg text-[#06182e]/35 ml-1 font-medium capitalize">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

/* ── Skeleton blocks ──────────────────────────────────────── */

export function TileSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5 p-4 sm:p-5 animate-pulse ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-2 w-16 rounded bg-[#06182e]/8" />
        <div className="h-4 w-4 rounded bg-[#06182e]/8" />
      </div>
      <div className="h-8 w-20 rounded bg-[#06182e]/8" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-[#e09225]/8 rounded-xl border border-[#06182e]/5 p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-[#06182e]/8 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-[#06182e]/8" />
            <div className="h-3 w-3/5 rounded bg-[#06182e]/6" />
          </div>
          <div className="h-6 w-14 rounded-md bg-[#06182e]/8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  message,
  ctaLabel,
  onCta,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-[#e09225]/8 rounded-2xl border border-[#06182e]/5">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF5E5] flex items-center justify-center mb-3">
        <Icon size={24} className="text-[#e09225]/60" />
      </div>
      <p className="text-base font-bold text-[#06182e]/70">{title}</p>
      <p className="text-sm text-[#06182e]/40 para mt-1 max-w-xs">{message}</p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e09225] text-[#FFF5E5] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

/* ── Stars (1–5) ──────────────────────────────────────────── */

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#e09225" : "rgba(6,24,46,0.12)"}
          className="transition-colors"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
