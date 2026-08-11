"use client";

import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";

export type PickedPlayer = {
  _id: string;
  name: string;
  number?: number;
  position: string;
  vertical_image: string;
  round_image: string;
};

type Props = {
  onSelect: (player: PickedPlayer) => void;
  onClose: () => void;
};

export default function PlayerPickerModal({ onSelect, onClose }: Props) {
  const [players, setPlayers] = useState<PickedPlayer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/players?limit=200")
      .then((res) => res.json())
      .then((data) => setPlayers(data.players ?? []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query
    ? players.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : players;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-[#FFF5E5] shadow-2xl"
        style={{ maxHeight: "80vh" }}
      >
        <div className="flex items-center justify-between border-b border-[#06182e]/10 p-4">
          <h3 className="text-sm font-semibold text-[#06182e]">Select a player</h3>
          <button onClick={onClose} className="text-[#06182e]/50 hover:text-[#06182e]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 rounded-full bg-[#06182e]/5 px-4 py-2">
            <Search size={14} className="text-[#06182e]/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player..."
              className="flex-1 bg-transparent text-sm text-[#06182e] outline-none placeholder:text-[#06182e]/30"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
          {loading && (
            <p className="py-8 text-center text-sm text-[#06182e]/40">Loading players...</p>
          )}
          {!loading &&
            filtered.map((p) => (
              <button
                key={p._id}
                onClick={() => onSelect(p)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#06182e]/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.round_image}
                  alt={p.name}
                  className="h-10 w-10 rounded-full border border-[#e09225]/40 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#06182e]">{p.name}</p>
                  <p className="text-xs text-[#06182e]/40">
                    {p.position}
                    {p.number ? ` · #${p.number}` : ""}
                  </p>
                </div>
              </button>
            ))}
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-[#06182e]/40">No players found</p>
          )}
        </div>
      </div>
    </div>
  );
}
