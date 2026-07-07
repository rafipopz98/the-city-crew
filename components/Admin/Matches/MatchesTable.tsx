"use client";

import { useEffect, useState } from "react";
import MatchRow from "./MatchRow";
import { Loader2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [search, season, competition, status, refreshTrigger]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete match");
      }

      // Refresh matches list
      fetchMatches();
    } catch (err) {
      console.error("Error deleting match:", err);
      alert("Failed to delete match");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-[#6CABDD]" />
        <p className="mt-4 text-black/60">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <h3 className="para text-4xl uppercase text-red-600">Error</h3>
        <p className="mt-4 text-black/60">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-24 text-center">
        <h3 className="para text-4xl uppercase">No Matches Found</h3>
        <p className="mt-4 text-black/60">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-16">
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
