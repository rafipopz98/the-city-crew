"use client";
import { useRef, useState } from "react";

interface Player {
  id: number;
  name: string;
  prefferedName?: string;
  image: string;
  x: number;
  y: number;
  club?: string;
}

interface DraggablePlayerProps {
  player: Player;
  updatePosition: (
    id: number,
    x: number,
    y: number,
    options?: { shouldFreeMove?: boolean },
  ) => void;
  onSwap: (aId: number, bId: number) => void;
  onDropToSlot: (playerId: number, slotIndex: number) => void;
  onRemove: (id: number) => void;
}

const firstName = (fullName: string) => fullName.trim().split(" ")[0];

const DraggablePlayer = ({
  player,
  updatePosition,
  onSwap,
  onDropToSlot,
  onRemove,
}: DraggablePlayerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const activePointerId = useRef<number | null>(null);
  const hasMoved = useRef(false);

  const toPercent = (clientX: number, clientY: number) => {
    const rect = document.getElementById("pitch")?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(Math.max(x, 5), 95),
      y: Math.min(Math.max(y, 5), 95),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Don't initiate dragging when interacting with the remove button
    if (target.closest("[data-remove-player]")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    hasMoved.current = false;
    setIsDragging(true);
    setDragPos({ x: player.x, y: player.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return;
    const pos = toPercent(e.clientX, e.clientY);
    if (!pos) return;
    hasMoved.current = true;
    setDragPos(pos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    setIsDragging(false);

    // Tap, not drag -> toggle the remove (x) button
    if (!hasMoved.current) {
      setDragPos(null);
      setShowRemove((v) => !v);
      return;
    }

    // Key fix: this element is currently rendered directly under the
    // pointer (it's been following the drag), so a naive elementFromPoint
    // would just return itself. Temporarily make it invisible to hit
    // testing so we can see the slot/player actually underneath it.
    const wrapperEl = e.currentTarget as HTMLElement;
    wrapperEl.style.pointerEvents = "none";
    const el = document.elementFromPoint(
      e.clientX,
      e.clientY,
    ) as HTMLElement | null;
    wrapperEl.style.pointerEvents = "";

    const playerEl = el?.closest("[data-player-id]") as HTMLElement | null;
    const slotEl = el?.closest("[data-slot-index]") as HTMLElement | null;

    if (playerEl && Number(playerEl.dataset.playerId) !== player.id) {
      onSwap(player.id, Number(playerEl.dataset.playerId));
      setDragPos(null);
      return;
    }

    if (slotEl) {
      onDropToSlot(player.id, Number(slotEl.dataset.slotIndex));
      setDragPos(null);
      return;
    }

    const pos = toPercent(e.clientX, e.clientY);
    if (pos) {
      updatePosition(player.id, pos.x, pos.y, { shouldFreeMove: true });
    }
    setDragPos(null);
  };

  const x = dragPos ? dragPos.x : player.x;
  const y = dragPos ? dragPos.y : player.y;

  return (
    <div
      data-player-id={player.id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 50 : 10,
        opacity: isDragging ? 0.7 : 1,
        touchAction: "none",
        width: 52,
        height: 52,
        transition: isDragging
          ? "none"
          : "left 0.15s ease, top 0.15s ease, opacity 0.15s",
      }}
      className="cursor-grab active:cursor-grabbing flex flex-col items-center group select-none"
    >
      <div className="relative">
        <div className="w-7 h-7 sm:w-13 sm:h-13 rounded-full border-2 border-[#e09225]/40 overflow-hidden shadow-md bg-[#FFF5E5] pointer-events-none">
          <img
            src={player.image}
            alt={player.prefferedName || player.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
        {showRemove && (
          <button
            type="button"
            data-remove-player
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(player.id);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#06182e] text-[#FFF5E5] text-xs flex items-center justify-center shadow font-bold leading-none hover:bg-red-500 transition z-10"
          >
            ×
          </button>
        )}
      </div>

      <span className="mt-1 uppercase text-[6px] sm:text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FFF5E5]/90 text-[#06182e] border border-[#e09225]/30 backdrop-blur-sm whitespace-nowrap pointer-events-none">
        {player.prefferedName || firstName(player.name)}
      </span>
    </div>
  );
};

export default DraggablePlayer;
