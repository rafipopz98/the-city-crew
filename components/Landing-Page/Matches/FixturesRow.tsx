import { FixturesCard } from "./FixturesCard";
import { ErrorDisplay } from "./ErrorDisplay";
import { EMPTY_STATES } from "@/constants/match";
import { Match } from "./type-matches";
import { MatchCardSkeleton } from "./skeletons";

interface FixturesRowProps {
  matches: Match[];
  isLoading: boolean;
  error: any;
}

export const FixturesRow = ({
  matches,
  isLoading,
  error,
}: FixturesRowProps) => {
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
    return <ErrorDisplay message="Failed to load fixtures" />;
  }

  if (matches.length === 0) {
    return <ErrorDisplay message={EMPTY_STATES.NO_FIXTURES} />;
  }

  return (
    <div className="flex gap-6 overflow-x-auto lg:grid lg:grid-cols-3 pb-4">
      {matches.map((match) => (
        <FixturesCard key={match._id} match={match} />
      ))}
    </div>
  );
};
