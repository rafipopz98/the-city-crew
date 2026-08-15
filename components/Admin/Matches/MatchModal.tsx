"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { clubLogos } from "@/public/club-logos";
import SettingRow from "../Players/SettingRow";
import TCCInput from "@/components/common/TCCInput";
import SettingGroup from "../Players/SettingGroup";
import TCCSelect from "@/components/common/TCCSelect";
import PitchSvg from "@/components/BuildXI/PitchSvg";
import {
  SLOT_FORMATIONS,
  generateCoords,
  formationSlotLabels,
} from "@/constants/formation";
import { getPreferredName } from "@/components/MatchDetail/lineup/shared";

type MatchModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  match?: any;
  seasons: Array<{ _id: string; year: string }>;
};

type GoalScorer = {
  team: "home" | "away";
  playerName: string;
  minute: number | string;
  isPenalty: boolean;
  isOwnGoal: boolean;
};

const competitions = [
  "Premier League",
  "UCL",
  "FA Cup",
  "Carabao Cup",
  "FIFA Club World Cup",
  "Community Shield",
  "Friendly",
];

const matchTypes = [
  "regular",
  "group",
  "qf 1",
  "qf 2",
  "sf 1",
  "sf 2",
  "final",
];

const statuses = ["upcoming", "live", "finished", "postponed", "cancelled"];

