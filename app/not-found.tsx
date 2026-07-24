"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouse = (e: MouseEvent) => {
      const rect = img.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) * 0.03;
      targetY = (e.clientY - centerY) * 0.03;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      img.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouse);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#FFF5E5] overflow-hidden flex items-center justify-center">
      {/* Abstract decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circle top-right */}
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full border border-[#e09225]/8" />
        <div className="absolute -top-36 -right-36 w-[500px] h-[500px] rounded-full border border-[#e09225]/5" />

        {/* Circle bottom-left */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full border border-[#06182e]/5" />

        {/* Dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, #06182e 0.8px, transparent 0.8px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Accent lines */}
        <div className="absolute top-1/4 right-0 w-32 h-px bg-gradient-to-l from-[#e09225]/20 to-transparent" />
        <div className="absolute bottom-1/3 left-0 w-48 h-px bg-gradient-to-r from-[#e09225]/15 to-transparent" />
      </div>

      <div
        className={`relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left — Image */}
          <div className="w-full lg:w-[55%] relative flex-shrink-0">
            <div className="relative">
              <img
                ref={imgRef}
                src="/404.png"
                alt="404 error illustration"
                className="w-full h-auto object-contain relative z-10 drop-shadow-2xl"
                style={{ willChange: "transform" }}
              />

              {/* Subtle glow under image */}
              <div className="absolute -inset-10 bg-gradient-to-r from-[#e09225]/5 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            {/* Floating "404" text behind image */}
            <div
              className="absolute -top-12 -left-8 text-[200px] sm:text-[280px] font-black text-[#06182e]/[0.03] leading-none pointer-events-none select-none"
              aria-hidden
            >
              404
            </div>
          </div>

          {/* Right — Content */}
          <div className="w-full lg:w-[45%] text-center lg:text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#06182e]/8 shadow-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-[#e09225]" />
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#06182e]/50">
                Lost in space
              </span>
            </div>

            {/* Big heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#06182e] leading-[0.88] tracking-tight">
              Page not
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-[#e09225]">found</span>
                <span className="absolute -bottom-1 left-0 right-2 h-3 bg-[#e09225]/15 -rotate-1 rounded-sm" />
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-[#06182e]/50 max-w-sm mx-auto lg:mx-0 leading-relaxed font-light">
              This page has wandered off somewhere unknown. No worries — we&apos;ll get you back on solid ground.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
              <Link
                href="/"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#e09225] text-white font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#e09225]/25 hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <Home size={16} />
                Back to Home
                <ArrowLeft size={14} className="rotate-180 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => window.history.back()}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border-2 border-[#06182e]/10 text-[#06182e]/50 font-semibold text-sm hover:bg-white hover:border-[#06182e]/20 hover:text-[#06182e]/70 transition-all duration-300"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Go Back
              </button>
            </div>

            {/* Bottom decorative */}
            <div className="mt-14 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06182e]/10 to-transparent" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#06182e]/15">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06182e]/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
