import { Calendar, Clock3, MapPin, Home, Shirt, Trophy } from "lucide-react";

type Props = {
  date: string;
  time: string;
  venue?: string;
  matchday?: number;
  isHome: boolean;
  matchType?: string;
  competition?: string;
};

const MatchMeta = ({
  date,
  time,
  venue,
  matchday,
  isHome,
  matchType,
  competition,
}: Props) => {
  const isFriendly = competition?.toLowerCase() === "friendly";

  // Static Tailwind classes — must be complete strings for the JIT scanner
  const fixtureGradient = isHome
    ? "from-emerald-500/20 to-emerald-600/10"
    : "from-orange-500/20 to-orange-600/10";
  const fixtureIconColor = isHome ? "text-emerald-400" : "text-orange-400";

  // For friendly matches: no matchday, show "Friendly" as the round
  const roundLabel = isFriendly ? "Friendly" : matchType || null;

  const items = [
    {
      label: "Date",
      value: date,
      icon: Calendar,
      gradient: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-400",
    },
    {
      label: "Kick Off",
      value: time,
      icon: Clock3,
      gradient: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-400",
    },
    {
      label: "Venue",
      value: venue || "TBD",
      icon: MapPin,
      gradient: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-400",
    },
    {
      label: "Fixture",
      value: isHome ? "Home" : "Away",
      icon: Home,
      gradient: fixtureGradient,
      iconColor: fixtureIconColor,
    },
    // Hide matchday for friendly matches
    ...(!isFriendly && matchday
      ? [
          {
            label: "Matchday",
            value: `Day ${matchday}`,
            icon: Shirt,
            gradient: "from-amber-500/20 to-amber-600/10",
            iconColor: "text-amber-400",
          },
        ]
      : []),
    // Show "Friendly" for friendlies, otherwise use matchType
    ...(roundLabel
      ? [
          {
            label: "Round",
            value: roundLabel,
            icon: Trophy,
            gradient: "from-rose-500/20 to-rose-600/10",
            iconColor: "text-rose-400",
          },
        ]
      : []),
  ];

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-black/5 p-4 sm:p-5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-white/60 transition-all duration-500 opacity-0 group-hover:opacity-100 rounded-2xl" />

              <div className="relative">
                <div
                  className={`inline-flex p-2 sm:p-2.5 rounded-lg bg-gradient-to-br ${item.gradient} mb-3`}
                >
                  <Icon size={16} className={item.iconColor} />
                </div>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-black/35 mb-1.5">
                  {item.label}
                </p>
                <p className="text-sm sm:text-base font-semibold text-black/80 leading-tight">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MatchMeta;
