"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import TCCButton from "@/components/common/TCCButton";
import TCCInput from "@/components/common/TCCInput";
import TCCSelect from "@/components/common/TCCSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  player?: any;
};

const RARITY_OPTIONS = [
  { label: "Basic", value: "Basic" },
  { label: "Common", value: "Common" },
  { label: "Uncommon", value: "Uncommon" },
  { label: "Rare", value: "Rare" },
  { label: "Epic", value: "Epic" },
  { label: "Legendary", value: "Legendary" },
];

const FOOT_OPTIONS = [
  { label: "Left", value: "Left" },
  { label: "Right", value: "Right" },
  { label: "Both", value: "Both" },
];

const WORK_RATE_OPTIONS = [
  { label: "Low/Low", value: "Low/Low" },
  { label: "Low/Medium", value: "Low/Medium" },
  { label: "Low/High", value: "Low/High" },
  { label: "Medium/Low", value: "Medium/Low" },
  { label: "Medium/Medium", value: "Medium/Medium" },
  { label: "Medium/High", value: "Medium/High" },
  { label: "High/Low", value: "High/Low" },
  { label: "High/Medium", value: "High/Medium" },
  { label: "High/High", value: "High/High" },
];

const POSITION_OPTIONS = [
  { label: "GK", value: "GK" },
  { label: "CB", value: "CB" },
  { label: "LB", value: "LB" },
  { label: "RB", value: "RB" },
  { label: "LWB", value: "LWB" },
  { label: "RWB", value: "RWB" },
  { label: "CDM", value: "CDM" },
  { label: "CM", value: "CM" },
  { label: "CAM", value: "CAM" },
  { label: "LM", value: "LM" },
  { label: "RM", value: "RM" },
  { label: "LW", value: "LW" },
  { label: "RW", value: "RW" },
  { label: "ST", value: "ST" },
  { label: "CF", value: "CF" },
];

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-[11px] uppercase tracking-[0.35em] text-black/40 mb-6 pb-2 border-b border-black/10">
        {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <label className="text-sm font-medium text-black/60 w-48 shrink-0">{label}</label>
      <div className="flex-1 max-w-md">{children}</div>
    </div>
  );
}

const initialForm = {
  player_id: 0,
  short_name: "",
  long_name: "",
  age: 25,
  nationality: "",
  positions: [] as string[],
  overall: 50,
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physic: 50,
  image_url: "",
  rarity: "Basic",
  required_xp: 0,
  price: 0,
  preferred_foot: "Right",
  weak_foot: 3,
  skill_moves: 3,
  work_rate: "Medium/Medium",
  player_traits: [] as string[],
  // Individual attributes
  attacking_finishing: 50,
  attacking_short_passing: 50,
  skill_ball_control: 50,
  movement_acceleration: 50,
  movement_sprint_speed: 50,
  movement_reactions: 50,
  power_shot_power: 50,
  power_stamina: 50,
  power_strength: 50,
  mentality_positioning: 50,
  mentality_vision: 50,
  mentality_composure: 50,
  defending_marking_awareness: 50,
  defending_standing_tackle: 50,
  defending_sliding_tackle: 50,
  goalkeeping_diving: 10,
  goalkeeping_handling: 10,
  goalkeeping_kicking: 10,
  goalkeeping_positioning: 10,
  goalkeeping_reflexes: 10,
  goalkeeping_speed: 10,
};

