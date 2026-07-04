"use client";

import PlayerRow from "./PlayerRow";

const players = [
  {
    id: 1,
    image:
      "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png",
    name: "Erling Haaland",
    country: "Norway",
    position: "ST",
    season: "2025/26",
    goals: 31,
    assists: 6,
    appearances: 34,
  },
  {
    id: 2,
    image:
      "https://resources.premierleague.com/premierleague/photos/players/250x250/p220566.png",
    name: "Rodri",
    country: "Spain",
    position: "CDM",
    season: "2025/26",
    goals: 8,
    assists: 9,
    appearances: 35,
  },
  {
    id: 3,
    image:
      "https://resources.premierleague.com/premierleague/photos/players/250x250/p248887.png",
    name: "Phil Foden",
    country: "England",
    position: "LW",
    season: "2025/26",
    goals: 18,
    assists: 12,
    appearances: 36,
  },
];

type Props = {
  search: string;
  season: string;
  position: string;
  onEdit: () => void;
};

const PlayersTable = ({ search, season, position, onEdit }: Props) => {
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSeason = !season || player.season === season;

    const matchesPosition = !position || player.position === position;

    return matchesSearch && matchesSeason && matchesPosition;
  });

  if (filteredPlayers.length === 0) {
    return (
      <div className="py-24 text-center">
        <h3 className="para text-4xl uppercase">No Players Found</h3>

        <p className="mt-4 text-black/60">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-16">
      {filteredPlayers.map((player) => (
        <PlayerRow key={player.id} player={player} onEdit={onEdit} />
      ))}
    </section>
  );
};

export default PlayersTable;
