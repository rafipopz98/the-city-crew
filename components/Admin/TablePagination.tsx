"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Responsive pagination: numbered buttons on desktop, a compact scrollable
 * strip on mobile, always with Prev/Next + "Page X of Y" so it never breaks
 * the layout on small screens.
 */
export function TablePagination({
  page,
  totalPages,
  total,
  itemLabel = "items",
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    if (total === undefined) return null;
    return (
      <div className="flex items-center justify-center sm:justify-end px-4 py-3 text-xs text-[#06182e]/50">
        {total} {itemLabel}
      </div>
    );
  }

  // Window of page numbers around the current page (mobile shows fewer).
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(0, Math.min(page - 3, totalPages - 5));
  const windowPages = pages.slice(start, Math.max(start + 5, Math.min(page + 2, totalPages)));

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#06182e]/8">
      {/* Info */}
      <p className="text-xs text-[#06182e]/50 text-center sm:text-left order-2 sm:order-1">
        Page {page} of {totalPages}
        {total !== undefined && (
          <span className="hidden sm:inline">
            {" "}
            · {total} {itemLabel}
          </span>
        )}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-1 order-1 sm:order-2 flex-wrap">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg bg-white border border-[#06182e]/10 text-[#06182e]/70 text-xs font-medium hover:bg-[#f4ebda] disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers — hidden on the smallest screens */}
        <div className="hidden sm:flex items-center gap-1">
          {windowPages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-[0.95] ${
                p === page
                  ? "bg-[#e09225] text-[#06182e] shadow-sm"
                  : "bg-white border border-[#06182e]/10 text-[#06182e]/60 hover:bg-[#f4ebda]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg bg-white border border-[#06182e]/10 text-[#06182e]/70 text-xs font-medium hover:bg-[#f4ebda] disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
