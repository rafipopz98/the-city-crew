import { ResultsCard } from "./ResultsCard";
import { ErrorDisplay } from "./ErrorDisplay";
import { EMPTY_STATES } from "@/constants/match";
import { Match } from "./type-matches";
import { MatchCardSkeleton } from "./skeletons";

interface ResultsRowProps {
  matches: Match[];
  isLoading: boolean;
  error: any;
}

export const ResultsRow = ({ matches, isLoading, error }: ResultsRowProps) => {
  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3 pb-4">
        {[1, 2, 3].map((i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message="Failed to load results" />;
  }

  if (matches.length === 0) {
    return <ErrorDisplay message={EMPTY_STATES.NO_RESULTS} />;
  }

  return (
    <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3 pb-4">
      {matches.map((match) => (
        <ResultsCard key={match._id} match={match} />
      ))}
    </div>
  );
};
