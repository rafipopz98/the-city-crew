"use client";

import { Search } from "lucide-react";

type Season = {
  _id: string;
  year: string;
};

type MatchFiltersProps = {
  season: string;
  onSeasonChange: (value: string) => void;
  competition: string;
  onCompetitionChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  seasons: Season[];
  competitionOptions: string[];
};

const statuses = [
  {
    label: "All Status",
    value: "",
  },
  {
    label: "Upcoming",
    value: "upcoming",
  },
  {
    label: "Live",
    value: "live",
  },
  {
    label: "Finished",
    value: "finished",
  },
  {
    label: "Postponed",
    value: "postponed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

const MatchFilters = ({
  season,
  onSeasonChange,
  competition,
  onCompetitionChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
  seasons,
  competitionOptions,
}: MatchFiltersProps) => {
  return (
    <section
      className="
        mt-14

        border-y
        border-black/10

        py-8
      "
    >
      <div
        className="
          flex
          flex-col
          gap-8

          xl:flex-row
          xl:items-end
        "
      >
        {/* Search */}

        <div className="flex-1">
          <p
            className="
              text-[11px]

              uppercase

              tracking-[0.35em]

              text-black/40
            "
          >
            Search
          </p>

          <div className="relative mt-4">
            <Search
              size={18}
              className="
                absolute
                left-0
                top-1/2
                -translate-y-1/2

                text-black/35
              "
            />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Manchester United..."
              className="
                w-full

                border-b-2
                border-black/10

                bg-transparent

                pl-8
                pb-3

                text-xl

                outline-none

                transition-all

                placeholder:text-black/25

                focus:border-[#e09225]
              "
            />
          </div>
        </div>

        {/* Filters */}

        <div
          className="
            grid

            grid-cols-1
            sm:grid-cols-3

            gap-8

            xl:w-auto
          "
        >
          {/* Season */}

          <div>
            <p
              className="
                text-[11px]

                uppercase

                tracking-[0.35em]

                text-black/40
              "
            >
              Season
            </p>

            <select
              value={season}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="
                mt-4

                w-full

                border-b-2
                border-black/10

                bg-transparent

                pb-3

                text-lg

                outline-none

                transition

                focus:border-[#e09225]
              "
            >
              <option value="">All Seasons</option>

              {seasons.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.year.replace("-", "/")}
                </option>
              ))}
            </select>
          </div>

          {/* Competition */}

          <div>
            <p
              className="
                text-[11px]

                uppercase

                tracking-[0.35em]

                text-black/40
              "
            >
              Competition
            </p>

            <select
              value={competition}
              onChange={(e) => onCompetitionChange(e.target.value)}
              className="
                mt-4

                w-full

                border-b-2
                border-black/10

                bg-transparent

                pb-3

                text-lg

                outline-none

                transition

                focus:border-[#e09225]
              "
            >
              <option value="">All Competitions</option>

              {competitionOptions.map((competition) => (
                <option key={competition} value={competition}>
                  {competition}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}

          <div>
            <p
              className="
                text-[11px]

                uppercase

                tracking-[0.35em]

                text-black/40
              "
            >
              Status
            </p>

            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="
                mt-4

                w-full

                border-b-2
                border-black/10

                bg-transparent

                pb-3

                text-lg

                outline-none

                transition

                focus:border-[#e09225]
              "
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatchFilters;
