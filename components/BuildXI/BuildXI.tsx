"use client";
import { useState, useEffect, useRef } from "react";
import DraggablePlayer from "./DraggablePlayer";
import { domToBlob } from "modern-screenshot";
import { toast } from "sonner";
import { Button } from "../common/Button";
import { playerImages } from "@/public/players-image";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import PitchSvg from "./PitchSvg";
import PitchSvgDesktop from "./PitchSvgDesktop";

const firstName = (fullName: string) => fullName.trim().split(" ")[0];

interface Player {
  id: number;
  name: string;
  image: string;
  club: string;
  x: number;
  y: number;
  slotIndex?: number;
  prefferedName?: string;
}

interface PlayerTemplate {
  value: string;
  name: string;
  image: string;
  club: string;
  prefferedName: string;
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
  prefferedName: p.prefferedName,
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
    <div className="w-8 h-8 sm:w-13 sm:h-13 rounded-full border-2 border-dashed border-[#e09225]/40 bg-[#e09225]/5 flex items-center justify-center group-hover:bg-[#e09225]/10 transition">
      <span className="text-[#e09225] text-sm sm:text-xl font-bold">+</span>
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

  const available = ALL_PLAYERS.filter(
    (p) => !excludeNames.includes(p?.prefferedName || p.name),
  );
  const list = query
    ? available.filter(
        (p) =>
          p.prefferedName.toLowerCase().includes(query.toLowerCase()) ||
          p.name.toLowerCase().includes(query.toLocaleLowerCase()),
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
                alt={p.prefferedName}
                className="w-10 h-10 rounded-full border border-[#e09225]/40 object-cover"
              />
              <p className="text-[#06182e] text-sm font-medium text-left">
                {p.prefferedName || firstName(p.name)}
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
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const pitch = document.getElementById("pitch");

    if (!pitch) {
      toast.error("Couldn't find the pitch.");
      return;
    }

    try {
      setIsDownloading(true);

      const blob = await domToBlob(pitch, {
        scale: Math.max(window.devicePixelRatio, 2),
      });

      const fileName = `${lineupName || "tcc-lineup"}.png`;

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      toast.success("Lineup downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate lineup image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const pitch = document.getElementById("pitch");

    if (!pitch) {
      toast.error("Couldn't find the pitch.");
      return;
    }

    if (!navigator.share) {
      toast.error("Sharing isn't supported on this device.");
      return;
    }

    try {
      setIsDownloading(true);

      const blob = await domToBlob(pitch, {
        scale: Math.max(window.devicePixelRatio, 2),
      });

      const file = new File([blob], `${lineupName || "tcc-lineup"}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        toast.error("This device can't share images.");
        return;
      }

      await navigator.share({
        title: "My Manchester City XI",
        files: [file],
      });
    } catch (err: any) {
      console.error(err);

      if (err?.name !== "AbortError") {
        toast.error("Failed to share lineup.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // ── On formation change: re-generate slot coords & reposition players ──
  // Players keep their slotIndex — we look up the new coord for that slot.
  useEffect(() => {
    const baseFormation = formation === "Free form" ? lastFormation : formation;
    const coords = generateCoords(baseFormation);
    setSlots(coords);

    if (formation !== "Free form") {
      setPlayersOnPitch((prev) => {
        // Collect which slotIndex values are already taken
        const takenSlots = new Set(
          prev.map((p) => p.slotIndex).filter((s) => s !== undefined),
        );
        // Build a queue of free slots in order
        const freeSlots = coords
          .map((_, i) => i)
          .filter((i) => !takenSlots.has(i));
        let nextFree = 0;

        return prev.map((p) => {
          // If the player has a slotIndex that exists in the new formation,
          // move them to the new coordinate for that slot.
          if (p.slotIndex !== undefined && coords[p.slotIndex]) {
            return {
              ...p,
              x: coords[p.slotIndex][0],
              y: coords[p.slotIndex][1],
            };
          }
          // Player has no slotIndex (added in Free form).
          // Auto-assign them to the nearest free slot.
          if (freeSlots[nextFree] !== undefined) {
            const slot = freeSlots[nextFree++];
            return {
              ...p,
              x: coords[slot][0],
              y: coords[slot][1],
              slotIndex: slot,
            };
          }
          // No slots left → keep their current position
          return p;
        });
      });
    }
  }, [formation, lastFormation]);

  const handleDropToSlot = (playerId: number, slotIndex: number) => {
    const coord = slots[slotIndex];
    if (!coord) return;

    setPlayersOnPitch((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, x: coord[0], y: coord[1], slotIndex } : p,
      ),
    );
  };

  const openModal = (slotIndex?: number) => {
    if (playersOnPitch.length >= 11) return;
    setSlotTarget(slotIndex ?? null);
    setModalOpen(true);
  };

  const handleSelect = (template: PlayerTemplate) => {
    const targetCoord =
      slotTarget !== null && slots[slotTarget] ? slots[slotTarget] : null;

    setPlayersOnPitch((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.prefferedName === template.prefferedName,
      );

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
      [
        template.prefferedName,
        ...prev.filter((n) => n !== template.prefferedName),
      ].slice(0, 8),
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
          <div
            className={
              isDesktop
                ? "w-full max-w-2xl"
                : "w-full max-w-2xl lg:max-w-none"
            }
          >
            <div
              id="pitch"
              className="relative w-full overflow-hidden border border-[#e09225]/20 bg-[#06182e]/5"
              style={
                isDesktop
                  ? { aspectRatio: "1/1" }
                  : {
                      aspectRatio: "3/4",
                      maxHeight: "105vh",
                      minHeight: "400px",
                    }
              }
            >
              {isDesktop ? <PitchSvgDesktop /> : <PitchSvg />}

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
              <div className="w-full mt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={handleDownload}
                  loading={isDownloading}
                  disabled={isDownloading}
                  className="px-6 py-3 bg-[#e09225] text-[#06182e] font-semibold rounded-xl"
                >
                  Download PNG
                </Button>

                <Button
                  onClick={handleShare}
                  disabled={isDownloading}
                  className="px-6 py-3 border border-[#e09225] text-[#e09225] bg-transparent rounded-xl"
                >
                  Share
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
          excludeNames={playersOnPitch.map((p) => p?.prefferedName)}
        />
      )}
    </section>
  );
};

export default BuildXI;
