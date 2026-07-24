"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { X, Zap } from "lucide-react";
import api from "@/lib/api/axios";

const DISMISSED_KEY = "tcc_dc_banner_dismissed";
const DISMISS_HOURS = 1; // 1 hour cooldown
const SHOW_DELAY_MS = 8_000; // 8 seconds after page load

export function DailyChallengeBanner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [hasActive, setHasActive] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [checkDone, setCheckDone] = useState(false);
  const timerDone = useRef(false);

  // ── Check if dismissed ──
  const isDismissed = (): boolean => {
    const val = localStorage.getItem(DISMISSED_KEY);
    if (!val) return false;
    return Date.now() < parseInt(val, 10);
  };

  // ── Check API for active challenge ──
  useEffect(() => {
    if (authLoading) return;

    const check = async () => {
      try {
        const res = await api.get("/daily-challenge/public-check");
        const data = res.data;
        setHasActive(data.hasActive);
        setCompleted(data.completed || false);
      } catch {
        setHasActive(false);
      } finally {
        setCheckDone(true);
      }
    };

    check();
  }, [authLoading]);

  // ── Show after delay if conditions met ──
  useEffect(() => {
    if (!checkDone || hasActive === null || isDismissed()) return;
    if (completed) return; // Already did today's challenge
    if (!hasActive) return; // No active challenge

    const timer = setTimeout(() => {
      timerDone.current = true;
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [checkDone, hasActive, completed]);

  // ── Handle CTA click ──
  const handlePlay = useCallback(() => {
    setVisible(false);
    if (!user) {
      router.push("/login?redirect=/daily-challenge");
    } else {
      router.push("/daily-challenge");
    }
  }, [user, router]);

  // ── Handle dismiss ──
  const dismiss = useCallback(() => {
    setVisible(false);
    const expiry = Date.now() + DISMISS_HOURS * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, expiry.toString());
  }, []);

  // Only show on the landing page
  if (pathname !== "/") return null;

  // Don't render until we know if there's an active challenge
  if (!visible || hasActive !== true || completed) return null;

  // Offset above the PWA prompt if it might be visible
  const pwaDismissed = localStorage.getItem("tcc_pwa_dismissed");
  const pwaActive = !pwaDismissed || Date.now() >= parseInt(pwaDismissed, 10);

  return (
    <div
      className={`fixed left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[51] animate-slide-up ${
        pwaActive ? "bottom-[90px]" : "sm:bottom-6 bottom-4"
      }`}
    >
      <div className="relative bg-[#FFF5E5] border border-[#e09225]/30 rounded-2xl shadow-2xl p-5">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-[#06182e]/30 hover:text-[#06182e] transition"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#e09225]/15 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={20} className="text-[#e09225]" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#06182e] text-sm leading-tight">
              Try TCC Daily Challenge!
            </p>
            <p className="text-xs text-[#06182e]/50 mt-1 leading-relaxed">
              Test your football knowledge. Answer 5 timed questions and climb
              the leaderboard.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            className="flex-1 py-2.5 rounded-xl bg-[#e09225] text-[#06182e] text-sm font-bold hover:brightness-110 transition-all"
          >
            {user ? "Play now" : "Sign in to play"}
          </button>
          <button
            onClick={dismiss}
            className="px-4 py-2.5 rounded-xl bg-[#06182e]/5 text-[#06182e]/60 text-sm font-medium hover:bg-[#06182e]/10 transition-all"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
