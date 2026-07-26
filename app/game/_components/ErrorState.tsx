"use client";

import { AlertTriangle, RefreshCw, ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showBack?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showBack = true,
}: ErrorStateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-6"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-500 text-sm max-w-sm">{message}</p>
      </div>
      <div className="flex gap-3 mt-2 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-[#e09225] text-[#0a1628] font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-[#e09225]/90 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh Page
        </button>
        {showBack && (
          <button
            onClick={() => router.push("/game/home")}
            className="px-5 py-2.5 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        )}
      </div>
    </motion.div>
  );
}
