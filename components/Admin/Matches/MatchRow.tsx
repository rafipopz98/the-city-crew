"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

type MatchRowProps = {
  match: any;
  onEdit: (match: any) => void;
  onDelete: (matchId: string) => void;
  onScoreUpdate: (
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) => void;
};

const MatchRow = ({
  match,
  onEdit,
  onDelete,
  onScoreUpdate,
}: MatchRowProps) => {
  const [editingScore, setEditingScore] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeTeamScore || 0);
  const [awayScore, setAwayScore] = useState(match.awayTeamScore || 0);
  const [saving, setSaving] = useState(false);

  const matchDate = new Date(match.matchDate);
  const formattedDate = matchDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = matchDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSaveScore = async () => {
    setSaving(true);
    try {
      await onScoreUpdate(match._id, homeScore, awayScore);
      setEditingScore(false);
      toast.success(`Score updated: ${homeScore}-${awayScore}`);
    } catch (error) {
      toast.error("Failed to update score");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setHomeScore(match.homeTeamScore || 0);
    setAwayScore(match.awayTeamScore || 0);
    setEditingScore(false);
  };

  return (
    <article
      className="
        group relative border-b border-black/10 py-8
        transition-all duration-300 hover:border-[#e09225]
      "
    >
      <div className="flex flex-col gap-8 xl:flex-row xl:items-center">
        {/* Left - Match Info */}
        <div className="flex-1">
          {/* Top Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-black/40">
            <span>{match.competition}</span>
            {match.matchday && (
              <>
                <span className="h-1 w-1 rounded-full bg-black/20" />
                <span>MD {match.matchday}</span>
              </>
            )}
          </div>

          {/* Teams & Score */}
          <div className="mt-8 flex items-center gap-6">
            {/* Home Team */}
            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="text-right">
                <h2 className="para text-xl lg:text-2xl uppercase leading-tight">
                  {match.homeTeam.name}
                </h2>
              </div>
              <Image
                src={match.homeTeam.image}
                alt={match.homeTeam.name}
                width={48}
                height={48}
                className="shrink-0"
              />
            </div>

            {/* Score Display - Always visible */}
            <div className="shrink-0">
              <div className="flex flex-col items-center">
                {/* Score */}
                <div className="flex items-center gap-4">
                  {/* Home Score */}
                  <div className="text-center">
                    <span className="para text-5xl lg:text-6xl tabular-nums">
                      {match.homeTeamScore}
                    </span>
                  </div>

                  {/* Separator */}
                  <span className="para text-4xl lg:text-5xl text-black/20">
                    –
                  </span>

                  {/* Away Score */}
                  <div className="text-center">
                    <span className="para text-5xl lg:text-6xl tabular-nums">
                      {match.awayTeamScore}
                    </span>
                  </div>
                </div>

                {/* Click to edit hint */}
                <button
                  onClick={() => setEditingScore(true)}
                  className="mt-1 text-[10px] uppercase tracking-wider text-black/25 hover:text-[#e09225] transition"
                >
                  Edit Score
                </button>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-1 items-center gap-4">
              <Image
                src={match.awayTeam.image}
                alt={match.awayTeam.name}
                width={48}
                height={48}
                className="shrink-0"
              />
              <div>
                <h2 className="para text-xl lg:text-2xl uppercase leading-tight">
                  {match.awayTeam.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Bottom Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-black/45">
            <div className="flex items-center gap-2">
              <Calendar size={15} />
              {formattedDate}
              <span className="text-black/20">•</span>
              {formattedTime}
            </div>
            {match.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={15} />
                {match.venue}
              </div>
            )}
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                match.status === "live"
                  ? "bg-red-100 text-red-800"
                  : match.status === "finished"
                    ? "bg-green-100 text-green-800"
                    : match.status === "upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {match.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 xl:flex-col xl:gap-4">
          <button
            onClick={() => onEdit(match)}
            className="group/edit flex items-center gap-2 border-b border-black pb-1 uppercase text-sm transition hover:border-[#e09225] hover:text-[#e09225]"
          >
            Edit
            <Edit2
              size={16}
              className="transition group-hover/edit:rotate-12"
            />
          </button>
          <button
            onClick={() => onDelete(match._id)}
            className="text-black/35 transition hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Score Edit Overlay */}
      {editingScore && (
        <div className=" inset-0 bg-[#ece1cf]/95 backdrop-blur-sm flex items-center justify-center z-10 fixed">
          <div className="bg-[#FFF5E5] p-8 shadow-2xl max-w-lg w-full rounded-2xl">
            <h3 className="para text-2xl uppercase text-center mb-8">
              Update Score
            </h3>

            {/* Teams */}
            <div className="flex items-center gap-6 mb-8">
              {/* Home */}
              <div className="flex-1 text-center">
                <Image
                  src={match.homeTeam.image}
                  alt={match.homeTeam.name}
                  width={40}
                  height={40}
                  className="mx-auto mb-3"
                />
                <p className="text-xs uppercase tracking-wider text-black/60 mb-4">
                  {match.homeTeam.name}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) =>
                      setHomeScore(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-20 text-center para text-4xl border-b-2 border-black/20 focus:border-[#e09225] outline-none py-2 transition"
                    min="0"
                    max="99"
                  />
                  <button
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* VS */}
              <div className="shrink-0 pt-10">
                <span className="para text-2xl text-black/30">VS</span>
              </div>

              {/* Away */}
              <div className="flex-1 text-center">
                <Image
                  src={match.awayTeam.image}
                  alt={match.awayTeam.name}
                  width={40}
                  height={40}
                  className="mx-auto mb-3"
                />
                <p className="text-xs uppercase tracking-wider text-black/60 mb-4">
                  {match.awayTeam.name}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) =>
                      setAwayScore(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-20 text-center para text-4xl border-b-2 border-black/20 focus:border-[#e09225] outline-none py-2 transition"
                    min="0"
                    max="99"
                  />
                  <button
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 border border-black/20 uppercase text-sm hover:bg-black/5 transition flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                disabled={saving}
                className="px-6 py-3 bg-[#06182e] text-white uppercase text-sm hover:bg-[#06182e]/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Score"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default MatchRow;
