"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Loading() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);

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

    gsap.fromTo(
      blocksRef.current,
      {
        scaleX: 0,
        transformOrigin: "left",
      },
      {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.out",
      },
    );
  }, []);

  return <div ref={overlayRef} className="transition-overlay" />;
}
