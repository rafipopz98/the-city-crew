"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import MatchRow from "./MatchRow";

type Props = {
  search: string;
  season: string;
  competition: string;
  status: string;
  onEdit: (match: any) => void;
  refreshTrigger?: number;
};

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

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (season) params.append("season", season);
      if (competition) params.append("competition", competition);
      if (status) params.append("status", status);

      const response = await fetch(`/api/admin/matches?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await response.json();

      setMatches(data.matches || []);
    } catch (error) {
      console.error(error);

      setError("Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, [search, season, competition, status]);

  useEffect(() => {
    fetchMatches();
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

      fetchMatches();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete match");
    }
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
    <section
      className="
        divide-y
        divide-black/10
      "
    >
      {matches.map((match) => (
        <MatchRow
          key={match._id}
          match={match}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </section>
  );
};

export default MatchesTable;
