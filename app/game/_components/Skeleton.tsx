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

export function SkeletonLeaderboard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-4 py-2">
        <Skeleton className="w-8 h-4 rounded" />
        <Skeleton className="flex-1 h-4 rounded" />
        <Skeleton className="w-12 h-4 rounded" />
        <Skeleton className="w-12 h-4 rounded" />
        <Skeleton className="w-12 h-4 rounded" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
          <Skeleton className="w-8 h-6 rounded" />
          <Skeleton className="flex-1 h-5 rounded" />
          <Skeleton className="w-14 h-6 rounded" />
          <Skeleton className="w-10 h-4 rounded" />
          <Skeleton className="w-10 h-4 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonMatchDetail() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center space-y-2">
            <Skeleton className="w-16 h-4 mx-auto rounded" />
            <Skeleton className="w-12 h-12 mx-auto rounded" />
          </div>
          <div className="px-4">
            <Skeleton className="w-1 h-16 rounded" />
          </div>
          <div className="flex-1 text-center space-y-2">
            <Skeleton className="w-16 h-4 mx-auto rounded" />
            <Skeleton className="w-12 h-12 mx-auto rounded" />
          </div>
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <Skeleton className="w-10 h-4 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="flex-1 h-5 rounded" />
          <Skeleton className="w-10 h-5 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
      <Skeleton className="h-10 w-20 rounded-lg" />
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-36 h-7 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <Skeleton className="w-16 h-16 rounded" />
        </div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="flex-1 h-3 rounded-full" />
            <Skeleton className="w-8 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