const MatchModal = ({
  open,
  onClose,
  onSave,
  match,
  seasons,
}: MatchModalProps) => {
  const [formData, setFormData] = useState({
    season: "",
    homeTeam: {
      name: "Manchester City",
      image: "/club-logos/Manchester_City.webp",
    },
    awayTeam: { name: "", image: "" },
    homeTeamScore: 0,
    awayTeamScore: 0,
    matchDate: "",
    matchTime: "15:00",
    status: "upcoming",
    competition: "Premier League",
    matchType: "regular",
    venue: "Etihad Stadium",
    matchday: 1,
    formation: "4-3-3",
    isHome: true,
  });

  // New state for goal scorers
  const [goalScorers, setGoalScorers] = useState<GoalScorer[]>([]);

  // New state for lineup — 11 formation slots + bench subs
  const [lineupSlots, setLineupSlots] = useState<(string | null)[]>(
    Array(11).fill(null),
  );
  const [subs, setSubs] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  // All players from the season
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const [saving, setSaving] = useState(false);
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");

  // Fetch players when season changes or modal opens
  useEffect(() => {
    if (open && formData.season) {
      fetchPlayers(formData.season);
    }
  }, [open, formData.season]);

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

  useEffect(() => {
    if (match) {
      const matchDate = new Date(match.matchDate);
      const pad = (n: number) => String(n).padStart(2, "0");
      // Derive both from local getters so the date shown always matches the
      // time shown (mixing a UTC date with a local time can show the wrong
      // day near midnight), and so it lines up with the local -> UTC
      // conversion done on save below.
      const dateStr = `${matchDate.getFullYear()}-${pad(matchDate.getMonth() + 1)}-${pad(matchDate.getDate())}`;
      const timeStr = `${pad(matchDate.getHours())}:${pad(matchDate.getMinutes())}`;

      // Always normalize so the City row is the home slot in the form and the
      // opponent is the away slot, regardless of which side City is actually on.
      const cityIsHome = match.homeTeam?.name === "Manchester City";

      setFormData({
        season: match.season?._id || match.season || "",
        homeTeam: cityIsHome ? match.homeTeam : match.awayTeam,
        awayTeam: cityIsHome ? match.awayTeam : match.homeTeam,
        homeTeamScore: match.homeTeamScore,
        awayTeamScore: match.awayTeamScore,
        matchDate: dateStr,
        matchTime: timeStr,
        status: match.status,
        competition: match.competition,
        matchType: match.matchType || "regular",
        venue: match.venue || "",
        matchday: match.matchday || 1,
        formation: match.formation || "4-3-3",
        isHome: match.isHome ?? cityIsHome,
      });

      // Set goal scorers from match data
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

      // Set lineup: first 11 players fill formation slots, rest are subs
      const lineupIds: string[] = (match.lineup || []).map(
        (p: any) => p._id || p,
      );
      const slots = Array(11).fill(null) as (string | null)[];
      lineupIds.slice(0, 11).forEach((id: string, i: number) => {
        slots[i] = id;
      });
      setLineupSlots(slots);
      setSubs(lineupIds.slice(11));
      setActiveSlot(null);

      setSelectedAwayTeam(cityIsHome ? match.awayTeam.name : match.homeTeam.name);
    } else {
      resetForm();
    }
  }, [match, open]);

  const resetForm = () => {
    setFormData({
      season: seasons[0]?._id || "",
      homeTeam: {
        name: "Manchester City",
        image: "/club-logos/Manchester_City.webp",
      },
      awayTeam: { name: "", image: "" },
      homeTeamScore: 0,
      awayTeamScore: 0,
      matchDate: "",
      matchTime: "15:00",
      status: "upcoming",
      competition: "Premier League",
      matchType: "regular",
      venue: "Etihad Stadium",
      matchday: 1,
      formation: "4-3-3",
      isHome: true,
    });
    setSelectedAwayTeam("");
    setGoalScorers([]);
    setLineupSlots(Array(11).fill(null));
    setSubs([]);
    setActiveSlot(null);
  };

  const handleAwayTeamSelect = (teamName: string) => {
    const team = clubLogos.find((t) => t.title === teamName);
    if (team) {
      setSelectedAwayTeam(teamName);
      setFormData((prev) => ({
        ...prev,
        awayTeam: {
          name: team.title,
          image: team.path,
        },
      }));
    }
  };

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

  // Lineup Functions — assign to a formation slot, clear a slot, toggle subs
  const assignToSlot = (playerId: string) => {
    if (activeSlot === null) return;
    setLineupSlots((prev) =>
      prev.map((id, i) => (i === activeSlot ? playerId : id)),
    );
    setSubs((prev) => prev.filter((id) => id !== playerId));
    setActiveSlot(null);
  };

  const clearSlot = (index: number) => {
    setLineupSlots((prev) => prev.map((id, i) => (i === index ? null : id)));
  };

  const toggleSub = (playerId: string) => {
    setSubs((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
    setLineupSlots((prev) =>
      prev.map((id) => (id === playerId ? null : id)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dateTime = new Date(`${formData.matchDate}T${formData.matchTime}`);

      // When City plays away, swap the teams so the opponent is stored as the
      // home team and City as the away team (matching how it's displayed).
      const isHome = formData.isHome;

      const payload = {
        ...formData,
        matchDate: dateTime.toISOString(),
        homeTeam: isHome ? formData.homeTeam : formData.awayTeam,
        awayTeam: isHome ? formData.awayTeam : formData.homeTeam,
        goalScorers: goalScorers.filter(
          (g) => g.playerName.trim() && g.minute !== "",
        ),
        lineup: [...lineupSlots.filter((id): id is string => !!id), ...subs],
      };

      const url = match
        ? `/api/admin/matches/${match._id}`
        : "/api/admin/matches";

      const method = match ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save match");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving match:", error);
      alert("Failed to save match");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="
      fixed
      inset-0
      z-50

      bg-black/60
      backdrop-blur-md

      p-3
      lg:p-8
    "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
        mx-auto

        flex
        h-full
        max-h-[96vh]
        w-full
        max-w-5xl

        flex-col

        overflow-hidden

        bg-[#ece1cf]
      "
      >
        {/* Header */}
        <header className="border-b border-black/10 px-6 py-6 lg:px-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
                Fixture
              </p>
              <h1 className="para mt-4 text-5xl uppercase leading-none">
                {match ? "Edit Match" : "Add Match"}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="
              transition
              duration-300

              hover:rotate-90
              hover:text-[#e09225]
            "
            >
              <X size={26} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10 lg:px-10">
          <form onSubmit={handleSubmit} className="space-y-14">
            {/* Existing Form Sections */}
            <SettingGroup title="Match">
              <SettingRow label="Season">
                <TCCSelect
                  value={formData.season}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      season: value,
                    }))
                  }
                  options={seasons.map((season) => ({
                    label: season.year,
                    value: season._id,
                  }))}
                />
              </SettingRow>

              <SettingRow label="Competition">
                <TCCSelect
                  value={formData.competition}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      competition: value,
                    }))
                  }
                  options={competitions.map((competition) => ({
                    label: competition,
                    value: competition,
                  }))}
                />
              </SettingRow>

              <SettingRow label="Date">
                <TCCInput
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      matchDate: e.target.value,
                    }))
                  }
                />
              </SettingRow>

              <SettingRow label="Kick-off">
                <TCCInput
                  type="time"
                  value={formData.matchTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      matchTime: e.target.value,
                    }))
                  }
                />
              </SettingRow>

              <SettingRow label="Venue">
                <TCCInput
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      venue: e.target.value,
                    }))
                  }
                  placeholder="Etihad Stadium"
                />
              </SettingRow>

              <SettingRow label="Matchday">
                <TCCInput
                  type="number"
                  value={String(formData.matchday)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      matchday: Number(e.target.value),
                    }))
                  }
                />
              </SettingRow>
            </SettingGroup>

            <SettingGroup title="Teams">
              <SettingRow label="Manchester City">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0">
                    <Image
                      src={formData.homeTeam.image}
                      alt={formData.homeTeam.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-medium">
                      {formData.homeTeam.name}
                    </h3>
                  </div>
                </div>
              </SettingRow>

              <SettingRow label="Opponent">
                <div className="flex items-center gap-5">
                  <div
                    className="
                    relative

                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                  "
                  >
                    {formData.awayTeam.image ? (
                      <Image
                        src={formData.awayTeam.image}
                        alt={formData.awayTeam.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-xs text-black/25">Logo</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <TCCSelect
                      value={selectedAwayTeam}
                      onChange={handleAwayTeamSelect}
                      options={[
                        {
                          label: "Select opponent",
                          value: "",
                        },

                        ...clubLogos
                          .filter((club) => club.title !== "Manchester City")
                          .map((club) => ({
                            label: club.title,
                            value: club.title,
                          })),
                      ]}
                    />
                  </div>
                </div>
              </SettingRow>

              <SettingRow label="Location">
                <div className="flex gap-8">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      checked={formData.isHome}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isHome: true,
                        }))
                      }
                    />
                    <span>Home</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      checked={!formData.isHome}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isHome: false,
                        }))
                      }
                    />
                    <span>Away</span>
                  </label>
                </div>
              </SettingRow>
            </SettingGroup>

            <SettingGroup title="Match Status">
              <SettingRow label="Status">
                <TCCSelect
                  value={formData.status}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                  options={statuses.map((status) => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: status,
                  }))}
                />
              </SettingRow>
            </SettingGroup>

            {/* ============ GOAL SCORERS SECTION ============ */}
            <SettingGroup title="Goal Scorers">
              <div className="space-y-4">
                {goalScorers.length === 0 && (
                  <p className="text-sm text-black/40 italic">
                    No goal scorers added yet.
                  </p>
                )}

                {goalScorers.map((scorer, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-4 border-b border-black/10 pb-4"
                  >
                    {/* Team */}
                    <div className="flex-1 min-w-25">
                      <label className="text-xs uppercase tracking-[0.2em] text-black/40 block mb-1">
                        Team
                      </label>
                      <select
                        value={scorer.team}
                        onChange={(e) =>
                          updateGoalScorer(
                            index,
                            "team",
                            e.target.value as "home" | "away",
                          )
                        }
                        className="w-full border-b-2 border-black/10 bg-transparent pb-2 text-sm outline-none focus:border-[#e09225] transition"
                      >
                        <option value="home">
                          {formData.isHome
                            ? formData.homeTeam.name
                            : formData.awayTeam.name || "Home"}
                        </option>
                        <option value="away">
                          {formData.isHome
                            ? formData.awayTeam.name
                            : formData.homeTeam.name || "Away"}
                        </option>
                      </select>
                    </div>

                    {/* Player Name */}
                    <div className="flex-1 min-w-30">
                      <label className="text-xs uppercase tracking-[0.2em] text-black/40 block mb-1">
                        Player
                      </label>
                      <input
                        type="text"
                        value={scorer.playerName}
                        onChange={(e) =>
                          updateGoalScorer(index, "playerName", e.target.value)
                        }
                        placeholder="e.g. Haaland"
                        className="w-full border-b-2 border-black/10 bg-transparent pb-2 text-sm outline-none focus:border-[#e09225] transition"
                      />
                    </div>

                    {/* Minute */}
                    <div className="w-20">
                      <label className="text-xs uppercase tracking-[0.2em] text-black/40 block mb-1">
                        Minute
                      </label>
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
                        placeholder="45"
                        className="w-full border-b-2 border-black/10 bg-transparent pb-2 text-sm outline-none focus:border-[#e09225] transition"
                      />
                    </div>

                    {/* Is Penalty */}
                    <div className="flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={scorer.isPenalty}
                          onChange={(e) =>
                            updateGoalScorer(
                              index,
                              "isPenalty",
                              e.target.checked,
                            )
                          }
                          className="cursor-pointer"
                        />
                        <span className="text-black/60 text-xs uppercase tracking-widest">
                          Pen
                        </span>
                      </label>
                    </div>

                    {/* Is Own Goal */}
                    <div className="flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={scorer.isOwnGoal}
                          onChange={(e) =>
                            updateGoalScorer(
                              index,
                              "isOwnGoal",
                              e.target.checked,
                            )
                          }
                          className="cursor-pointer"
                        />
                        <span className="text-black/60 text-xs uppercase tracking-widest">
                          OG
                        </span>
                      </label>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeGoalScorer(index)}
                      className="text-black/30 hover:text-red-500 transition shrink-0 pb-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGoalScorer}
                  className="flex items-center gap-2 text-sm text-black/50 hover:text-[#e09225] transition"
                >
                  <Plus size={16} />
                  Add Goal Scorer
                </button>
              </div>
            </SettingGroup>

            {/* ============ CITY LINEUP SECTION ============ */}
            <SettingGroup title="City Lineup">
              <SettingRow label="Formation">
                <TCCSelect
                  value={formData.formation}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, formation: value }))
                  }
                  options={SLOT_FORMATIONS.map((formation) => ({
                    label: formation,
                    value: formation,
                  }))}
                />
              </SettingRow>

              <div className="space-y-4">
                {loadingPlayers ? (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 size={20} className="animate-spin text-black/30" />
                    <span className="text-sm text-black/40">
                      Loading players...
                    </span>
                  </div>
                ) : allPlayers.length === 0 ? (
                  <p className="text-sm text-black/40 italic">
                    No players found for this season.
                  </p>
                ) : (
                  <>
                    {/* Mini pitch with formation slots */}
                    <div className="relative w-full max-w-[320px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-[#06182e]">
                      <div className="absolute inset-0">
                        <PitchSvg />
                      </div>

                      {generateCoords(formData.formation).map(([x, y], i) => {
                        const playerId = lineupSlots[i];
                        const player = playerId
                          ? allPlayers.find((p) => p._id === playerId)
                          : null;
                        const isActive = activeSlot === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setActiveSlot(isActive ? null : i)
                            }
                            style={{ left: `${x}%`, top: `${y}%` }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 transition-transform duration-200 ${
                              isActive ? "scale-110" : ""
                            }`}
                          >
                            {player ? (
                              <>
                                <div className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={
                                      player.round_image ||
                                      player.vertical_image
                                    }
                                    alt={player.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white object-contain ring-2 ring-[#e09225]"
                                  />
                                  {isActive && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearSlot(i);
                                      }}
                                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                                <span className="text-[8px] font-bold text-[#ece1cf] max-w-14 truncate">
                                  {getPreferredName(player.name)}
                                </span>
                              </>
                            ) : (
                              <>
                                <div
                                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-dashed flex items-center justify-center ${
                                    isActive
                                      ? "border-[#e09225] bg-[#e09225]/15"
                                      : "border-[#ece1cf]/40 bg-white/5"
                                  }`}
                                >
                                  <span className="text-[#e09225] text-sm font-bold">
                                    +
                                  </span>
                                </div>
                                <span className="text-[7px] uppercase tracking-wider text-[#ece1cf]/40">
                                  {formationSlotLabels(formData.formation)[i]}
                                </span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs text-black/40 text-center">
                      Tap a slot to pick a player ·{" "}
                      {lineupSlots.filter(Boolean).length}/11 in XI ·{" "}
                      {subs.length} on bench
                    </p>

                    {/* Player picker when a slot is active */}
                    {activeSlot !== null && (
                      <div className="p-3 bg-black/5 border border-black/10 rounded-xl">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/40 mb-2">
                          Slot {activeSlot + 1} ·{" "}
                          {formationSlotLabels(formData.formation)[activeSlot]}{" "}
                          — pick player
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                          {allPlayers
                            .filter((p) => !lineupSlots.includes(p._id))
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((player) => (
                              <button
                                key={player._id}
                                type="button"
                                onClick={() => assignToSlot(player._id)}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-black/10 transition text-left"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    player.round_image ||
                                    player.vertical_image
                                  }
                                  alt={player.name}
                                  className="w-6 h-6 rounded-full bg-white object-contain"
                                />
                                <span className="text-sm truncate">
                                  {getPreferredName(player.name)}
                                </span>
                                <span className="text-[10px] text-black/30 ml-auto shrink-0">
                                  {player.position}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Subs */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-black/40 mb-2">
                        Substitutes ({subs.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-37.5 overflow-y-auto">
                        {allPlayers
                          .filter((p) => !lineupSlots.includes(p._id))
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((player) => (
                            <label
                              key={player._id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-black/5 transition cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={subs.includes(player._id)}
                                onChange={() => toggleSub(player._id)}
                                className="cursor-pointer"
                              />
                              <span className="text-sm truncate">
                                {getPreferredName(player.name)}
                              </span>
                              <span className="text-xs text-black/30 ml-auto shrink-0">
                                {player.position}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SettingGroup>
          </form>
        </main>

        {/* Footer */}
        <footer
          className="
          flex
          items-center
          justify-between

          border-t
          border-black/10

          px-6
          py-6

          lg:px-10
        "
        >
          <p
            className="
            hidden
            text-sm
            text-black/35

            md:block
          "
          >
            All changes will be saved after submitting.
          </p>

          <div className="flex items-center gap-8 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="
              text-sm

              uppercase

              tracking-[0.25em]

              text-black/45

              transition

              hover:text-black
            "
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="
              flex
              items-center
              gap-3

              border-b-2
              border-black

              pb-1

              para

              uppercase

              transition-all
              duration-300

              hover:border-[#e09225]
              hover:text-[#e09225]

              disabled:opacity-40
              disabled:pointer-events-none
            "
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {match ? "Update Match" : "Save Match"}
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MatchModal;
