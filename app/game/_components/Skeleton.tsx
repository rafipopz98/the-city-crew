"use client";

import { motion } from "framer-motion";

const shimmer = `
  relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
`;

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 rounded-lg ${shimmer} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`aspect-3/4 rounded-xl bg-white/5 border border-white/5 p-3 ${className}`}>
      <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
      <Skeleton className="w-8 h-6 rounded mx-auto mb-1" />
      <Skeleton className="w-16 h-3 rounded mx-auto mb-1" />
      <Skeleton className="w-10 h-4 rounded mx-auto" />
    </div>
  );
}

export function SkeletonPlayerRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <Skeleton className="w-10 h-6 rounded" />
    </div>
  );
}

export function SkeletonGrid({ count = 12, columns = 6 }: { count?: number; columns?: number }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, count)}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
          <Skeleton className="w-12 h-3 rounded mb-2" />
          <Skeleton className="w-16 h-7 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSquadSlots() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonPlayerRow key={i} />
      ))}
    </div>
  );
}
