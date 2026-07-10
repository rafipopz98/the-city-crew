"use client";

import { useRef, useSyncExternalStore } from "react";

const SCROLL_THRESHOLD = 100;
const TOP_THRESHOLD = 50;

export interface ScrollState {
  isVisible: boolean;
  isAtTop: boolean;
}

const INITIAL_STATE: ScrollState = { isVisible: true, isAtTop: true };

/**
 * Replaces the old setTimeout-based throttle with requestAnimationFrame
 * batching via useSyncExternalStore — the primitive React 18/19 gives you
 * specifically for subscribing to external mutable state like window.scrollY.
 *
 * Two real wins over the old approach:
 *  1. rAF instead of a 100ms setTimeout means updates are synced to paint,
 *     not to an arbitrary timer, so it can't fall a frame behind or double-fire.
 *  2. It only calls the React `callback` (triggering a re-render) when
 *     isVisible/isAtTop actually change — not on every scroll event, which
 *     the old version did every 100ms regardless of whether anything changed.
 */
export function useScrollDirection(): ScrollState {
  const lastScrollY = useRef(0);
  const state = useRef<ScrollState>(INITIAL_STATE);
  const rafId = useRef<number | null>(null);

  return useSyncExternalStore(
    (onStoreChange) => {
      const handleScroll = () => {
        if (rafId.current !== null) return;

        rafId.current = requestAnimationFrame(() => {
          rafId.current = null;

          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY.current;

          const next: ScrollState = {
            isVisible: !(scrollingDown && currentScrollY > SCROLL_THRESHOLD),
            isAtTop: currentScrollY < TOP_THRESHOLD,
          };

          lastScrollY.current = currentScrollY;

          if (
            next.isVisible !== state.current.isVisible ||
            next.isAtTop !== state.current.isAtTop
          ) {
            state.current = next;
            onStoreChange();
          }
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      };
    },
    () => state.current,
    () => INITIAL_STATE // server snapshot
  );
}