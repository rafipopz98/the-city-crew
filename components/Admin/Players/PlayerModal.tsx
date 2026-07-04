"use client";

import { useState } from "react";
import { X } from "lucide-react";

import TCCButton from "@/components/common/TCCButton";
import TCCInput from "@/components/common/TCCInput";
import TCCSelect from "@/components/common/TCCSelect";

import SettingGroup from "./SettingGroup";
import SettingRow from "./SettingRow";

type Props = {
  open: boolean;
  onClose: () => void;
};

const PlayerModal = ({ open, onClose }: Props) => {
  const [form, setForm] = useState({
    name: "",
    country: "",
    position: "",
    season: "",
    shirtNumber: "",

    verticalImage: "",
    roundImage: "",

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
  });

  if (!open) return null;

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
                Add Player
              </h1>
            </div>

            <button
              onClick={onClose}
              className="
                transition-all
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
                options={[
                  { label: "Goalkeeper", value: "GK" },
                  { label: "Defender", value: "DEF" },
                  { label: "Midfielder", value: "MID" },
                  { label: "Forward", value: "FWD" },
                ]}
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
                options={[
                  { label: "2025/26", value: "2025/26" },
                  { label: "2024/25", value: "2024/25" },
                  { label: "2023/24", value: "2023/24" },
                ]}
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
          </SettingGroup>

          <SettingGroup title="Images">
            <SettingRow label="Vertical Image">
              <TCCInput
                placeholder="https://..."
                value={form.verticalImage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    verticalImage: e.target.value,
                  })
                }
              />
            </SettingRow>

            <SettingRow label="Round Image">
              <TCCInput
                placeholder="https://..."
                value={form.roundImage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    roundImage: e.target.value,
                  })
                }
              />
            </SettingRow>
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

          <TCCButton>Save Player</TCCButton>
        </footer>
      </div>
    </div>
  );
};

export default PlayerModal;
