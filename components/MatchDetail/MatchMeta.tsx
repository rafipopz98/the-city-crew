"use client";

import { Calendar, Clock3, MapPin, Trophy } from "lucide-react";

type Props = {
  date: string;
  time: string;

  venue?: string;

  matchday?: number;

  isHome: boolean;

  matchType?: string;
};

const MatchMeta = ({
  date,
  time,
  venue,
  matchday,
  isHome,
  matchType,
}: Props) => {
  const items = [
    {
      label: "Date",
      value: date,
      icon: Calendar,
    },
    {
      label: "Kick Off",
      value: time,
      icon: Clock3,
    },
    {
      label: "Venue",
      value: venue || "-",
      icon: MapPin,
    },
    {
      label: "Fixture",
      value: isHome ? "Home" : "Away",
      icon: Trophy,
    },
  ];

  if (matchday) {
    items.push({
      label: "Matchday",
      value: `Matchday ${matchday}`,
      icon: Trophy,
    });
  }

  if (matchType) {
    items.push({
      label: "Round",
      value: matchType,
      icon: Trophy,
    });
  }

  return (
    <section
      className="
        mt-20

        border-y
        border-black/10

        py-12
      "
    >
      <div
        className="
          grid

          gap-10

          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex gap-5">
              <div
                className="
                  mt-1

                  text-black/30
                "
              >
                <Icon size={18} />
              </div>

              <div>
                <p
                  className="
                    text-[11px]

                    uppercase

                    tracking-[0.35em]

                    text-black/35
                  "
                >
                  {item.label}
                </p>

                <h3
                  className="
                    mt-3

                    text-xl

                    text-black
                  "
                >
                  {item.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MatchMeta;
