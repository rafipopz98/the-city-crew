"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import MatchRow, { GoalScorer } from "./MatchRow";

type Props = {
  search: string;
  season: string;
  competition: string;
  status: string;
  onEdit: (match: any) => void;
  refreshTrigger?: number;
};

const MATCHES_PER_PAGE = 10;

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [];
  // Always show first page
  pages.push(1);
  if (current > 3) pages.push("...");
  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  // Always show last page
  if (total > 1) pages.push(total);
  return pages;
}

const MatchesTable = ({
  search,
  season,
  competition,
  status,
  onEdit,
  refreshTrigger = 0,
}: Props) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMatches = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (season) params.append("season", season);
        if (competition) params.append("competition", competition);
        if (status) params.append("status", status);
        params.append("page", page.toString());
        params.append("limit", MATCHES_PER_PAGE.toString());

        const response = await fetch(`/api/admin/matches?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await response.json();

        setMatches(data.matches || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } catch (error) {
        console.error(error);
        setError("Failed to load matches.");
      } finally {
        setLoading(false);
      }
    },
    [search, season, competition, status],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchMatches(1);
  }, [fetchMatches, refreshTrigger]);

  const handleDelete = async (matchId: string) => {
    const confirmed = window.confirm(
      "Delete this match? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete match");
      }

      toast.success("Match deleted");
      fetchMatches(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete match");
    }
  };

  const handleScoreUpdate = async (
    matchId: string,
    homeScore: number,
    awayScore: number,
    goalScorers: GoalScorer[],
    lineup: string[],
  ) => {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeTeamScore: homeScore,
          awayTeamScore: awayScore,
          goalScorers,
          lineup,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update score");
      }

      toast.success("Score updated");
      fetchMatches(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update score");
      throw error;
    }
  };

  const handlePageChange = (page: number) => {
    fetchMatches(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="py-28">
        <div className="flex flex-col items-center">
          <Loader2 size={30} className="animate-spin text-black/30" />
          <p className="mt-5 text-black/45">Loading matches...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-28 text-center">
        <h2 className="para text-5xl uppercase text-red-600">Error</h2>
        <p className="mt-5 text-black/45">{error}</p>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="py-28 text-center">
        <h2 className="para text-5xl uppercase">No Matches</h2>
        <p className="mt-5 text-black/45">
          No fixtures match your current filters.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="divide-y divide-black/10">
        {matches.map((match) => (
          <MatchRow
            key={match._id}
            match={match}
            onEdit={onEdit}
            onDelete={handleDelete}
            onScoreUpdate={handleScoreUpdate}
          />
        ))}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
          <div className="flex items-center justify-center gap-2 order-2 sm:order-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border border-black/20 px-3 sm:px-4 py-2 uppercase text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition"
            >
              Previous
            </button>

            {/* Page numbers - show limited on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              {getPageNumbers(currentPage, totalPages).map((page, i) =>
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-10 flex items-center justify-center text-sm text-black/30">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`
                      w-8 h-10 flex items-center justify-center border text-sm
                      transition-all duration-300
                      ${
                        currentPage === page
                          ? "border-[#e09225] bg-[#e09225] text-black"
                          : "border-black/20 hover:border-black hover:bg-black hover:text-white"
                      }
                    `}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Mobile: just show current/total */}
            <span className="sm:hidden text-xs text-black/50 px-2 whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border border-black/20 px-3 sm:px-4 py-2 uppercase text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition"
            >
              Next
            </button>
          </div>

          <p className="hidden sm:block text-sm text-black/50 order-1 sm:order-2 ml-0 sm:ml-4">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </>
  );
};

export default MatchesTable;
