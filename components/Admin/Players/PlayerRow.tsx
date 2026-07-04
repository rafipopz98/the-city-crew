"use client";

import { ArrowUpRight, Trash2 } from "lucide-react";

type Player = {
  id: number;
  image: string;
  name: string;
  country: string;
  position: string;
  season: string;
  goals: number;
  assists: number;
  appearances: number;
};

type Props = {
  player: Player;
  onEdit: () => void;
};

const PlayerRow = ({ player, onEdit }: Props) => {
  return (
    <article
      className="
        group

        border-b
        border-black/10

        py-8

        transition-all
        duration-300

        hover:border-[#e09225]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-8

          xl:flex-row
          xl:items-center
        "
      >
        {/* LEFT */}

        <div className="flex flex-1 items-center gap-5">
          <img
            src={player.image}
            alt={player.name}
            className="
              h-20
              w-20

              rounded-full

              object-cover

              transition
              duration-500

              group-hover:scale-105
            "
          />

          <div>
            <h2
              className="
                para

                text-3xl

                uppercase

                leading-none

                transition

                group-hover:text-[#e09225]
              "
            >
              {player.name}
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-black/45 uppercase tracking-widest text-xs">
                {player.country}
              </span>

              <span className="h-1 w-1 rounded-full bg-black/25" />

              <span className="text-black uppercase tracking-widest text-xs">
                {player.position}
              </span>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div
          className="
            grid

            grid-cols-3

            gap-8

            xl:min-w-95
          "
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              Goals
            </p>

            <h3 className="mt-2 para text-4xl">{player.goals}</h3>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              Assists
            </p>

            <h3 className="mt-2 para text-4xl">{player.assists}</h3>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              Apps
            </p>

            <h3 className="mt-2 para text-4xl">{player.appearances}</h3>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-3 xl:ml-8">
          <button
            onClick={onEdit}
            className="
              group/edit

              flex
              items-center
              gap-2

              border-b
              border-black

              pb-1

              uppercase

              transition

              hover:border-[#e09225]
              hover:text-[#e09225]
            "
          >
            Edit
            <ArrowUpRight
              size={17}
              className="transition group-hover/edit:-translate-y-1 group-hover/edit:translate-x-1"
            />
          </button>

          <button
            className="
              p-2

              text-black/40

              transition

              hover:text-red-500
            "
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PlayerRow;
