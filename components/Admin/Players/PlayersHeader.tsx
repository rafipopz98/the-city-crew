"use client";

import { ArrowUpRight, Plus } from "lucide-react";

type PlayersHeaderProps = {
  onAddPlayer?: () => void;
};

const PlayersHeader = ({ onAddPlayer }: PlayersHeaderProps) => {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-black/40">
          Squad Management
        </p>

        <h1
          className="
              para
              text-[3.5rem]
              leading-[0.9]
              uppercase
              text-black

              md:text-[5rem]
            "
        >
          Players
        </h1>

        <p
          className="
              mt-5
              max-w-2xl

              text-[15px]
              leading-8

              text-black/60
            "
        >
          Manage player information, season statistics, appearances and squad
          details from one place.
        </p>
      </div>

      <button
        onClick={onAddPlayer}
        className="
            group

            flex
            items-center
            gap-4

            self-start
            lg:self-end

            border-b-2
            border-black

            pb-2

            para
            uppercase
            text-lg

            transition-all

            hover:border-[#e09225]
            hover:text-[#e09225]
          "
      >
        <span>Add Player</span>

        <div className="overflow-hidden">
          <ArrowUpRight
            size={20}
            className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </button>
    </div>
  );
};

export default PlayersHeader;
