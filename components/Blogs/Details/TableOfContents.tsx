"use client";

import { useState, useEffect } from "react";
import { List, X } from "lucide-react";
import { Block } from "./types";

interface TableOfContentsProps {
  blocks: Block[];
}

export const TableOfContents = ({ blocks }: TableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const headings = blocks.filter((block) => block.type === "heading");

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((_, i) =>
        document.getElementById(`heading-${i}`),
      );

      const current = headingElements.findLast((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 100;
      });

      if (current) {
        setActiveId(current.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-[#06182e] text-white p-3 rounded-full shadow-lg hover:bg-[#0a223f] transition-all md:hidden"
        aria-label="Table of contents"
      >
        {isOpen ? <X size={20} /> : <List size={20} />}
      </button>

      {/* TOC Panel */}
      <div
        className={`
          fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:static md:w-64 md:shadow-none md:bg-transparent md:z-0
        `}
      >
        <div className="p-6 md:p-0 md:sticky md:top-24">
          <h4 className="text-sm font-bold uppercase text-[#06182e]/50 mb-4 tracking-wider">
            On this page
          </h4>
          <nav className="space-y-2">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#heading-${index}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(`heading-${index}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setIsOpen(false);
                }}
                className={`
                  block text-sm py-1 border-l-2 pl-3 transition-all
                  ${
                    activeId === `heading-${index}`
                      ? "border-[#e09225] text-[#06182e] font-medium"
                      : "border-transparent text-[#06182e]/50 hover:text-[#06182e]/70 hover:border-[#06182e]/20"
                  }
                  ${heading.level === 3 ? "ml-3" : ""}
                `}
              >
                {heading.value}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
