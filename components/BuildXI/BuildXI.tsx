"use client";
import { useState, useEffect, useRef } from "react";
import DraggablePlayer from "./DraggablePlayer";
import * as htmlToImage from "html-to-image";
import { Button } from "../common/Button";

const getProxyImage = (url: string) =>
  `/api/image-proxy?url=${encodeURIComponent(url)}`;

interface Player {
  id: number;
  name: string;
  image: string;
  club: string;
  x: number;
  y: number;
  slotIndex?: number;
}

interface PlayerTemplate {
  name: string;
  image: string;
  club: string;
}

const FORMATION_LIST = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "4-1-4-1",
  "4-3-2-1",
  "4-1-2-1-2",
  "3-4-3",
  "3-5-2",
  "3-2-4-1",
  "5-3-2",
  "5-4-1",
  "4-5-1",
  "4-4-1-1",
  "4-2-2-2",
  "4-2-4",
  "3-4-2-1",
  "3-4-1-2",
  "4-3-1-2",
  "5-2-3",
  "5-2-2-1",
  "4-2-1-3",
  "4-1-2-3",
  "3-1-4-2",
  "4-1-3-2",
  "4-1-2-2-1",
  "3-3-4",
  "3-3-3-1",
  "5-3-1-1",
  "3-3-2-2",
  "3-5-1-1",
  "2-3-2-3",
  "Free form",
];

const RAW_PLAYERS: PlayerTemplate[] = [
  {
    name: "James Trafford",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1187213.png",
  },
  {
    name: "Marcus Bettinelli",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/363357.png",
  },
  {
    name: "Gianluigi Donnarumma",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/618878.png",
  },

  {
    name: "Rúben Dias",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/614006.png",
  },
  {
    name: "John Stones",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/263653.png",
  },
  {
    name: "Nathan Aké",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/417068.png",
  },
  {
    name: "Marc Guéhi",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/844425.png",
  },
  {
    name: "Rayan Aït-Nouri",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/933845.png",
  },
  {
    name: "Josko Gvardiol",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1070712.png",
  },
  {
    name: "Matheus Nunes",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/955529.png",
  },
  {
    name: "Nico O'Reilly",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1300526.png",
  },
  {
    name: "Abdukodir Khusanov",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1362998.png",
  },
  {
    name: "Max Alleyne",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1414691.png",
  },
  {
    name: "Rico Lewis",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1288450.png",
  },

  {
    name: "Tijjani Reijnders",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/868344.png",
  },
  {
    name: "Mateo Kovacic",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/239219.png",
  },
  {
    name: "Rayan Cherki",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1104053.png",
  },
  {
    name: "Nico González",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1280132.png",
  },
  {
    name: "Rodri",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/675088.png",
  },
  {
    name: "Bernardo Silva",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/488139.png",
  },
  {
    name: "Sverre Halseth Nypan",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1355509.png",
  },
  {
    name: "Phil Foden",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/815006.png",
  },

  {
    name: "Ryan McAidoo",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1680328.png",
  },
  {
    name: "Omar Marmoush",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/839204.png",
  },
  {
    name: "Erling Haaland",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/737066.png",
  },
  {
    name: "Jérémy Doku",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/942368.png",
  },
  {
    name: "Savinho",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/1174337.png",
  },
  {
    name: "Antoine Semenyo",
    club: "Manchester City",
    image: "https://images.fotmob.com/image_resources/playerimages/933576.png",
  },
];

const ALL_PLAYERS: PlayerTemplate[] = RAW_PLAYERS.map((p) => ({
  ...p,
  image: getProxyImage(p.image),
}));

const generateCoords = (formation: string): [number, number][] => {
  if (formation === "Free form") return [];
  const parts = formation.split("-").map(Number);
  const coords: [number, number][] = [];
  coords.push([50, 88]); // GK
  const rowCount = parts.length;
  parts.forEach((count, i) => {
    const y = 72 - (i / (rowCount - 1)) * 60;
    for (let j = 0; j < count; j++) {
      coords.push([(100 / (count + 1)) * (j + 1), y]);
    }
  });
  return coords;
};

// ─── Empty slot ───────────────────────────────────────────────────────────────
const EmptySlot = ({ x, y, onClick, onDropPlayer }: any) => (
  <div
    onClick={onClick}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      e.stopPropagation();

      const draggedId = Number(e.dataTransfer.getData("playerId"));
      onDropPlayer(draggedId);
      if (!draggedId) return;
      // mark as handled (so no free flow)
      e.dataTransfer.setData("swapped", "true");
    }}
    style={{ left: `${x}%`, top: `${y}%` }}
    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer group"
  >
    <div className="w-13 h-13 rounded-full border-2 border-dashed border-[#e09225]/40 bg-[#e09225]/5 flex items-center justify-center group-hover:bg-[#e09225]/10 transition">
      <span className="text-[#e09225] text-xl font-bold">+</span>
    </div>
  </div>
);

