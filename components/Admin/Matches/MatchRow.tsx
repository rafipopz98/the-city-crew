"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  Save,
  X,
  Users,
  Goal,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

type MatchRowProps = {
  match: any;
  onEdit: (match: any) => void;
  onDelete: (matchId: string) => void;
  onScoreUpdate: (
    matchId: string,
    homeScore: number,
    awayScore: number,
    goalScorers: GoalScorer[],
    lineup: string[],
  ) => void;
  onMatchUpdate?: (matchId: string, data: any) => void;
};

export type GoalScorer = {
  team: "home" | "away";
  playerName: string;
  minute: number | string;
  isPenalty: boolean;
  isOwnGoal: boolean;
};

const MatchRow = ({
  match,
  onEdit,
  onDelete,
  onScoreUpdate,
  onMatchUpdate,
}: MatchRowProps) => {
  const [editingScore, setEditingScore] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeTeamScore || 0);
  const [awayScore, setAwayScore] = useState(match.awayTeamScore || 0);
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Goal scorers state for the overlay
  const [goalScorers, setGoalScorers] = useState<GoalScorer[]>([]);
  const [lineup, setLineup] = useState<string[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fetch players when overlay opens
  useEffect(() => {
    if (editingScore && match.season?._id) {
      fetchPlayers(match.season._id);
    }
  }, [editingScore, match.season]);

  // Initialize goal scorers and lineup from match data when overlay opens
  useEffect(() => {
    if (editingScore) {
      if (match.goalScorers && match.goalScorers.length > 0) {
        setGoalScorers(
          match.goalScorers.map((g: any) => ({
            team: g.team,
            playerName: g.playerName,
            minute: g.minute,
            isPenalty: g.isPenalty || false,
            isOwnGoal: g.isOwnGoal || false,
          })),
        );
      } else {
        setGoalScorers([]);
      }

      if (match.lineup && match.lineup.length > 0) {
        setLineup(match.lineup.map((p: any) => p._id || p));
      } else {
        setLineup([]);
      }
    }
  }, [editingScore, match]);

  const fetchPlayers = async (seasonId: string) => {
    setLoadingPlayers(true);
    try {
      const response = await fetch(
        `/api/admin/players?season=${seasonId}&limit=100`,
      );
      if (response.ok) {
        const data = await response.json();
        setAllPlayers(data.players || []);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoadingPlayers(false);
    }
  };

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

  // Goal Scorer Functions
  const addGoalScorer = () => {
    setGoalScorers([
      ...goalScorers,
      {
        team: "home",
        playerName: "",
        minute: "",
        isPenalty: false,
        isOwnGoal: false,
      },
    ]);
  };

  const removeGoalScorer = (index: number) => {
    setGoalScorers(goalScorers.filter((_, i) => i !== index));
  };

  const updateGoalScorer = (
    index: number,
    field: keyof GoalScorer,
    value: any,
  ) => {
    const updated = [...goalScorers];
    updated[index] = { ...updated[index], [field]: value };
    setGoalScorers(updated);
  };

  // Lineup Functions
  const togglePlayer = (playerId: string) => {
    setLineup((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleSaveScore = async () => {
    setSaving(true);
    try {
      // First update the score

      const goalScorerPayload = goalScorers.filter(
        (g) => g.playerName.trim() && g.minute !== "",
      );

      const response = onScoreUpdate(
        match._id,
        homeScore,
        awayScore,
        goalScorerPayload,
        lineup,
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update match");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setHomeScore(match.homeTeamScore || 0);
    setAwayScore(match.awayTeamScore || 0);
    setEditingScore(false);
  };

  // Get goal scorers by team for display
  const homeGoalScorers =
    match.goalScorers?.filter((g: any) => g.team === "home") || [];
  const awayGoalScorers =
    match.goalScorers?.filter((g: any) => g.team === "away") || [];

  const formatGoalScorer = (scorer: any) => {
    let text = `${scorer.playerName} (${scorer.minute}'`;
    if (scorer.isPenalty) text += " pen";
    if (scorer.isOwnGoal) text += " OG";
    text += ")";
    return text;
  };

  return (
    <article
      className="
        group relative border-b border-black/10 py-6
        transition-all duration-300 hover:border-[#e09225]
      "
    >
      {/* Main Row */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-black/40">
            <span>{match.competition}</span>
            {match.matchday && (
              <>
                <span className="h-1 w-1 rounded-full bg-black/20" />
                <span>MD {match.matchday}</span>
              </>
            )}
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
              <div className="text-right min-w-0">
                <h2 className="para text-base sm:text-lg lg:text-xl uppercase leading-tight truncate">
                  {match.homeTeam.name}
                </h2>
              </div>
              <Image
                src={match.homeTeam.image}
                alt={match.homeTeam.name}
                width={32}
                height={32}
                className="sm:w-10 sm:h-10 shrink-0"
              />
            </div>

            <div className="shrink-0">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="para text-2xl sm:text-3xl lg:text-4xl tabular-nums font-bold">
                    {match.homeTeamScore}
                  </span>
                  <span className="para text-xl sm:text-2xl lg:text-3xl text-black/20">
                    –
                  </span>
                  <span className="para text-2xl sm:text-3xl lg:text-4xl tabular-nums font-bold">
                    {match.awayTeamScore}
                  </span>
                </div>
                <button
                  onClick={() => setEditingScore(true)}
                  className="mt-0.5 text-[9px] uppercase tracking-wider text-black/25 hover:text-[#e09225] transition"
                >
                  Edit Score & Details
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
              <Image
                src={match.awayTeam.image}
                alt={match.awayTeam.name}
                width={32}
                height={32}
                className="sm:w-10 sm:h-10 shrink-0"
              />
              <div className="min-w-0">
                <h2 className="para text-base sm:text-lg lg:text-xl uppercase leading-tight truncate">
                  {match.awayTeam.name}
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-black/45">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formattedDate}
              <span className="text-black/20">•</span>
              {formattedTime}
            </div>
            {match.venue && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                {match.venue}
              </div>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
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

          {/* Goal Scorers Preview */}
          {(homeGoalScorers.length > 0 || awayGoalScorers.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              {homeGoalScorers.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Goal size={12} className="text-green-600" />
                  <span className="font-medium text-black/60">Home:</span>
                  <span className="text-black/50">
                    {homeGoalScorers.map(formatGoalScorer).join(", ")}
                  </span>
                </div>
              )}
              {awayGoalScorers.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Goal size={12} className="text-red-500" />
                  <span className="font-medium text-black/60">Away:</span>
                  <span className="text-black/50">
                    {awayGoalScorers.map(formatGoalScorer).join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {(match.goalScorers?.length > 0 || match.lineup?.length > 0) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-[10px] uppercase tracking-[0.15em] text-black/30 hover:text-[#e09225] transition flex items-center gap-1.5"
            >
              <Users size={12} />
              {showDetails ? "Hide" : "Show"} Details
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 lg:flex-col lg:gap-3">
          <button
            onClick={() => onEdit(match)}
            className="group/edit flex items-center gap-2 border-b border-black pb-1 uppercase text-xs transition hover:border-[#e09225] hover:text-[#e09225]"
          >
            <Edit2
              size={14}
              className="transition group-hover/edit:rotate-12"
            />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => onDelete(match._id)}
            className="text-black/35 transition hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-black/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3 flex items-center gap-2">
                <Goal size={14} />
                Goal Scorers
              </h4>
              {match.goalScorers?.length > 0 ? (
                <div className="space-y-1.5">
                  {match.goalScorers.map((scorer: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className={`text-xs font-medium w-12 ${
                          scorer.team === "home"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {scorer.team === "home" ? "Home" : "Away"}
                      </span>
                      <span className="font-medium">{scorer.playerName}</span>
                      <span className="text-black/40">{scorer.minute}'</span>
                      {scorer.isPenalty && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          PEN
                        </span>
                      )}
                      {scorer.isOwnGoal && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          OG
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-black/30 italic">No goal scorers</p>
              )}
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3 flex items-center gap-2">
                <Users size={14} />
                City Lineup ({match.lineup?.length || 0} players)
              </h4>
              {match.lineup?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {match.lineup.map((player: any, index: number) => {
                    const playerName = player.name || player;
                    return (
                      <span
                        key={index}
                        className="text-xs bg-black/5 px-2.5 py-1 rounded-full"
                      >
                        {playerName}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-black/30 italic">No lineup set</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ UPDATED SCORE EDIT OVERLAY ============ */}
      {editingScore && (
        <div className="inset-0 bg-[#ece1cf]/95 backdrop-blur-sm flex items-center justify-center z-50 fixed p-4">
          <div className="bg-[#FFF5E5] p-6 lg:p-8 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl">
            <h3 className="para text-2xl uppercase text-center mb-6">
              Update Match Details
            </h3>

            {/* Score Section */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-[0.35em] text-black/40 mb-4 text-center">
                Score
              </h4>
              <div className="flex items-center justify-center gap-6">
                {/* Home */}
                <div className="text-center">
                  <Image
                    src={match.homeTeam.image}
                    alt={match.homeTeam.name}
                    width={40}
                    height={40}
                    className="mx-auto mb-2"
                  />
                  <p className="text-xs uppercase tracking-wider text-black/60 mb-2 max-w-20 truncate">
                    {match.homeTeam.name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={homeScore}
                      onChange={(e) =>
                        setHomeScore(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-16 text-center para text-3xl border-b-2 border-black/20 focus:border-[#e09225] outline-none py-1 transition"
                      min="0"
                      max="99"
                    />
                    <button
                      onClick={() => setHomeScore(homeScore + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <span className="para text-3xl text-black/20">VS</span>

                {/* Away */}
                <div className="text-center">
                  <Image
                    src={match.awayTeam.image}
                    alt={match.awayTeam.name}
                    width={40}
                    height={40}
                    className="mx-auto mb-2"
                  />
                  <p className="text-xs uppercase tracking-wider text-black/60 mb-2 max-w-20 truncate">
                    {match.awayTeam.name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={awayScore}
                      onChange={(e) =>
                        setAwayScore(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-16 text-center para text-3xl border-b-2 border-black/20 focus:border-[#e09225] outline-none py-1 transition"
                      min="0"
                      max="99"
                    />
                    <button
                      onClick={() => setAwayScore(awayScore + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-black/10 my-6" />

            {/* Goal Scorers Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs uppercase tracking-[0.35em] text-black/40 flex items-center gap-2">
                  <Goal size={14} />
                  Goal Scorers
                </h4>
                <button
                  type="button"
                  onClick={addGoalScorer}
                  className="flex items-center gap-1.5 text-xs text-black/50 hover:text-[#e09225] transition"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {goalScorers.length === 0 && (
                  <p className="text-sm text-black/40 italic text-center py-2">
                    No goal scorers added yet.
                  </p>
                )}

                {goalScorers.map((scorer, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-3 border-b border-black/10 pb-3"
                  >
                    {/* Team */}
                    <div className="flex-1 min-w-22.5">
                      <select
                        value={scorer.team}
                        onChange={(e) =>
                          updateGoalScorer(
                            index,
                            "team",
                            e.target.value as "home" | "away",
                          )
                        }
                        className="w-full border-b-2 border-black/10 bg-transparent pb-1.5 text-sm outline-none focus:border-[#e09225] transition"
                      >
                        <option value="home">{match.homeTeam.name}</option>
                        <option value="away">{match.awayTeam.name}</option>
                      </select>
                    </div>

                    {/* Player Name */}
                    <div className="flex-1 min-w-27.5">
                      <input
                        type="text"
                        value={scorer.playerName}
                        onChange={(e) =>
                          updateGoalScorer(index, "playerName", e.target.value)
                        }
                        placeholder="Player name"
                        className="w-full border-b-2 border-black/10 bg-transparent pb-1.5 text-sm outline-none focus:border-[#e09225] transition"
                      />
                    </div>

                    {/* Minute */}
                    <div className="w-16">
                      <input
                        type="number"
                        value={scorer.minute}
                        onChange={(e) =>
                          updateGoalScorer(
                            index,
                            "minute",
                            parseInt(e.target.value) || "",
                          )
                        }
                        placeholder="min"
                        className="w-full border-b-2 border-black/10 bg-transparent pb-1.5 text-sm outline-none focus:border-[#e09225] transition"
                      />
                    </div>

                    {/* Penalty */}
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scorer.isPenalty}
                        onChange={(e) =>
                          updateGoalScorer(index, "isPenalty", e.target.checked)
                        }
                        className="cursor-pointer"
                      />
                      <span className="text-[10px] uppercase text-black/50">
                        Pen
                      </span>
                    </label>

                    {/* Own Goal */}
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scorer.isOwnGoal}
                        onChange={(e) =>
                          updateGoalScorer(index, "isOwnGoal", e.target.checked)
                        }
                        className="cursor-pointer"
                      />
                      <span className="text-[10px] uppercase text-black/50">
                        OG
                      </span>
                    </label>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeGoalScorer(index)}
                      className="text-black/30 hover:text-red-500 transition shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-black/10 my-6" />

            {/* Lineup Section */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-[0.35em] text-black/40 flex items-center gap-2 mb-3">
                <Users size={14} />
                City Lineup ({lineup.length} players)
              </h4>

              {loadingPlayers ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-black/20 border-t-[#e09225] rounded-full" />
                  <span className="text-sm text-black/40">
                    Loading players...
                  </span>
                </div>
              ) : allPlayers.length === 0 ? (
                <p className="text-sm text-black/40 italic">
                  No players found.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-37.5 overflow-y-auto">
                  {allPlayers
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((player) => (
                      <label
                        key={player._id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-black/5 transition cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={lineup.includes(player._id)}
                          onChange={() => togglePlayer(player._id)}
                          className="cursor-pointer shrink-0"
                        />
                        <span className="truncate">{player.name}</span>
                        <span className="text-[10px] text-black/30 ml-auto shrink-0">
                          {player.position}
                        </span>
                      </label>
                    ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-black/10">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2.5 border border-black/20 uppercase text-sm hover:bg-black/5 transition flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                disabled={saving}
                className="px-6 py-2.5 bg-[#06182e] text-white uppercase text-sm hover:bg-[#06182e]/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default MatchRow;
