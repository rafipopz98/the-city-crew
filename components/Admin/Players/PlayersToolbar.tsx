"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  season: string;
  onSeasonChange: (value: string) => void;

  position: string;
  onPositionChange: (value: string) => void;
};

const PlayersToolbar = ({
  search,
  onSearchChange,
  season,
  onSeasonChange,
  position,
  onPositionChange,
}: Props) => {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeasons();
    fetchPositions();
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await fetch("/api/admin/seasons");
      if (response.ok) {
        const data = await response.json();
        setSeasons(data);

        // Set first season as default if none selected
        if (!season && data.length > 0) {
          onSeasonChange(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/admin/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  // Add "All" option at the beginning
  const seasonOptions = [
    { label: "All Seasons", value: "", _id: "" },
    ...seasons,
  ];

  if (loading) {
    return (
      <section className="space-y-10">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-black/45">
            Search
          </p>
          <div className="relative">
            <Search
              size={22}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search players..."
              className="
                h-16 w-full border-b-2 border-black/15 bg-transparent
                pl-10 text-3xl para outline-none placeholder:text-black/25
                transition-all focus:border-[#e09225]
              "
            />
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e09225]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {/* Search */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-black/45">
          Search
        </p>

        <div className="relative">
          <Search
            size={22}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-black/40"
          />

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search players..."
            className="
              h-16 w-full border-b-2 border-black/15 bg-transparent
              pl-10 text-3xl para outline-none placeholder:text-black/25
              transition-all focus:border-[#e09225]
            "
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Season */}
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-black/45">
            Season
          </p>

          <div className="flex flex-wrap gap-3">
            {seasonOptions.map((item) => (
              <button
                key={item._id || "all"}
                onClick={() => onSeasonChange(item._id)}
                className={`
                  border px-5 py-2.5 para uppercase
                  transition-all duration-300
                  ${
                    season === item._id
                      ? "border-[#e09225] bg-[#e09225] text-black"
                      : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                  }
                `}
              >
                {item.label || item.year}
              </button>
            ))}
          </div>
        </div>

        {/* Position */}
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-black/45">
            Position
          </p>

          <div className="flex flex-wrap gap-3">
            {positions.map((group: any) => (
              <button
                key={group.value}
                onClick={() => onPositionChange(group.value)}
                className={`
                  border px-5 py-2.5 para uppercase
                  transition-all duration-300
                  ${
                    position === group.value
                      ? "border-[#06182e] bg-[#06182e] text-white"
                      : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                  }
                `}
                title={group.positions?.join(", ")}
              >
                {group.label}
                {group.positions?.length > 0 && (
                  <span className="ml-2 text-xs opacity-60">
                    ({group.positions.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayersToolbar;
