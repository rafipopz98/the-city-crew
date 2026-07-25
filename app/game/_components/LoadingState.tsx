"use client";

import { Loader } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
    >
      <div className="w-10 h-10 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{text}</p>
    </motion.div>
  );
}

export function LoadingSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8";
  return (
    <div className={`${dims} border-2 border-[#e09225] border-t-transparent rounded-full animate-spin`} />
  );
}
