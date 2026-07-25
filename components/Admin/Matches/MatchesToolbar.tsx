"use client";

import { Search } from "lucide-react";

type MatchesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  season: string;
  onSeasonChange: (value: string) => void;
  competition: string;
  onCompetitionChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  seasons: Array<{ _id: string; year: string }>;
};

const competitions = [
  { label: "All Competitions", value: "" },
  { label: "Premier League", value: "Premier League" },
  { label: "UEFA Champions League", value: "UCL" },
  { label: "FA Cup", value: "FA Cup" },
  { label: "Carabao Cup", value: "Carabao Cup" },
  { label: "FIFA Club World Cup", value: "FIFA Club World Cup" },
  { label: "Community Shield", value: "Community Shield" },
];

const statuses = [
  { label: "All Status", value: "" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Live", value: "live" },
  { label: "Finished", value: "finished" },
  { label: "Postponed", value: "postponed" },
  { label: "Cancelled", value: "cancelled" },
];

const MatchesToolbar = ({
  search,
  onSearchChange,
  season,
  onSeasonChange,
  competition,
  onCompetitionChange,
  status,
  onStatusChange,
  seasons,
}: MatchesToolbarProps) => {
  return (
    <section className="py-6">
      <div
        className="
        flex
        flex-col
        gap-5

        lg:flex-row
        lg:items-center
      "
      >
        {/* Search */}

        <div className="relative flex-1">
          <Search
            size={16}
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
            placeholder="Search matches..."
            className="
            w-full

            border-b-2
            border-black/10

            bg-transparent

            pb-3
            pl-8

            text-sm

            outline-none

            transition-all
            duration-300

            placeholder:text-black/25

            focus:border-[#e09225]
          "
          />
        </div>

        {/* Filters */}

        <div
          className="
          flex
          flex-wrap
          gap-4 sm:gap-6
        "
        >
          <select
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="
            border-b-2
            border-black/10

            bg-transparent

            pb-3

            text-sm
            uppercase

            outline-none

            transition-all
            duration-300

            hover:border-black/30

            focus:border-[#e09225]
          "
          >
            <option value="">All Seasons</option>

            {seasons.map((season) => (
              <option key={season._id} value={season._id}>
                {season.year}
              </option>
            ))}
          </select>

          <select
            value={competition}
            onChange={(e) => onCompetitionChange(e.target.value)}
            className="
            border-b-2
            border-black/10

            bg-transparent

            pb-3

            text-sm
            uppercase

            outline-none

            transition-all
            duration-300

            hover:border-black/30

            focus:border-[#e09225]
          "
          >
            {competitions.map((competition) => (
              <option key={competition.value} value={competition.value}>
                {competition.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="
            border-b-2
            border-black/10

            bg-transparent

            pb-3

            text-sm
            uppercase

            outline-none

            transition-all
            duration-300

            hover:border-black/30

            focus:border-[#e09225]
          "
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default MatchesToolbar;
