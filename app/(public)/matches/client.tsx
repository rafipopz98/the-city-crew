"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";

import MatchFilters from "@/components/Matches/MatchFilters";
import MatchGrid from "@/components/Matches/MatchGrid";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Season = {
  _id: string;
  year: string;
};

type Props = {
  initialSeason: string;
  allSeasons: Season[];
};

export default function MatchesClient({ initialSeason, allSeasons }: Props) {
  const [season, setSeason] = useState(initialSeason);

  const [competition, setCompetition] = useState("");

  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [competitionOptions, setCompetitionOptions] = useState<string[]>([]);

  /* Debounce Search */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);

      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* Reset Pagination */

  useEffect(() => {
    setCurrentPage(1);
  }, [season, competition, status, debouncedSearch]);

  /* Build URL */

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: "12",
    });

    if (season) {
      params.set("season", season);
    }

    if (competition) {
      params.set("competition", competition);
    }

    if (status) {
      params.set("status", status);
    }

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    return `/api/matches?${params.toString()}`;
  }, [currentPage, season, competition, status, debouncedSearch]);

  const { data, error, isLoading } = useSWR(buildUrl(), fetcher, {
    keepPreviousData: true,
  });

  const matches = data?.matches ?? [];

  const totalPages = data?.totalPages ?? 1;

  const totalMatches = data?.totalMatches ?? 0;

  /* Pagination */

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 120,
      behavior: "smooth",
    });
  };

  /* Competition Options */

  useEffect(() => {
    fetch("/api/matches?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        const unique = new Set<string>();

        data.matches.forEach((match: { competition: string }) => {
          if (match.competition) {
            unique.add(match.competition);
          }
        });

        setCompetitionOptions(Array.from(unique).sort());
      })
      .catch(console.error);
  }, []);

  return (
    <main
      className="
        min-h-screen

        bg-[#FFF5E5]

        px-5

        pt-28
        lg:pt-36

        pb-24
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <header>
          <h1
            className="
              para

              text-5xl
              sm:text-6xl
              lg:text-7xl

              uppercase

              leading-none
            "
          >
            Fixtures
          </h1>

          <p
            className="
              mt-5

              max-w-2xl

              leading-8

              text-black/55
            "
          >
            Every Manchester City fixture, result and score from every
            competition.
            {totalMatches > 0 && (
              <span className="text-black">
                {" "}
                {totalMatches} matches available.
              </span>
            )}
          </p>
        </header>

        {/* Filters */}

        <MatchFilters
          season={season}
          onSeasonChange={setSeason}
          competition={competition}
          onCompetitionChange={setCompetition}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          seasons={allSeasons}
          competitionOptions={competitionOptions}
        />

        {/* Matches */}

        <MatchGrid
          matches={matches}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
