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
import { FORMATION_LIST, generateCoords } from "@/constants/formation";

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

// ─────────────────────────────────────────────────────────────────────────────
// PLAYERS
// ─────────────────────────────────────────────────────────────────────────────

const ALL_PLAYERS: PlayerTemplate[] = playerImages.map((p) => ({
  value: p.value,
  name: p.name,
  club: "Manchester City",
  image: p.roundImage,
  prefferedName: p.prefferedName,
}));

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY SLOT
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER MODAL
// ─────────────────────────────────────────────────────────────────────────────

const PlayerModal = ({ onSelect, onClose, excludeNames }: any) => {
  const [query, setQuery] = useState("");
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const vv = window.visualViewport;

    const updateHeight = () => {
      if (vv) {
        setViewportHeight(vv.height);
      }
    };

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
        style={{
          maxHeight: viewportHeight ? viewportHeight * 0.92 : "80vh",
        }}
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

// ─────────────────────────────────────────────────────────────────────────────
// IOS SAVE PREVIEW
// ─────────────────────────────────────────────────────────────────────────────

const IOSSavePreview = ({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#06182e] text-[#FFF5E5] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#FFF5E5]/10 shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF5E5]/10 hover:bg-[#FFF5E5]/20 transition"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="text-sm font-semibold">Save your lineup</span>

        <div className="w-10" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center px-5 py-6">
        <div className="text-center mb-5">
          <p className="text-[#e09225] font-semibold text-lg">Save to Photos</p>

          <p className="text-[#FFF5E5]/60 text-sm mt-1">
            Press and hold the image, then choose
            <span className="text-[#FFF5E5] font-medium"> Save to Photos</span>.
          </p>
        </div>

        <div className="w-full max-w-xl flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Manchester City lineup"
            className="block max-w-full max-h-[70vh] w-auto h-auto rounded-xl select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="px-5 pb-6 pt-4 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-[#e09225] text-[#06182e] font-semibold"
        >
          Back to lineup
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

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
  const [isSharing, setIsSharing] = useState(false);

  // New: iOS preview image
  const [iosPreviewUrl, setIosPreviewUrl] = useState<string | null>(null);

  const isIOS = () => {
    if (typeof window === "undefined") return false;

    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // DOWNLOAD
  // ───────────────────────────────────────────────────────────────────────────

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

      // ─────────────────────────────────────────────────────────────────────
      // IOS
      // ─────────────────────────────────────────────────────────────────────

      if (isIOS()) {
        const url = URL.createObjectURL(blob);

        setIosPreviewUrl(url);

        toast.success("Press and hold the image to save it to Photos.");

        return;
      }

      // ─────────────────────────────────────────────────────────────────────
      // ANDROID / DESKTOP
      // ─────────────────────────────────────────────────────────────────────

      const fileName = `${lineupName || "tcc-lineup"}.png`;

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);

      a.click();

      a.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      toast.success("Lineup downloaded!");
    } catch (err) {
      console.error(err);

      toast.error("Failed to generate lineup image.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SHARE
  // ───────────────────────────────────────────────────────────────────────────

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
      setIsSharing(true);

      const blob = await domToBlob(pitch, {
        scale: Math.max(window.devicePixelRatio, 2),
      });

      const file = new File([blob], `${lineupName || "tcc-lineup"}.png`, {
        type: "image/png",
      });

      if (
        navigator.canShare &&
        !navigator.canShare({
          files: [file],
        })
      ) {
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
      setIsSharing(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // FORMATION
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const baseFormation = formation === "Free form" ? lastFormation : formation;

    const coords = generateCoords(baseFormation);

    setSlots(coords);

    if (formation !== "Free form") {
      setPlayersOnPitch((prev) => {
        const takenSlots = new Set(
          prev.map((p) => p.slotIndex).filter((s) => s !== undefined),
        );

        const freeSlots = coords
          .map((_, i) => i)
          .filter((i) => !takenSlots.has(i));

        let nextFree = 0;

        return prev.map((p) => {
          if (p.slotIndex !== undefined && coords[p.slotIndex]) {
            return {
              ...p,
              x: coords[p.slotIndex][0],
              y: coords[p.slotIndex][1],
            };
          }

          if (freeSlots[nextFree] !== undefined) {
            const slot = freeSlots[nextFree++];

            return {
              ...p,
              x: coords[slot][0],
              y: coords[slot][1],
              slotIndex: slot,
            };
          }

          return p;
        });
      });
    }
  }, [formation, lastFormation]);

  // ───────────────────────────────────────────────────────────────────────────
  // PLAYER ACTIONS
  // ───────────────────────────────────────────────────────────────────────────

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
    options?: {
      shouldFreeMove?: boolean;
    },
  ) => {
    setPlayersOnPitch((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              x,
              y,
            }
          : p,
      ),
    );

    if (options?.shouldFreeMove) {
      setFormation((prev) => (prev === "Free form" ? prev : "Free form"));
    }
  };

  const handleSwap = (aId: number, bId: number) => {
    setPlayersOnPitch((prev) => {
      const updated = prev.map((p) => ({
        ...p,
      }));

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

  // ───────────────────────────────────────────────────────────────────────────
  // CLOSE IOS PREVIEW
  // ───────────────────────────────────────────────────────────────────────────

  const closeIOSPreview = () => {
    if (iosPreviewUrl) {
      URL.revokeObjectURL(iosPreviewUrl);
    }

    setIosPreviewUrl(null);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────────────────────

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

      {/* MAIN */}

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
              isDesktop ? "w-full max-w-2xl" : "w-full max-w-2xl lg:max-w-none"
            }
          >
            {/* PITCH */}

            <div
              id="pitch"
              className="relative w-full overflow-hidden border border-[#e09225]/20 bg-[#06182e]/5"
              style={
                isDesktop
                  ? {
                      aspectRatio: "1/1",
                    }
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

            {/* ACTION BUTTONS */}

            {playersOnPitch.length === 11 && (
              <div className="w-full mt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={handleDownload}
                  loading={isDownloading}
                  disabled={isDownloading || isSharing}
                  className="px-6 py-3 bg-[#e09225] text-[#06182e] font-semibold rounded-xl"
                >
                  {isIOS() ? "Save to Photos" : "Download PNG"}
                </Button>

                <Button
                  onClick={handleShare}
                  loading={isSharing}
                  disabled={isDownloading || isSharing}
                  className="px-6 py-3 border border-[#e09225] text-[#e09225] bg-transparent rounded-xl"
                >
                  Share
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLAYER MODAL */}

      {modalOpen && (
        <PlayerModal
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
          excludeNames={playersOnPitch.map((p) => p?.prefferedName)}
        />
      )}

      {/* IOS SAVE PREVIEW */}

      {iosPreviewUrl && (
        <IOSSavePreview imageUrl={iosPreviewUrl} onClose={closeIOSPreview} />
      )}
    </section>
  );
};

export default BuildXI;
