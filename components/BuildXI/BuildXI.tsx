"use client";
import { useState, useEffect, useRef } from "react";
import DraggablePlayer from "./DraggablePlayer";
import * as htmlToImage from "html-to-image";
import { Button } from "../common/Button";
import { playerImages } from "@/public/players-image";

const firstName = (fullName: string) => fullName.trim().split(" ")[0];

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
  value: string;
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

// Local round images only — no proxying, no per-player network requests,
// and (important) same-origin images so the export canvas never gets tainted.
const ALL_PLAYERS: PlayerTemplate[] = playerImages.map((p) => ({
  value: p.value,
  name: p.name,
  club: "Manchester City",
  image: p.roundImage,
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

// ─── Empty slot ─────────────────────────────────────────────────────────────
// data-slot-index is what DraggablePlayer's pointer hit-test looks for
const EmptySlot = ({ x, y, index, onClick }: any) => (
  <div
    data-slot-index={index}
    onClick={onClick}
    style={{ left: `${x}%`, top: `${y}%` }}
    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer group"
  >
    <div className="w-13 h-13 rounded-full border-2 border-dashed border-[#e09225]/40 bg-[#e09225]/5 flex items-center justify-center group-hover:bg-[#e09225]/10 transition">
      <span className="text-[#e09225] text-xl font-bold">+</span>
    </div>
  </div>
);

// ─── Player modal ───────────────────────────────────────────────────────────
const PlayerModal = ({ onSelect, onClose, excludeNames }: any) => {
  const [query, setQuery] = useState("");
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const vv = window.visualViewport;
    const updateHeight = () => vv && setViewportHeight(vv.height);
    updateHeight();
    vv?.addEventListener("resize", updateHeight);
    vv?.addEventListener("scroll", updateHeight);
    return () => {
      document.body.style.overflow = prevOverflow;
      vv?.removeEventListener("resize", updateHeight);
      vv?.removeEventListener("scroll", updateHeight);
    };
  }, []);

  const available = ALL_PLAYERS.filter((p) => !excludeNames.includes(p.name));
  const list = query
    ? available.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      )
    : available;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={viewportHeight ? { height: viewportHeight } : undefined}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-[#FFF5E5] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: viewportHeight ? viewportHeight * 0.92 : "80vh" }}
      >
        <div className="p-4 border-b border-[#06182e]/10 shrink-0">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#06182e]/5">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player..."
              className="flex-1 bg-transparent text-[#06182e] text-sm outline-none placeholder:text-[#06182e]/30"
            />
            <button
              onClick={onClose}
              className="text-[#e09225] text-sm shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth"
          onWheel={(e) => e.stopPropagation()}
        >
          {list.map((p) => (
            <button
              key={p.value}
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#06182e]/5 transition"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-10 h-10 rounded-full border border-[#e09225]/40 object-cover"
              />
              <p className="text-[#06182e] text-sm font-medium text-left">
                {firstName(p.name)}
              </p>
            </button>
          ))}
          {list.length === 0 && (
            <p className="text-center text-sm text-[#06182e]/40 py-8">
              {excludeNames.length >= ALL_PLAYERS.length
                ? "All players added"
                : "No players found"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────
const BuildXI = () => {
  const [formation, setFormation] = useState("4-3-3");
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  const [playersOnPitch, setPlayersOnPitch] = useState<Player[]>([]);
  const [slots, setSlots] = useState<[number, number][]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<number | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [lineupName, setLineupName] = useState("");
  const [lastFormation, setLastFormation] = useState("4-3-3");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const pitch = document.getElementById("pitch");
    if (!pitch) return;

    try {
      setIsDownloading(true);

      const dataUrl = await htmlToImage.toPng(pitch, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const fileName = `${lineupName || "tcc-lineup"}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // On mobile, native share sheet is far more reliable than a
      // programmatic <a download> click (iOS Safari often just no-ops it).
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: fileName });
        return;
      }

      // Desktop fallback
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      alert("Couldn't generate the image, please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const coords = generateCoords(formation);
    setSlots(coords);
    if (formation !== "Free form") {
      setPlayersOnPitch((prev) =>
        prev.map((p, i) =>
          coords[i] ? { ...p, x: coords[i][0], y: coords[i][1] } : p,
        ),
      );
    }
  }, [formation]);

  const handleDropToSlot = (playerId: number, slotIndex: number) => {
    const coord = slots[slotIndex];
    if (!coord) return;

    setPlayersOnPitch((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, x: coord[0], y: coord[1], slotIndex } : p,
      ),
    );
  };

  useEffect(() => {
    const baseFormation = formation === "Free form" ? lastFormation : formation;
    setSlots(generateCoords(baseFormation));
  }, [formation, lastFormation]);

  const openModal = (slotIndex?: number) => {
    if (playersOnPitch.length >= 11) return;
    setSlotTarget(slotIndex ?? null);
    setModalOpen(true);
  };

  const handleSelect = (template: PlayerTemplate) => {
    const targetCoord =
      slotTarget !== null && slots[slotTarget] ? slots[slotTarget] : null;

    setPlayersOnPitch((prev) => {
      const existingIndex = prev.findIndex((p) => p.name === template.name);

      if (existingIndex !== -1) {
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
        return prev;
      }

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
      [a.slotIndex, b.slotIndex] = [b.slotIndex, a.slotIndex];
      return updated;
    });
  };

  const handleRemove = (id: number) =>
    setPlayersOnPitch((prev) => prev.filter((p) => p.id !== id));

  const clearLineup = () => {
    setPlayersOnPitch([]);
    setLineupName("");
  };

  return (
    <section className="w-full min-h-screen flex flex-col bg-[#FFF5E5] text-[#06182e]">
      {/* HEADER */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#e09225]/20 bg-[#FFF5E5]">
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

      <div className="flex px-4 py-6 gap-6">
        <div className="hidden lg:flex w-[40%] min-h-150 bg-[#06182e] text-[#FFF5E5] rounded-2xl p-8 flex-col justify-between">
          <div>
            <h1 className="text-6xl xl:text-7xl font-bold leading-[0.9] uppercase">
              Build
              <br />
              Your
              <br />
              <span className="text-[#e09225]">XI</span>
            </h1>
          </div>
          <div className="text-xs text-[#FFF5E5]/40">TCC Lineup Builder</div>
        </div>

        <div className="w-full lg:w-[60%] flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <div
              id="pitch"
              className="relative w-full rounded-2xl overflow-hidden border border-[#e09225]/20 bg-[#06182e]/5"
              style={{ aspectRatio: "1/1" }}
            >
              <img
                src="/pitch.jpg"
                alt="pitch"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {slots.map((coord, i) => {
                const isOccupied = playersOnPitch.some(
                  (p) => p.slotIndex === i,
                );
                if (isOccupied) return null;
                return (
                  <EmptySlot
                    key={`slot-${i}`}
                    x={coord[0]}
                    y={coord[1]}
                    index={i}
                    onClick={() => playersOnPitch.length < 11 && openModal(i)}
                  />
                );
              })}

              {playersOnPitch.map((p) => (
                <DraggablePlayer
                  key={p.id}
                  player={p}
                  updatePosition={updatePosition}
                  onSwap={handleSwap}
                  onDropToSlot={handleDropToSlot}
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

      {modalOpen && (
        <PlayerModal
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
          excludeNames={playersOnPitch.map((p) => p.name)}
        />
      )}
    </section>
  );
};

export default BuildXI;
