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
    <div className="flex flex-wrap gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-50 max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
        />
        <input
          type="text"
          placeholder="Search matches..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full
            pl-10
            pr-4
            py-2.5
            bg-white
            border
            border-black/10
            text-sm
            text-black
            placeholder:text-black/40
            focus:outline-none
            focus:border-[#6CABDD]
            transition-colors
          "
        />
      </div>

      {/* Season Filter */}
      <select
        value={season}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="
          px-4
          py-2.5
          bg-white
          border
          border-black/10
          text-sm
          text-black
          cursor-pointer
          focus:outline-none
          focus:border-[#6CABDD]
          transition-colors
        "
      >
        <option value="">All Seasons</option>
        {seasons.map((s) => (
          <option key={s._id} value={s._id}>
            {s.year}
          </option>
        ))}
      </select>

      {/* Competition Filter */}
      <select
        value={competition}
        onChange={(e) => onCompetitionChange(e.target.value)}
        className="
          px-4
          py-2.5
          bg-white
          border
          border-black/10
          text-sm
          text-black
          cursor-pointer
          focus:outline-none
          focus:border-[#6CABDD]
          transition-colors
        "
      >
        {competitions.map((comp) => (
          <option key={comp.value} value={comp.value}>
            {comp.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="
          px-4
          py-2.5
          bg-white
          border
          border-black/10
          text-sm
          text-black
          cursor-pointer
          focus:outline-none
          focus:border-[#6CABDD]
          transition-colors
        "
      >
        {statuses.map((stat) => (
          <option key={stat.value} value={stat.value}>
            {stat.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MatchesToolbar;
