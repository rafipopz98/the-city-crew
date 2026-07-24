"use client";

import PlayerHeroSlider from "@/components/PlayerStats/PlayerHeroSlider";
import { useState, useEffect } from "react";

type Player = {
  name: string;
  number: string;
  position: string;
  country: string;
  image: string;
  goals: number;
  assists: number;
  cleanSheets: number;
  games: number;
  rating: number;
};

export default function PlayersPageClient({
  initialPlayers,
  currentSeason,
  allSeasons,
}: {
  initialPlayers: Player[];
  currentSeason: string;
  allSeasons: string[];
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [loading, setLoading] = useState(false);

  // Fetch fresh data on mount (catches any ratings submitted before navigation)
  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        const res = await fetch(`/api/players?season=${currentSeason}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPlayers(data);
        }
      } catch {
        // Silent — server data is the fallback
      }
    };
    fetchInitial();
    return () => { cancelled = true; };
  }, [currentSeason]);

  const handleSeasonChange = async (season: string) => {
    setLoading(true);
    setSelectedSeason(season);

    try {
      const res = await fetch(`/api/players?season=${season}`);
      const data = await res.json();
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:mt-5 -mt-7">
      {/* Season Switcher */}
      <div className="flex justify-end px-4 sm:px-8 mb-4">
        <select
          value={selectedSeason}
          onChange={(e) => handleSeasonChange(e.target.value)}
          className="bg-white/80 backdrop-blur-sm border border-[#06182e]/20 rounded-full px-4 py-2 text-sm font-semibold text-[#06182e] focus:outline-none focus:ring-2 focus:ring-[#e09225]"
          disabled={loading}
        >
          {allSeasons.map((season) => (
            <option key={season} value={season}>
              {season.replace("-", "/")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e09225]"></div>
        </div>
      ) : (
        <PlayerHeroSlider PLAYERS={players} />
      )}
    </div>
  );
}
