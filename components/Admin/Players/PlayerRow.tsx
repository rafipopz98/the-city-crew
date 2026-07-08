"use client";

import { useState } from "react";
import { ArrowUpRight, Trash2, Plus, Minus, ChevronDown } from "lucide-react";

type Props = {
  player: any;
  onEdit: () => void;
  onDelete: () => void;
  onStatUpdate: (playerId: string, stat: string, value: number) => void;
};

const PlayerRow = ({ player, onEdit, onDelete, onStatUpdate }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const isGoalkeeper = player.position === "GK";
  const isDefender = ["CB", "LB", "RB", "LWB", "RWB"].includes(player.position);

  const handleQuickUpdate = async (stat: string, increment: number) => {
    const newValue = (player[stat] || 0) + increment;
    if (newValue < 0) return;

    setUpdating(stat);
    await onStatUpdate(player._id, stat, newValue);
    setUpdating(null);
  };

  const QuickStatButton = ({
    label,
    value,
    stat,
    show = true,
  }: {
    label: string;
    value: number;
    stat: string;
    show?: boolean;
  }) => {
    if (!show) return null;

    return (
      <div className="flex items-center gap-2">
        <div className="text-center min-w-15">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            {label}
          </p>
          <h3
            className={`mt-1 para text-3xl ${updating === stat ? "opacity-50" : ""}`}
          >
            {value}
          </h3>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleQuickUpdate(stat, 1)}
            disabled={updating === stat}
            className="p-1 hover:bg-green-100 hover:text-green-600 rounded transition"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => handleQuickUpdate(stat, -1)}
            disabled={updating === stat || value <= 0}
            className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <article className="group border-b border-black/10 py-8 transition-all duration-300 hover:border-[#e09225]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center">
          {/* LEFT */}
          <div className="flex flex-1 items-center gap-5">
            <img
              src={player.round_image || player.vertical_image}
              alt={player.name}
              className="h-20 w-20 rounded-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div>
              <h2 className="para text-3xl uppercase leading-none transition group-hover:text-[#e09225]">
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
                {player.number && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-black/25" />
                    <span className="text-black/45 uppercase tracking-widest text-xs">
                      #{player.number}
                    </span>
                  </>
                )}
                {player.is_captain && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-black/25" />
                    <span className="text-[#e09225] uppercase tracking-widest text-xs">
                      Captain
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* QUICK STATS - Always visible */}
          <div className="grid grid-cols-3 gap-6 xl:gap-10">
            <QuickStatButton label="Goals" value={player.goals} stat="goals" />
            <QuickStatButton
              label="Assists"
              value={player.assists}
              stat="assists"
            />
            <QuickStatButton
              label="Apps"
              value={player.appearances}
              stat="appearances"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 xl:ml-8">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2 text-black/40 transition hover:text-[#e09225] ${expanded ? "text-[#e09225]" : ""}`}
              title="More stats"
            >
              <ChevronDown
                size={18}
                className={`transition ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            <button
              onClick={onEdit}
              className="group/edit flex items-center gap-2 border-b border-black pb-1 uppercase transition hover:border-[#e09225] hover:text-[#e09225]"
            >
              Edit
              <ArrowUpRight
                size={17}
                className="transition group-hover/edit:-translate-y-1 group-hover/edit:translate-x-1"
              />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-black/40 transition hover:text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* EXPANDED STATS */}
        {expanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pl-20 pt-4 border-t border-black/5">
            {/* GK specific */}
            {(isGoalkeeper || isDefender) && (
              <QuickStatButton
                label="Clean Sheets"
                value={player.clean_sheets}
                stat="clean_sheets"
              />
            )}

            {/* GK specific */}
            {isGoalkeeper && (
              <>
                <QuickStatButton
                  label="Saves"
                  value={player.saves}
                  stat="saves"
                />
                <QuickStatButton
                  label="Pen Saved"
                  value={player.penalty_saved}
                  stat="penalty_saved"
                />
              </>
            )}

            <QuickStatButton
              label="Pen Goals"
              value={player.penalty_goals}
              stat="penalty_goals"
            />
            <QuickStatButton
              label="Pen Missed"
              value={player.penalty_missed}
              stat="penalty_missed"
            />
            <QuickStatButton
              label="Yellow"
              value={player.yellow_cards}
              stat="yellow_cards"
            />
            <QuickStatButton
              label="Red"
              value={player.red_cards}
              stat="red_cards"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default PlayerRow;
