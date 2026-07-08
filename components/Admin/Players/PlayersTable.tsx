"use client";

import { useState, useEffect } from "react";
import PlayerRow from "./PlayerRow";

type Props = {
  search: string;
  season: string;
  position: string;
  onEdit: (player: any) => void;
  refreshTrigger: number;
};

const PlayersTable = ({
  search,
  season,
  position,
  onEdit,
  refreshTrigger,
}: Props) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PLAYERS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchPlayers(1);
  }, [search, season, position, refreshTrigger]);

  // In PlayersTable, add this function:
  const handleStatUpdate = async (
    playerId: string,
    stat: string,
    value: number,
  ) => {
    try {
      // Map frontend stat name to DB field name
      const statMap: Record<string, string> = {
        goals: "goals",
        assists: "assists",
        appearances: "appearances",
        clean_sheets: "clean_sheets",
        saves: "saves",
        penalty_saved: "penalty_saved",
        minutes_played: "minutes_played",
        penalty_goals: "penalty_goals",
        penalty_missed: "penalty_missed",
        yellow_cards: "yellow_cards",
        red_cards: "red_cards",
      };

      const dbField = statMap[stat] || stat;

      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [dbField]: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stat");
      }

      // Refresh the list
      fetchPlayers(currentPage);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchPlayers = async (page: number) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (season) params.append("season", season);
      if (position) params.append("position", position);
      params.append("page", page.toString());
      params.append("limit", PLAYERS_PER_PAGE.toString());

      const response = await fetch(`/api/admin/players?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }

      const data = await response.json();
      setPlayers(data.players);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (playerId: string) => {
    if (!window.confirm("Are you sure you want to delete this player?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete player");
      }

      // Refresh the current page
      fetchPlayers(currentPage);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPlayers(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e09225] mx-auto"></div>
        <p className="mt-4 text-black/60">Loading players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <h3 className="para text-4xl uppercase text-red-600">Error</h3>
        <p className="mt-4 text-black/60">{error}</p>
        <button
          onClick={() => fetchPlayers(currentPage)}
          className="mt-6 border border-black px-6 py-3 uppercase hover:bg-black hover:text-white transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (players?.length === 0) {
    return (
      <div className="py-24 text-center">
        <h3 className="para text-4xl uppercase">No Players Found</h3>
        <p className="mt-4 text-black/60">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-16">
      {/* Players List */}
      {players?.map((player: any) => (
        <PlayerRow
          key={player._id}
          player={player}
          onEdit={() => onEdit(player)}
          onDelete={() => handleDelete(player._id)}
          onStatUpdate={handleStatUpdate}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border border-black/20 px-4 py-2 uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`
                  w-10 h-10 flex items-center justify-center border text-sm
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
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border border-black/20 px-4 py-2 uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition"
          >
            Next
          </button>

          <p className="ml-4 text-sm text-black/50">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </section>
  );
};

export default PlayersTable;
