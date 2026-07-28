"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Coins, User } from "lucide-react";
import { getRarityTheme } from "@/app/game/_components";
import { isGK, GK_STATS_CONFIG, FIELD_STATS_CONFIG } from "@/lib/game/utils/positionMapping";
import confetti from "canvas-confetti";

interface PurchaseCelebrationProps {
  player: any;
  coins: number;
  onClose: () => void;
}

export default function PurchaseCelebration({ player, coins, onClose }: PurchaseCelebrationProps) {
  const theme = getRarityTheme(player.rarity);
  const [stage, setStage] = useState<"entering" | "show" | "exiting">("entering");
  const [statsVisible, setStatsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const customConfettiRef = useRef<ReturnType<typeof confetti.create> | null>(null);

  // ── Determine if GK by positions AND actual stat values ──
  const isPlayerGK = isGK(player.positions) || (
    // Fallback: check if GK stats are populated and field stats are minimal
    (player.goalkeeping_diving || 0) + (player.goalkeeping_reflexes || 0) >
    (player.pace || 0) + (player.shooting || 0)
  );
  const stats = (isPlayerGK ? GK_STATS_CONFIG : FIELD_STATS_CONFIG).slice(0, 6);
  const ovr = player.effective_overall || player.overall || 0;

  // ── Initialize custom confetti instance ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || customConfettiRef.current) return;
    const instance = confetti.create(canvas, { resize: true, useWorker: true });
    if (instance) customConfettiRef.current = instance;
  }, []);

  // ── Run confetti on mount ──
  useEffect(() => {
    setStage("show");

    const myConfetti = customConfettiRef.current;
    if (!myConfetti) return;

    const duration = 4000;
    const end = Date.now() + duration;
    let rAFId: number;

    const baseOpts = {
      colors: [theme.accent, "#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3"],
    };

    const frame = () => {
      myConfetti({
        ...baseOpts,
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        startVelocity: 30 + Math.random() * 20,
        ticks: 100,
      });
      myConfetti({
        ...baseOpts,
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        startVelocity: 30 + Math.random() * 20,
        ticks: 100,
      });

      if (Date.now() < end) rAFId = requestAnimationFrame(frame);
    };

    rAFId = requestAnimationFrame(frame);

    // Big burst at start
    const burstTimer = setTimeout(() => {
      myConfetti({
        ...baseOpts,
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        startVelocity: 45,
        ticks: 200,
      });
    }, 100);

    // Show stats after a delay
    timerRef.current = setTimeout(() => setStatsVisible(true), 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rAFId) cancelAnimationFrame(rAFId);
      clearTimeout(burstTimer);
      // Reset custom confetti
      if (myConfetti) myConfetti.reset();
    };
  }, [theme.accent]);

  // ── Close handler ──
  const handleClose = () => {
    setStage("exiting");
    setTimeout(onClose, 400);
  };

  return (
    <AnimatePresence>
      {stage !== "exiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={handleClose}
        >
          {/* ── Custom confetti canvas ── */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[200]"
          />

          {/* ── Backdrop ── */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* ── Main Card ── */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90%] sm:max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{ boxShadow: `0 0 60px ${theme.accent}30, 0 0 120px ${theme.accent}10` }}
          >
            {/* ── Background layers ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#050a1a] via-[#0a1628] to-[#050a1a]" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}00 0%, ${theme.accent} 25%, ${theme.accent}00 50%, ${theme.accent} 75%, ${theme.accent}00 100%)`,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.1] animate-pulse"
              style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-[0.06]"
              style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
            />

            {/* ── Close button ── */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── Content ── */}
            <div className="relative z-10 p-6 sm:p-8 text-center">
              {/* ── Badge ── */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 14, delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}25, ${theme.accent}10)`,
                  border: `1px solid ${theme.accent}30`,
                  color: theme.accent,
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-[0.15em]">PURCHASED!</span>
              </motion.div>

              {/* ── "NEW PLAYER" text ── */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium mb-3"
              >
                New player acquired
              </motion.p>

              {/* ── Player image ── */}
              <motion.div
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.25 }}
                className="flex justify-center mb-3"
              >
                <div
                  className="w-[100px] h-[100px] rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    border: `3px solid ${theme.accent}40`,
                    boxShadow: `0 0 30px ${theme.accent}25, 0 0 60px ${theme.accent}10`,
                  }}
                >
                  {player.image_url ? (
                    <img
                      src={player.image_url}
                      alt={player.short_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white/30" />
                  )}
                </div>
              </motion.div>

              {/* ── Player name + OVR ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  {player.short_name}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {player.positions?.slice(0, 3).map((pos: string) => (
                    <span key={pos} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-400">
                      {pos}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* ── OVR Display ── */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.35 }}
                className="mt-4 mb-4"
              >
                <div
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}05)`,
                    border: `1px solid ${theme.accent}25`,
                  }}
                >
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">OVR</span>
                  <span
                    className="text-3xl sm:text-4xl font-black tabular-nums leading-none"
                    style={{ color: theme.accent, textShadow: `0 0 15px ${theme.accent}40` }}
                  >
                    {ovr}
                  </span>
                </div>
              </motion.div>

              {/* ── Stats grid ── */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: statsVisible ? "auto" : 0, opacity: statsVisible ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {stats.map((s, i) => {
                    const val = player[`effective_${s.key}`] || player[s.key] || 0;
                    return (
                      <motion.div
                        key={s.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + i * 0.05 }}
                        className="rounded-lg py-2 text-center"
                        style={{
                          background: `linear-gradient(180deg, ${theme.accent}10, transparent)`,
                          border: `1px solid ${theme.accent}12`,
                        }}
                      >
                        <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">{s.short}</div>
                        <div className="text-sm font-black tabular-nums text-white/90 mt-0.5">{val}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* ── Rarity + Coins spent ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}25, ${theme.accent}10)`,
                    color: theme.accent,
                    border: `1px solid ${theme.accent}25`,
                  }}
                >
                  {theme.label}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400/80 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  {coins.toLocaleString()} coins
                </span>
              </motion.div>

              {/* ── Continue button ── */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                  color: "#050a1a",
                  boxShadow: `0 4px 20px ${theme.accent}30`,
                }}
              >
                <Check className="w-4 h-4" />
                Continue
              </motion.button>

              {/* ── Bottom branding ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-3 flex items-center justify-center gap-1.5"
              >
                <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.15em]">The City Crew</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
