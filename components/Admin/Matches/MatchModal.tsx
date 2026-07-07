"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import { clubLogos } from "@/public/club-logos";
import SettingRow from "../Players/SettingRow";
import TCCInput from "@/components/common/TCCInput";
import SettingGroup from "../Players/SettingGroup";
import TCCSelect from "@/components/common/TCCSelect";

type MatchModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  match?: any;
  seasons: Array<{ _id: string; year: string }>;
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
    isHome: true,
  });
  const [saving, setSaving] = useState(false);
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");

  useEffect(() => {
    if (match) {
      const matchDate = new Date(match.matchDate);
      const dateStr = matchDate.toISOString().split("T")[0];
      const timeStr = matchDate.toTimeString().slice(0, 5);

      setFormData({
        season: match.season?._id || match.season || "",
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeTeamScore: match.homeTeamScore,
        awayTeamScore: match.awayTeamScore,
        matchDate: dateStr,
        matchTime: timeStr,
        status: match.status,
        competition: match.competition,
        matchType: match.matchType || "regular",
        venue: match.venue || "",
        matchday: match.matchday || 1,
        isHome: match.isHome,
      });
      setSelectedAwayTeam(match.awayTeam.name);
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
      isHome: true,
    });
    setSelectedAwayTeam("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Log form data before submission
    console.log("Match Form Data:", formData);
    console.log("Selected Away Team:", selectedAwayTeam);
    console.log(
      "Match Date (UTC):",
      new Date(`${formData.matchDate}T${formData.matchTime}`).toISOString(),
    );

    setSaving(true);

    try {
      const dateTime = new Date(`${formData.matchDate}T${formData.matchTime}`);

      const payload = {
        ...formData,
        matchDate: dateTime.toISOString(),
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

              <SettingRow label="Kick-off (UK)">
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
            </SettingGroup>{" "}
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
