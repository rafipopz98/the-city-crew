import Image from "next/image";
import { Trophy, Swords } from "lucide-react";
import { Player, PlayerStat } from "./types-hero";

interface PlayerListProps {
  title: string;
  players: Player[];
  stat: PlayerStat;
  emptyMessage?: string;
}

const PlayerListItem = ({
  player,
  index,
  stat,
}: {
  player: Player;
  index: number;
  stat: PlayerStat;
}) => (
  <div className="flex items-center justify-between text-[#ece1cf] py-2 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors rounded px-1">
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#ece1cf]/30 w-4 font-mono">
        {String(index + 1).padStart(2, "0")}
      </span>
      {player.round_image ? (
        <Image
          src={player.round_image}
          alt={player.name}
          width={24}
          height={24}
          className="rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#1a3a5c] flex items-center justify-center">
          <span className="text-[10px] text-[#ece1cf]/50">
            {player.name.charAt(0)}
          </span>
        </div>
      )}
      <span className="text-sm truncate max-w-30">{player.name}</span>
    </div>
    <span className="text-[#e09225] font-bold text-sm min-w-5 text-center">
      {player[stat]}
    </span>
  </div>
);

export const PlayerList = ({
  title,
  players,
  stat,
  emptyMessage,
}: PlayerListProps) => {
  const Icon = stat === "goals" ? Trophy : Swords;

  return (
    <div className="bg-[#0a223f] p-4 rounded-xl">
      <h3 className="text-[#ece1cf] uppercase text-xs mb-3 tracking-wider flex items-center gap-2">
        <Icon className="w-3 h-3 text-[#e09225]" />
        {title}
      </h3>

      {players.length > 0 ? (
        players.map((player, index) => (
          <PlayerListItem
            key={player._id}
            player={player}
            index={index}
            stat={stat}
          />
        ))
      ) : (
        <p className="text-[#ece1cf]/30 text-xs text-center py-6">
          {emptyMessage}
        </p>
      )}
    </div>
  );
};
