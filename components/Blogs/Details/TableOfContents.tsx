"use client";

import { useState, useMemo, useEffect } from "react";
import { List, X } from "lucide-react";
import { Block } from "./types";

interface TableOfContentsProps {
  blocks: Block[];
}

export const TableOfContents = ({ blocks }: TableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Get only text blocks
  const textBlocks = useMemo(() => {
    return blocks.filter((block) => block.type === "text");
  }, [blocks]);

  // Create sections from odd-numbered paragraphs (1st, 3rd, 5th, etc.)
  const sections = useMemo(() => {
    return textBlocks
      .filter((_, index) => index % 2 === 0) // Get only odd-indexed (0, 2, 4, 6...) = 1st, 3rd, 5th paragraphs
      .map((block, filteredIndex) => {
        // Find the original index of this block in textBlocks
        const originalIndex = textBlocks.indexOf(block);

        // Clean up the text
        const cleanText = block.value
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Get the first sentence (up to first period) or first 80 characters
        const firstSentence = cleanText.split(".")[0] || cleanText;
        const title =
          firstSentence.length > 80
            ? firstSentence.substring(0, 80).trim() + "..."
            : firstSentence.trim();

        return {
          id: `section-${originalIndex}`, // Use original index to match with BlogContent
          title: title || `Section ${filteredIndex + 1}`,
          displayNumber: filteredIndex + 1, // 1, 2, 3, etc. for display
        };
      });
  }, [textBlocks]);

  // Track which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections
        .map((section) => document.getElementById(section.id))
        .filter(Boolean) as HTMLElement[];

      if (sectionElements.length === 0) return;

      // Find the last section that's above the viewport
      const current = sectionElements.findLast((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= 150;
      });

      if (current) {
        setActiveSection(current.id);
      } else {
        // If we're above all sections, set first as active
        setActiveSection(sectionElements[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  // Don't render if there are less than 3 odd paragraphs
  if (sections.length < 2) return null;

  return (
    <>
      {/* Floating Button - Mobile */}
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
          fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:static md:w-64 md:shadow-none md:bg-transparent md:z-0
        `}
      >
        <div className="p-6 md:p-0 md:sticky md:top-24">
          <h4 className="text-sm font-bold uppercase text-[#06182e]/50 mb-4 tracking-wider">
            Jump to Section
          </h4>

          <nav className="space-y-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  group text-left w-full py-2.5 px-3 rounded-lg transition-all
                  ${
                    activeSection === section.id
                      ? "bg-[#e09225]/10 text-[#06182e]"
                      : "text-[#06182e]/50 hover:text-[#06182e]/70 hover:bg-[#06182e]/5"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`
                    text-xs mt-0.5 font-mono shrink-0 min-w-5 transition-colors
                    ${activeSection === section.id ? "text-[#e09225] font-bold" : "text-[#06182e]/30"}
                  `}
                  >
                    {String(section.displayNumber).padStart(2, "0")}
                  </span>
                  <span className="text-xs leading-relaxed line-clamp-2">
                    {section.title}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay - Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