// ─── Player modal ─────────────────────────────────────────────────────────────
const PlayerModal = ({ onSelect, onClose }: any) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const filtered = ALL_PLAYERS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-[#FFF5E5] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Search */}
        <div className="p-4 border-b border-[#06182e]/10">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#06182e]/5">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player..."
              className="flex-1 bg-transparent text-[#06182e] text-sm outline-none placeholder:text-[#06182e]/30"
            />
            <button onClick={onClose} className="text-[#e09225] text-sm">
              Cancel
            </button>
          </div>
        </div>

        {/* List */}
        <div
          className="overflow-y-auto max-h-[60vh] overscroll-contain scroll-smooth"
          onWheel={(e) => e.stopPropagation()}
        >
          {(query ? filtered : ALL_PLAYERS).map((p) => (
            <button
              key={p.name}
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#06182e]/5 transition"
            >
              <img
                src={p.image}
                className="w-10 h-10 rounded-full border border-[#e09225]/40"
              />
              <div className="text-left">
                <p className="text-[#06182e] text-sm font-medium">{p.name}</p>
                <p className="text-xs text-[#06182e]/40">{p.club}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const BuildXI = () => {
  const [formation, setFormation] = useState("4-3-3");
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  const [playersOnPitch, setPlayersOnPitch] = useState<Player[]>([]);
  const [slots, setSlots] = useState<[number, number][]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<number | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [lineupName, setLineupName] = useState("");
  const [isFreeMove, setIsFreeMove] = useState(false);
  const [lastFormation, setLastFormation] = useState("4-3-3");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const pitch = document.getElementById("pitch");
    if (!pitch) return;

    try {
      setIsDownloading(true);

      // optional small delay so loading UI shows
      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await htmlToImage.toPng(pitch, {
        cacheBust: true,
        pixelRatio: 2, // 🔥 higher quality (2x resolution)
      });

      const link = document.createElement("a");
      link.download = `${lineupName || "tcc-lineup"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const coords = generateCoords(formation);
    setSlots(coords);
    if (formation !== "Free form") {
      setPlayersOnPitch((prev) => {
        return prev.map((p, i) => {
          // only reposition if slot exists AND player was originally aligned
          if (coords[i]) {
            return {
              ...p,
              x: coords[i][0],
              y: coords[i][1],
            };
          }

          // otherwise keep current position
          return p;
        });
      });
    }
  }, [formation]);

  const handleDropToSlot = (playerId: number, slotIndex: number) => {
    const coord = slots[slotIndex];
    if (!coord) return;

    setPlayersOnPitch((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              x: coord[0],
              y: coord[1],
              slotIndex,
            }
          : p,
      ),
    );
  };

  useEffect(() => {
    const baseFormation = formation === "Free form" ? lastFormation : formation;

    const coords = generateCoords(baseFormation);
    setSlots(coords);
  }, [formation, lastFormation]);

  const openModal = (slotIndex?: number) => {
    if (playersOnPitch.length >= 11) return;

    setSlotTarget(slotIndex ?? null);
    setModalOpen(true);
  };

  // KEY LOGIC: if player already on pitch → move them to target slot
  const handleSelect = (template: PlayerTemplate) => {
    const targetCoord =
      slotTarget !== null && slots[slotTarget] ? slots[slotTarget] : null;

    setPlayersOnPitch((prev) => {
      const existingIndex = prev.findIndex((p) => p.name === template.name);

      if (existingIndex !== -1) {
        // Player already placed — move to new slot coordinates
        if (targetCoord) {
          return prev.map((p, i) =>
            i === existingIndex
              ? {
                  ...p,
                  x: targetCoord[0],
                  y: targetCoord[1],
                  slotIndex: slotTarget ?? undefined,
                }
              : p,
          );
        }
        return prev; // free form + already exists → no-op
      }

      // New player
      const newPlayer: Player = {
        ...template,
        id: Date.now(),
        x: targetCoord ? targetCoord[0] : 20 + Math.random() * 60,
        y: targetCoord ? targetCoord[1] : 20 + Math.random() * 60,
        slotIndex: slotTarget ?? undefined,
      };
      return [...prev, newPlayer];
    });

    setRecent((prev) =>
      [template.name, ...prev.filter((n) => n !== template.name)].slice(0, 8),
    );
    setModalOpen(false);
    setSlotTarget(null);
  };

  const updatePosition = (
    id: number,
    x: number,
    y: number,
    options?: { shouldFreeMove?: boolean },
  ) => {
    setPlayersOnPitch((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y } : p)),
    );

    if (options?.shouldFreeMove) {
      setIsFreeMove(true);
      setFormation((prev) => (prev === "Free form" ? prev : "Free form"));
    }
  };
  const handleSwap = (aId: number, bId: number) => {
    setPlayersOnPitch((prev) => {
      const updated = prev.map((p) => ({ ...p }));
      const a = updated.find((p) => p.id === aId);
      const b = updated.find((p) => p.id === bId);
      if (!a || !b) return prev;
      [a.x, b.x] = [b.x, a.x];
      [a.y, b.y] = [b.y, a.y];
      return updated;
    });
  };

  const handleRemove = (id: number) =>
    setPlayersOnPitch((prev) => prev.filter((p) => p.id !== id));

  const clearLineup = () => {
    setPlayersOnPitch([]);
    setLineupName("");
  };

  useEffect(() => {
    if (formation === "Free form") return;

    const coords = generateCoords(formation);
    setSlots(coords);

    setPlayersOnPitch((prev) =>
      prev.map((p) => {
        if (p.slotIndex !== undefined && coords[p.slotIndex]) {
          return {
            ...p,
            x: coords[p.slotIndex][0],
            y: coords[p.slotIndex][1],
          };
        }
        return p;
      }),
    );
  }, [formation]);

  return (
    <section className="w-full min-h-screen flex flex-col bg-[#FFF5E5] text-[#06182e]">
      {/* HEADER */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#e09225]/20 bg-[#FFF5E5]">
        {/* Formation pill */}
        <div className="relative">
          <button
            onClick={() => setShowFormationMenu((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[#06182e] text-sm font-semibold border border-[#e09225]/30 bg-[#FFF5E5] hover:bg-[#e09225]/10 transition"
          >
            {formation}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {showFormationMenu && (
            <div
              className="absolute top-full mt-2 left-0 w-44 max-h-65 overflow-y-auto overscroll-contain scroll-smooth rounded-xl shadow-2xl z-50 border border-[#e09225]/25 bg-[#FFF5E5]"
              onWheel={(e) => e.stopPropagation()}
            >
              {FORMATION_LIST.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    if (f === "Free form") {
                      setFormation("Free form");
                    } else {
                      setFormation(f);
                      setLastFormation(f);
                    }

                    setShowFormationMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    f === formation
                      ? "text-[#e09225] font-semibold"
                      : "text-[#06182e]/60 hover:bg-[#06182e]/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={clearLineup}
          className="text-sm font-semibold text-[#e09225] hover:opacity-70 transition"
        >
          Clear lineup
        </button>
      </div>

      {/* SCROLLABLE AREA */}
      <div className="flex px-4 py-6 gap-6">
        {/* LEFT SIDE (40%) */}
        <div className="hidden lg:flex w-[40%] min-h-150 bg-[#06182e] text-[#FFF5E5] rounded-2xl p-8 flex-col justify-between">
          {/* TOP */}
          <div>
            <h1 className="text-6xl xl:text-7xl font-bold leading-[0.9] uppercase">
              Build
              <br />
              Your
              <br />
              <span className="text-[#e09225]">XI</span>
            </h1>
          </div>

          {/* BOTTOM (optional extra UI later) */}
          <div className="text-xs text-[#FFF5E5]/40">TCC Lineup Builder</div>
        </div>

        {/* RIGHT SIDE (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <div
              id="pitch"
              className="relative w-full rounded-2xl overflow-hidden border border-[#e09225]/20 bg-[#06182e]/5"
              style={{ aspectRatio: "1/1" }}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Your custom navy/gold pitch */}
              <img
                src="/pitch.jpg"
                alt="pitch"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {slots.length > 0 &&
                slots.length > 0 &&
                slots.map((coord, i) => {
                  const isOccupied = playersOnPitch.some(
                    (p) => p.slotIndex === i,
                  );

                  if (isOccupied) return null;

                  return (
                    <EmptySlot
                      key={`slot-${i}`}
                      x={coord[0]}
                      y={coord[1]}
                      onClick={() => playersOnPitch.length < 11 && openModal(i)}
                      onDropPlayer={(playerId: number) =>
                        handleDropToSlot(playerId, i)
                      }
                    />
                  );
                })}

              {/* Placed players */}
              {playersOnPitch.map((p) => (
                <DraggablePlayer
                  key={p.id}
                  player={p}
                  updatePosition={updatePosition}
                  onSwap={handleSwap}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            {playersOnPitch.length === 11 && (
              <div className="w-full flex justify-center">
                <Button
                  onClick={handleDownload}
                  className="mt-4 px-6 py-3 cursor-pointer rounded-xl bg-[#e09225] text-[#06182e] font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                  loading={isDownloading}
                  disabled={isDownloading}
                >
                  Download Lineup Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <PlayerModal
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
          recent={recent}
        />
      )}
    </section>
  );
};

export default BuildXI;

const PlayerRow = ({
  p,
  onSelect,
}: {
  p: PlayerTemplate;
  onSelect: (p: PlayerTemplate) => void;
}) => (
  <button
    onClick={() => onSelect(p)}
    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
  >
    <img
      src={p.image}
      alt={p.name}
      className="w-10 h-10 rounded-full object-cover"
      style={{ border: "1.5px solid rgba(201,168,76,0.4)" }}
    />
    <div>
      <p className="text-white text-sm font-medium">{p.name}</p>
      <p className="text-xs" style={{ color: "rgba(201,168,76,0.5)" }}>
        {p.club}
      </p>
    </div>
  </button>
);
