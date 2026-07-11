"use client";

import { useState } from "react";
import useSWR from "swr";

import { API_ENDPOINTS } from "@/constants/match";
import { MatchesResponse, RowType } from "./Matches/type-matches";
import { fetcher } from "@/lib/hero";
import { MatchesSectionSkeleton } from "./Matches/skeletons";
import { ExpandableRow } from "./Matches/ExpandableRow";
import { ResultsRow } from "./Matches/ResultsRow";
import { FixturesRow } from "./Matches/FixturesRow";

const MatchesSection = () => {
  const [open, setOpen] = useState<RowType>(null);

  const {
    data: resultsData,
    error: resultsError,
    isLoading: resultsLoading,
  } = useSWR<MatchesResponse>(API_ENDPOINTS.RESULTS, fetcher);

  const {
    data: fixturesData,
    error: fixturesError,
    isLoading: fixturesLoading,
  } = useSWR<MatchesResponse>(API_ENDPOINTS.FIXTURES, fetcher);

  const recentResults = resultsData?.matches || [];
  const upcomingFixtures = fixturesData?.matches || [];
  const isLoading = resultsLoading || fixturesLoading;

  if (isLoading) {
    return <MatchesSectionSkeleton />;
  }

  return (
    <div className="w-full bg-[#06182e] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Latest Results */}
        <ExpandableRow
          title="Latest Results"
          isOpen={open === "results"}
          onToggle={() => setOpen(open === "results" ? null : "results")}
        >
          <ResultsRow
            matches={recentResults}
            isLoading={resultsLoading}
            error={resultsError}
          />
        </ExpandableRow>

        {/* Upcoming Fixtures */}
        <ExpandableRow
          title="Upcoming Fixtures"
          isOpen={open === "fixtures"}
          onToggle={() => setOpen(open === "fixtures" ? null : "fixtures")}
        >
          <FixturesRow
            matches={upcomingFixtures}
            isLoading={fixturesLoading}
            error={fixturesError}
          />
        </ExpandableRow>
      </div>
    </div>
  );
};

export default MatchesSection;
