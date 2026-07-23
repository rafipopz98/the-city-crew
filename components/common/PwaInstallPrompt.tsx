"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";

const DISMISSED_KEY = "tcc_pwa_dismissed";
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 15_000; // 15 seconds

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Non-intrusive install banner for the PWA.
 *
 * - Shows after 15 seconds if the browser supports installation
 * - On iOS: shows instructions (Safari doesn't fire beforeinstallprompt)
 * - Stores "dismissed" in localStorage for 30 days
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const showTimerDone = useRef(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  // ── Check dismissal ──────────────────────────────────────────────
  const isDismissed = (): boolean => {
    const val = localStorage.getItem(DISMISSED_KEY);
    if (!val) return false;
    return Date.now() < parseInt(val, 10);
  };

  // ── Listen for beforeinstallprompt ────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
      setDeferredPrompt(promptEvent);
      // If the 15s timer already elapsed, show immediately
      if (showTimerDone.current && !isDismissed()) {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Show banner after a delay (runs only once via isIOS dep) ──────
  useEffect(() => {
    if (isDismissed()) return;

    const timer = setTimeout(() => {
      showTimerDone.current = true;
      // Use ref to avoid re-running this effect when deferredPrompt changes
      if (deferredPromptRef.current || isIOS) {
        setVisible(true);
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isIOS]);

  // ── Handle dismiss ────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setVisible(false);
    const expiry = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, expiry.toString());
  }, []);

  // ── Handle install ────────────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setVisible(false);
    }
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-6 sm:w-96 z-50 animate-slide-up">
      <div className="relative bg-[#FFF5E5] border border-[#e09225]/30 rounded-2xl shadow-2xl p-5">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-[#06182e]/30 hover:text-[#06182e] transition"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        {isIOS ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📱</span>
              <p className="font-bold text-[#06182e] text-sm">
                Install TCC on iPhone
              </p>
            </div>
            <p className="text-xs text-[#06182e]/60 mb-3 leading-relaxed">
              Tap{" "}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#06182e]/5 text-[#06182e] font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v8M8 12h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Share
              </span>{" "}
              →{" "}
              <span className="font-medium text-[#06182e]">
                Add to Home Screen
              </span>
            </p>
            <button
              onClick={dismiss}
              className="w-full py-2.5 rounded-xl bg-[#06182e] text-[#FFF5E5] text-sm font-semibold hover:opacity-90 transition"
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚽</span>
              <div>
                <p className="font-bold text-[#06182e] text-sm">
                  Never miss a City update
                </p>
                <p className="text-xs text-[#06182e]/50">
                  Install TCC for faster loading &amp; full-screen experience
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 rounded-xl bg-[#e09225] text-[#06182e] text-sm font-bold hover:opacity-90 transition"
              >
                Install App
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-2.5 rounded-xl bg-[#06182e]/5 text-[#06182e]/60 text-sm font-medium hover:bg-[#06182e]/10 transition"
              >
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
