"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Loading() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!overlayRef.current) return;

    overlayRef.current.innerHTML = "";
    blocksRef.current = [];

    for (let i = 0; i < 20; i++) {
      const block = document.createElement("div");

      block.className = "block";

      overlayRef.current.appendChild(block);

      blocksRef.current.push(block);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setShow(false);
      },
    });

    // COVER
    tl.set(blocksRef.current, {
      scaleX: 0,
      transformOrigin: "left",
    });

    tl.to(blocksRef.current, {
      scaleX: 1,
      duration: 0.4,
      stagger: 0.02,
      ease: "power2.out",
    });

    // HOLD
    tl.to({}, { duration: 0.15 });

    // REVEAL (your old effect)
    tl.set(blocksRef.current, {
      scaleX: 1,
      transformOrigin: "right",
    });

    tl.to(blocksRef.current, {
      scaleX: 0,
      duration: 0.4,
      stagger: 0.02,
      ease: "power2.out",
    });
  }, []);

  if (!show) return null;

  return <div ref={overlayRef} className="transition-overlay" />;
}
