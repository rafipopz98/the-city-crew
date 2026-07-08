"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

import TCCButton from "@/components/common/TCCButton";
import TCCInput from "@/components/common/TCCInput";
import TCCSelect from "@/components/common/TCCSelect";

import SettingGroup from "./SettingGroup";
import SettingRow from "./SettingRow";
import { playerImages } from "@/public/players-image";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  player?: any;
  seasons: any[];
};

const PlayerModal = ({ open, onClose, onSave, player, seasons }: Props) => {
  const [form, setForm] = useState({
    name: "",
    country: "",
    position: "",
    season: "",
    shirtNumber: "",
    age: "",
    selectedPlayerImage: "",

    goals: 0,
    assists: 0,
    appearances: 0,
    minutesPlayed: 0,

    penaltyGoals: 0,
    penaltyMissed: 0,

    yellowCards: 0,
    redCards: 0,

    cleanSheets: 0,
    saves: 0,
    penaltySaved: 0,

    isCaptain: false,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availablePositions, setAvailablePositions] = useState<any[]>([]);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/admin/positions");
      if (response.ok) {
        const data = await response.json();
        // Flatten all positions from groups for the dropdown
        const allPositions = data
          .filter((group: any) => group.value !== "")
          .flatMap((group: any) =>
            group.positions.map((pos: string) => ({
              label: pos,
              value: pos,
            })),
          );
        setAvailablePositions(allPositions);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (player) {
      setForm({
        name: player.name || "",
        country: player.country || "",
        position: player.position || "",
        season: player.season?._id || player.season || "",
        shirtNumber: player.number?.toString() || "",
        age: player.age?.toString() || "",
        selectedPlayerImage: player.vertical_image || "",
        goals: player.goals || 0,
        assists: player.assists || 0,
        appearances: player.appearances || 0,
        minutesPlayed: player.minutes_played || 0,
        penaltyGoals: player.penalty_goals || 0,
        penaltyMissed: player.penalty_missed || 0,
        yellowCards: player.yellow_cards || 0,
        redCards: player.red_cards || 0,
        cleanSheets: player.clean_sheets || 0,
        saves: player.saves || 0,
        penaltySaved: player.penalty_saved || 0,
        isCaptain: player.is_captain || false,
        isActive: player.is_active !== undefined ? player.is_active : true,
      });
    } else {
      // Reset form for new player
      setForm({
        name: "",
        country: "",
        position: "",
        season: "",
        shirtNumber: "",
        age: "",
        selectedPlayerImage: "",
        goals: 0,
        assists: 0,
        appearances: 0,
        minutesPlayed: 0,
        penaltyGoals: 0,
        penaltyMissed: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
        saves: 0,
        penaltySaved: 0,
        isCaptain: false,
        isActive: true,
      });
    }
  }, [player]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Find selected image data
      const selectedImage = playerImages.find(
        (img) => img.value === form.selectedPlayerImage,
      );

      const url = player
        ? `/api/admin/players/${player._id}`
        : "/api/admin/players";

      const method = player ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          verticalImage: selectedImage?.verticalImage || "",
          roundImage: selectedImage?.roundImage || "",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save player");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const seasonOptions = seasons.map((season) => ({
    label: season.year,
    value: season._id,
  }));

  const playerImageOptions = playerImages.map((img) => ({
    label: img.name,
    value: img.value,
  }));

  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 z-999
        bg-black/60
        backdrop-blur-md
        p-3 lg:p-8
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
                Squad Management
              </p>
              <h1 className="para mt-4 text-5xl uppercase leading-none">
                {player ? "Edit Player" : "Add Player"}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="transition-all duration-300 hover:rotate-90 hover:text-[#e09225]"
            >
              <X size={26} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10 lg:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700">
              {error}
            </div>
          )}

          <SettingGroup title="Player">
            <SettingRow label="Player Name">
              <TCCInput
                placeholder="Erling Haaland"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Country">
              <TCCInput
                placeholder="Norway"
                value={form.country}
                onChange={(e) =>
                  setForm({
                    ...form,
                    country: e.target.value,
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Position">
              <TCCSelect
                value={form.position}
                onChange={(value) =>
                  setForm({
                    ...form,
                    position: value,
                  })
                }
                options={availablePositions}
              />
            </SettingRow>

            <SettingRow label="Season">
              <TCCSelect
                value={form.season}
                onChange={(value) =>
                  setForm({
                    ...form,
                    season: value,
                  })
                }
                options={seasonOptions}
              />
            </SettingRow>

            <SettingRow label="Shirt Number">
              <TCCInput
                type="number"
                value={form.shirtNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shirtNumber: e.target.value,
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Age">
              <TCCInput
                type="number"
                value={form.age}
                onChange={(e) =>
                  setForm({
                    ...form,
                    age: e.target.value,
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Captain">
              <TCCSelect
                value={form.isCaptain ? "true" : "false"}
                onChange={(value) =>
                  setForm({
                    ...form,
                    isCaptain: value === "true",
                  })
                }
                options={[
                  { label: "No", value: "false" },
                  { label: "Yes", value: "true" },
                ]}
              />
            </SettingRow>

            <SettingRow label="Status">
              <TCCSelect
                value={form.isActive ? "true" : "false"}
                onChange={(value) =>
                  setForm({
                    ...form,
                    isActive: value === "true",
                  })
                }
                options={[
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ]}
              />
            </SettingRow>
          </SettingGroup>

          <SettingGroup title="Player Image">
            <SettingRow label="Select Player">
              <TCCSelect
                value={form.selectedPlayerImage}
                onChange={(value) =>
                  setForm({
                    ...form,
                    selectedPlayerImage: value,
                  })
                }
                options={playerImageOptions}
              />
            </SettingRow>

            {form.selectedPlayerImage && (
              <div className="mt-4 flex gap-6">
                {(() => {
                  const selectedImg = playerImages.find(
                    (img) => img.value === form.selectedPlayerImage,
                  );
                  return selectedImg ? (
                    <>
                      <div className="text-center">
                        <img
                          src={selectedImg.verticalImage}
                          alt={selectedImg.alt}
                          className="h-32 w-auto object-contain border border-black/10"
                        />
                        <p className="mt-2 text-xs text-black/60">
                          Vertical Image
                        </p>
                      </div>
                      <div className="text-center">
                        <img
                          src={selectedImg.roundImage}
                          alt={selectedImg.alt}
                          className="h-32 w-32 rounded-full object-cover border border-black/10"
                        />
                        <p className="mt-2 text-xs text-black/60">
                          Round Image
                        </p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </SettingGroup>

          <SettingGroup title="Attack">
            <SettingRow label="Goals">
              <TCCInput
                type="number"
                value={form.goals}
                onChange={(e) =>
                  setForm({
                    ...form,
                    goals: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Assists">
              <TCCInput
                type="number"
                value={form.assists}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assists: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Appearances">
              <TCCInput
                type="number"
                value={form.appearances}
                onChange={(e) =>
                  setForm({
                    ...form,
                    appearances: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Minutes Played">
              <TCCInput
                type="number"
                value={form.minutesPlayed}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minutesPlayed: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Penalty Goals">
              <TCCInput
                type="number"
                value={form.penaltyGoals}
                onChange={(e) =>
                  setForm({
                    ...form,
                    penaltyGoals: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Penalty Missed">
              <TCCInput
                type="number"
                value={form.penaltyMissed}
                onChange={(e) =>
                  setForm({
                    ...form,
                    penaltyMissed: Number(e.target.value),
                  })
                }
              />
            </SettingRow>
          </SettingGroup>

          <SettingGroup title="Discipline">
            <SettingRow label="Yellow Cards">
              <TCCInput
                type="number"
                value={form.yellowCards}
                onChange={(e) =>
                  setForm({
                    ...form,
                    yellowCards: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Red Cards">
              <TCCInput
                type="number"
                value={form.redCards}
                onChange={(e) =>
                  setForm({
                    ...form,
                    redCards: Number(e.target.value),
                  })
                }
              />
            </SettingRow>
          </SettingGroup>

          <SettingGroup title="Goalkeeper">
            <SettingRow label="Clean Sheets">
              <TCCInput
                type="number"
                value={form.cleanSheets}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cleanSheets: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Saves">
              <TCCInput
                type="number"
                value={form.saves}
                onChange={(e) =>
                  setForm({
                    ...form,
                    saves: Number(e.target.value),
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Penalty Saved">
              <TCCInput
                type="number"
                value={form.penaltySaved}
                onChange={(e) =>
                  setForm({
                    ...form,
                    penaltySaved: Number(e.target.value),
                  })
                }
              />
            </SettingRow>
          </SettingGroup>
        </main>

        <footer className="flex items-center justify-end gap-10 border-t border-black/10 px-6 py-6 lg:px-10">
          <TCCButton onClick={onClose}>Cancel</TCCButton>
          <TCCButton onClick={handleSubmit}>
            {loading ? "Saving..." : "Save Player"}
          </TCCButton>
        </footer>
      </div>
    </div>
  );
};

export default PlayerModal;
