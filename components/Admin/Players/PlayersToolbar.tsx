"use client";

import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  season: string;
  onSeasonChange: (value: string) => void;

  position: string;
  onPositionChange: (value: string) => void;
};

const seasons = ["2025/26", "2024/25", "2023/24"];

const positions = [
  {
    label: "All",
    value: "",
  },
  {
    label: "GK",
    value: "GK",
  },
  {
    label: "DEF",
    value: "DEF",
  },
  {
    label: "MID",
    value: "MID",
  },
  {
    label: "FWD",
    value: "FWD",
  },
];

const PlayersToolbar = ({
  search,
  onSearchChange,
  season,
  onSeasonChange,
  position,
  onPositionChange,
}: Props) => {
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
              h-16
              w-full

              border-b-2
              border-black/15

              bg-transparent

              pl-10

              text-3xl

              para

              outline-none

              placeholder:text-black/25

              transition-all

              focus:border-[#e09225]
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
            {seasons.map((item) => (
              <button
                key={item}
                onClick={() => onSeasonChange(item)}
                className={`
                  border
                  px-5
                  py-2.5

                  para
                  uppercase

                  transition-all
                  duration-300

                  ${
                    season === item
                      ? "border-[#e09225] bg-[#e09225] text-black"
                      : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                  }
                `}
              >
                {item}
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
            {positions.map((item) => (
              <button
                key={item.label}
                onClick={() => onPositionChange(item.value)}
                className={`
                  border
                  px-5
                  py-2.5

                  para
                  uppercase

                  transition-all
                  duration-300

                  ${
                    position === item.value
                      ? "border-[#06182e] bg-[#06182e] text-white"
                      : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayersToolbar;
