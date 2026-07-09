"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

type Player = {
  _id: string;
  name: string;
  image: string;
  rating: number;
};

type Props = {
  matchId: string;
  players: Player[];
};

const PlayerRatingsPreview = ({ matchId, players }: Props) => {
  return (
    <section
      className="
        mt-20

        border-t
        border-black/10

        pt-16
      "
    >
      {/* Heading */}

      <div className="flex items-end justify-between">
        <div>
          <p
            className="
              text-[11px]

              uppercase

              tracking-[0.35em]

              text-black/35
            "
          >
            Community
          </p>

          <h2
            className="
              para

              mt-4

              text-5xl

              uppercase

              leading-none
            "
          >
            Player Ratings
          </h2>
        </div>

        <Link
          href={`/match-hub/${matchId}/ratings`}
          className="
            group

            hidden
            md:flex

            items-center
            gap-2

            border-b
            border-black

            pb-1

            uppercase

            transition

            hover:text-[#e09225]
            hover:border-[#e09225]
          "
        >
          Rate Players
          <ArrowUpRight
            size={17}
            className="
              transition

              group-hover:translate-x-1
              group-hover:-translate-y-1
            "
          />
        </Link>
      </div>

      {/* Players */}

      <div className="mt-12 space-y-6">
        {players.slice(0, 5).map((player) => (
          <div
            key={player._id}
            className="
              flex

              items-center

              justify-between

              border-b
              border-black/8

              pb-6
            "
          >
            <div className="flex items-center gap-5">
              <img
                src={player.image}
                alt={player.name}
                className="
                  h-16
                  w-16

                  rounded-full

                  object-cover
                "
              />

              <div>
                <h3
                  className="
                    para

                    text-2xl

                    uppercase
                  "
                >
                  {player.name}
                </h3>

                <p className="mt-2 text-black/35">Community Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Star size={18} fill="#e09225" className="text-[#e09225]" />

              <span
                className="
                  para

                  text-4xl
                "
              >
                {player.rating.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile CTA */}

      <Link
        href={`/match-hub/${matchId}/ratings`}
        className="
          mt-10

          flex
          md:hidden

          w-fit

          items-center
          gap-2

          border-b
          border-black

          pb-1

          uppercase
        "
      >
        Rate Players
      </Link>
    </section>
  );
};

export default PlayerRatingsPreview;
