"use client";

import { Loader2, SearchX } from "lucide-react";

import MatchCard from "./MatchCard";

type Match = {
  _id: string;
  homeTeam: {
    name: string;
    image: string;
  };
  awayTeam: {
    name: string;
    image: string;
  };
  homeTeamScore: number;
  awayTeamScore: number;
  matchDate: string;
  status: string;
  competition: string;
  venue?: string;
  matchday?: number;
};

type Props = {
  matches: Match[];
  isLoading: boolean;
  error: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const MatchGrid = ({
  matches,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
}: Props) => {
  if (isLoading) {
    return (
      <section className="py-28">
        <div className="flex flex-col items-center">
          <Loader2 size={36} className="animate-spin text-[#e09225]" />

          <p className="mt-5 text-black/40 uppercase tracking-[0.3em] text-xs">
            Loading Fixtures
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-28 text-center">
        <h2 className="para text-5xl uppercase">Something Went Wrong</h2>

        <p className="mt-4 text-black/45">Please refresh and try again.</p>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="py-28 text-center">
        <SearchX size={42} className="mx-auto text-black/30" />

        <h2 className="mt-6 para text-5xl uppercase">No Fixtures Found</h2>

        <p className="mt-4 text-black/45">Try changing your filters.</p>
      </section>
    );
  }

  return (
    <section className="mt-16">
      {/* Grid */}

      <div
        className="
          grid

          grid-cols-1
          xl:grid-cols-2

          gap-8
        "
      >
        {matches.map((match) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>

      {/* Pagination */}

      {totalPages > 1 && (
        <div
          className="
            mt-20

            flex
            items-center
            justify-center
            gap-3
            flex-wrap
          "
        >
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="
              border-b
              border-black

              pb-1

              uppercase

              transition

              disabled:opacity-30
              disabled:pointer-events-none

              hover:border-[#e09225]
              hover:text-[#e09225]
            "
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
                className={`
                    h-11
                    w-11

                    transition-all

                    ${
                      currentPage === index + 1
                        ? "bg-black text-[#FFF5E5]"
                        : "border border-black/10 hover:border-[#e09225]"
                    }
                  `}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="
              border-b
              border-black

              pb-1

              uppercase

              transition

              disabled:opacity-30
              disabled:pointer-events-none

              hover:border-[#e09225]
              hover:text-[#e09225]
            "
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default MatchGrid;