export default function GamePlayerModal({ open, onClose, onSave, player }: Props) {
  const [form, setForm] = useState(initialForm);
  const [traitInput, setTraitInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (player) {
      setForm({
        player_id: player.player_id || 0,
        short_name: player.short_name || "",
        long_name: player.long_name || "",
        age: player.age || 25,
        nationality: player.nationality || "",
        positions: player.positions || [],
        overall: player.overall || 50,
        pace: player.pace || 50,
        shooting: player.shooting || 50,
        passing: player.passing || 50,
        dribbling: player.dribbling || 50,
        defending: player.defending || 50,
        physic: player.physic || 50,
        image_url: player.image_url || "",
        rarity: player.rarity || "Basic",
        required_xp: player.required_xp || 0,
        price: player.price || 0,
        preferred_foot: player.preferred_foot || "Right",
        weak_foot: player.weak_foot || 3,
        skill_moves: player.skill_moves || 3,
        work_rate: player.work_rate || "Medium/Medium",
        player_traits: player.player_traits || [],
        attacking_finishing: player.attacking_finishing ?? 50,
        attacking_short_passing: player.attacking_short_passing ?? 50,
        skill_ball_control: player.skill_ball_control ?? 50,
        movement_acceleration: player.movement_acceleration ?? 50,
        movement_sprint_speed: player.movement_sprint_speed ?? 50,
        movement_reactions: player.movement_reactions ?? 50,
        power_shot_power: player.power_shot_power ?? 50,
        power_stamina: player.power_stamina ?? 50,
        power_strength: player.power_strength ?? 50,
        mentality_positioning: player.mentality_positioning ?? 50,
        mentality_vision: player.mentality_vision ?? 50,
        mentality_composure: player.mentality_composure ?? 50,
        defending_marking_awareness: player.defending_marking_awareness ?? 50,
        defending_standing_tackle: player.defending_standing_tackle ?? 50,
        defending_sliding_tackle: player.defending_sliding_tackle ?? 50,
        goalkeeping_diving: player.goalkeeping_diving ?? 10,
        goalkeeping_handling: player.goalkeeping_handling ?? 10,
        goalkeeping_kicking: player.goalkeeping_kicking ?? 10,
        goalkeeping_positioning: player.goalkeeping_positioning ?? 10,
        goalkeeping_reflexes: player.goalkeeping_reflexes ?? 10,
        goalkeeping_speed: player.goalkeeping_speed ?? 10,
      });
    } else {
      setForm(initialForm);
    }
  }, [player]);

  const updateField = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addTrait = () => {
    const t = traitInput.trim();
    if (t && !form.player_traits.includes(t)) {
      setForm((f) => ({ ...f, player_traits: [...f.player_traits, t] }));
      setTraitInput("");
    }
  };

  const removeTrait = (trait: string) => {
    setForm((f) => ({ ...f, player_traits: f.player_traits.filter((t) => t !== trait) }));
  };

  const togglePosition = (pos: string) => {
    setForm((f) => ({
      ...f,
      positions: f.positions.includes(pos)
        ? f.positions.filter((p) => p !== pos)
        : [...f.positions, pos],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const url = player ? `/api/admin/game-players/${player._id}` : "/api/admin/game-players";
      const method = player ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-999 bg-black/60 backdrop-blur-md p-3 lg:p-8">
      <div onClick={(e) => e.stopPropagation()} className="mx-auto flex h-full max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden bg-[#ece1cf]">
        {/* Header */}
        <header className="border-b border-black/10 px-6 py-6 lg:px-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Game Management</p>
              <h1 className="para mt-4 text-5xl uppercase leading-none">{player ? "Edit Game Player" : "Add Game Player"}</h1>
            </div>
            <button onClick={onClose} className="transition-all duration-300 hover:rotate-90 hover:text-[#e09225]">
              <X size={26} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10 lg:px-10">
          {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700">{error}</div>}

          {/* Basic Info */}
          <SettingGroup title="Basic Information">
            <SettingRow label="Player ID">
              <TCCInput type="number" value={form.player_id} onChange={(e) => updateField("player_id", Number(e.target.value))} />
            </SettingRow>
            <SettingRow label="Short Name">
              <TCCInput placeholder="E. Haaland" value={form.short_name} onChange={(e) => updateField("short_name", e.target.value)} />
            </SettingRow>
            <SettingRow label="Full Name">
              <TCCInput placeholder="Erling Haaland" value={form.long_name} onChange={(e) => updateField("long_name", e.target.value)} />
            </SettingRow>
            <SettingRow label="Age">
              <TCCInput type="number" value={form.age} onChange={(e) => updateField("age", Number(e.target.value))} />
            </SettingRow>
            <SettingRow label="Nationality">
              <TCCInput placeholder="Norway" value={form.nationality} onChange={(e) => updateField("nationality", e.target.value)} />
            </SettingRow>
            <SettingRow label="Image URL">
              <TCCInput placeholder="https://..." value={form.image_url} onChange={(e) => updateField("image_url", e.target.value)} />
            </SettingRow>
          </SettingGroup>

          {/* Positions */}
          <SettingGroup title="Positions">
            <div className="flex flex-wrap gap-2">
              {POSITION_OPTIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => togglePosition(pos.value)}
                  className={`px-4 py-2 border text-sm font-medium uppercase transition-all duration-300 ${
                    form.positions.includes(pos.value)
                      ? "border-[#e09225] bg-[#e09225] text-black"
                      : "border-black/15 text-black/60 hover:border-black hover:bg-black hover:text-white"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </SettingGroup>

          {/* Rarity & Pricing */}
          <SettingGroup title="Rarity & Pricing">
            <SettingRow label="Rarity">
              <TCCSelect value={form.rarity} onChange={(v) => updateField("rarity", v)} options={RARITY_OPTIONS} />
            </SettingRow>
            <SettingRow label="Overall Rating">
              <TCCInput type="number" min={0} max={99} value={form.overall} onChange={(e) => updateField("overall", Number(e.target.value))} />
            </SettingRow>
            <SettingRow label="Price (coins)">
              <TCCInput type="number" value={form.price} onChange={(e) => updateField("price", Number(e.target.value))} />
            </SettingRow>
            <SettingRow label="Required XP">
              <TCCInput type="number" value={form.required_xp} onChange={(e) => updateField("required_xp", Number(e.target.value))} />
            </SettingRow>
          </SettingGroup>

          {/* Main Stats */}
          <SettingGroup title="Main Attributes (0-99)">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "pace", label: "PAC" },
                { key: "shooting", label: "SHO" },
                { key: "passing", label: "PAS" },
                { key: "dribbling", label: "DRI" },
                { key: "defending", label: "DEF" },
                { key: "physic", label: "PHY" },
              ].map((s) => (
                <div key={s.key}>
                  <label className="text-xs font-mono font-bold text-black/50">{s.label}</label>
                  <input
                    type="number" min={0} max={99}
                    value={(form as any)[s.key]}
                    onChange={(e) => updateField(s.key, Number(e.target.value))}
                    className="w-full h-12 border-b-2 border-black/15 bg-transparent text-2xl para outline-none focus:border-[#e09225] transition-all"
                  />
                </div>
              ))}
            </div>
          </SettingGroup>

          {/* Individual Attributes */}
          <SettingGroup title="Detailed Attributes">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {[
                { key: "attacking_finishing", label: "Finishing" },
                { key: "attacking_short_passing", label: "Short Passing" },
                { key: "skill_ball_control", label: "Ball Control" },
                { key: "movement_acceleration", label: "Acceleration" },
                { key: "movement_sprint_speed", label: "Sprint Speed" },
                { key: "movement_reactions", label: "Reactions" },
                { key: "power_shot_power", label: "Shot Power" },
                { key: "power_stamina", label: "Stamina" },
                { key: "power_strength", label: "Strength" },
                { key: "mentality_positioning", label: "Positioning" },
                { key: "mentality_vision", label: "Vision" },
                { key: "mentality_composure", label: "Composure" },
                { key: "defending_marking_awareness", label: "Marking" },
                { key: "defending_standing_tackle", label: "Standing Tackle" },
                { key: "defending_sliding_tackle", label: "Sliding Tackle" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <label className="text-xs text-black/50 w-28 shrink-0">{s.label}</label>
                  <input
                    type="number" min={0} max={99}
                    value={(form as any)[s.key] ?? 50}
                    onChange={(e) => updateField(s.key, Number(e.target.value))}
                    className="w-full h-10 border-b border-black/15 bg-transparent text-sm text-right outline-none focus:border-[#e09225] transition-all"
                  />
                </div>
              ))}
            </div>
          </SettingGroup>

          {/* Goalkeeper Stats */}
          <SettingGroup title="Goalkeeper Stats">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {[
                { key: "goalkeeping_diving", label: "Diving" },
                { key: "goalkeeping_handling", label: "Handling" },
                { key: "goalkeeping_kicking", label: "Kicking" },
                { key: "goalkeeping_positioning", label: "Positioning" },
                { key: "goalkeeping_reflexes", label: "Reflexes" },
                { key: "goalkeeping_speed", label: "Speed" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <label className="text-xs text-black/50 w-28 shrink-0">{s.label}</label>
                  <input
                    type="number" min={0} max={99}
                    value={(form as any)[s.key] ?? 10}
                    onChange={(e) => updateField(s.key, Number(e.target.value))}
                    className="w-full h-10 border-b border-black/15 bg-transparent text-sm text-right outline-none focus:border-[#e09225] transition-all"
                  />
                </div>
              ))}
            </div>
          </SettingGroup>

          {/* Player Details */}
          <SettingGroup title="Player Details">
            <SettingRow label="Preferred Foot">
              <TCCSelect value={form.preferred_foot} onChange={(v) => updateField("preferred_foot", v)} options={FOOT_OPTIONS} />
            </SettingRow>
            <SettingRow label="Weak Foot (1-5)">
              <TCCInput type="number" min={1} max={5} value={form.weak_foot} onChange={(e) => updateField("weak_foot", Number(e.target.value))} />
            </SettingRow>
            <SettingRow label="Skill Moves (1-5)">
              <TCCInput type="number" min={1} max={5} value={form.skill_moves} onChange={(e) => updateField("skill_moves", Number(e.target.value))} />
            </SettingRow>
            <SettingRow label="Work Rate">
              <TCCSelect value={form.work_rate} onChange={(v) => updateField("work_rate", v)} options={WORK_RATE_OPTIONS} />
            </SettingRow>
          </SettingGroup>

          {/* Player Traits */}
          <SettingGroup title="Player Traits">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTrait())}
                placeholder="Add a trait..."
                className="flex-1 h-12 border-b-2 border-black/15 bg-transparent text-lg para outline-none placeholder:text-black/25 focus:border-[#e09225] transition-all"
              />
              <button onClick={addTrait} className="p-2 rounded-lg hover:bg-black/5 transition">
                <Plus size={20} className="text-black/40" />
              </button>
            </div>
            {form.player_traits.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.player_traits.map((trait) => (
                  <span key={trait} className="inline-flex items-center gap-1 px-3 py-1 bg-black/5 rounded-full text-sm text-black/70">
                    {trait}
                    <button onClick={() => removeTrait(trait)} className="hover:text-red-500 transition">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-black/30">No traits added yet</p>
            )}
          </SettingGroup>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-10 border-t border-black/10 px-6 py-6 lg:px-10">
          <TCCButton onClick={onClose}>Cancel</TCCButton>
          <TCCButton onClick={handleSubmit}>
            {loading ? "Saving..." : player ? "Update Player" : "Create Player"}
          </TCCButton>
        </footer>
      </div>
    </div>
  );
}
