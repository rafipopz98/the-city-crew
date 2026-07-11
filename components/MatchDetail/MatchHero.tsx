"use client";

import Image from "next/image";

type Props = {
  competition: string;
  season?: string;

  homeTeam: {
    name: string;
    image: string;
  };

  awayTeam: {
    name: string;
    image: string;
  };

  homeScore: number;
  awayScore: number;

  status: string;
};

const MatchHero = ({
  competition,
  season,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
}: Props) => {
  const isUpcoming = status === "upcoming";

  const statusText = {
    upcoming: "Upcoming",
    live: "Live",
    finished: "Full Time",
    postponed: "Postponed",
    cancelled: "Cancelled",
  }[status];

  return (
    <section>
      {/* Competition */}

      <div className="flex items-center justify-between">
        <div>
          <p
            className="
              text-[11px]

              uppercase

              tracking-[0.35em]

              text-black/40
            "
          >
            {competition}
          </p>

          {season && <p className="mt-3 text-black/40">{season}</p>}
        </div>

        <span
          className={`
            text-xs

            uppercase

            tracking-[0.35em]

            ${
              status === "live"
                ? "text-red-500 animate-pulse"
                : status === "finished"
                  ? "text-green-600"
                  : "text-black/40"
            }
          `}
        >
          {statusText}
        </span>
      </div>

      {/* Teams */}

      <div className="mt-20">
        {/* Home */}

        <div className="flex items-center justify-between gap-10">
          <div className="flex items-center gap-6 min-w-0">
            <img
              src={homeTeam.image}
              alt={homeTeam.name}
              width={72}
              height={72}
              className="object-contain h-18 w-auto"
            />

            <h1
              className="
                para

                text-5xl
                lg:text-7xl

                uppercase

                leading-none

                wrap-break-word
              "
            >
              {homeTeam.name}
            </h1>
          </div>

          {!isUpcoming && (
            <span
              className="
                para

                shrink-0

                text-7xl
                lg:text-8xl
              "
            >
              {homeScore}
            </span>
          )}
        </div>

        {/* Divider */}

        <div className="my-10 flex items-center gap-5">
          <div className="h-px flex-1 bg-black/10" />

          <span
            className="
              text-xs

              uppercase

              tracking-[0.35em]

              text-black/30
            "
          >
            {isUpcoming ? "VS" : "Score"}
          </span>

          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* Away */}

        <div className="flex items-center justify-between gap-10">
          <div className="flex items-center gap-6 min-w-0">
            <img
              src={awayTeam.image}
              alt={awayTeam.name}
              width={72}
              height={72}
              className="object-contain h-18 w-auto"
            />

            <h1
              className="
                para

                text-5xl
                lg:text-7xl

                uppercase

                leading-none
                
                wrap-break-word
              "
            >
              {awayTeam.name}
            </h1>
          </div>

          {!isUpcoming && (
            <span
              className="
                para

                shrink-0

                text-7xl
                lg:text-8xl
              "
            >
              {awayScore}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default MatchHero;
