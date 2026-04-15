"use client";
import { useState, useRef } from "react";

interface Player {
  id: number;
  name: string;
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
  onRemove: (id: number) => void;
}

const DraggablePlayer = ({
  player,
  updatePosition,
  onSwap,
  onRemove,
}: DraggablePlayerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("playerId", String(player.id));
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);

    const pitchEl = document.getElementById("pitch");
    if (!pitchEl) return;

    const rect = pitchEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.min(Math.max(x, 5), 95);
    const clampedY = Math.min(Math.max(y, 5), 95);

    // 👇 check if swap happened
    const wasSwapped = e.dataTransfer.getData("swapped") === "true";

    // 👇 check if position actually changed (small threshold)
    const moved =
      Math.abs(player.x - clampedX) > 2 || Math.abs(player.y - clampedY) > 2;

    updatePosition(player.id, clampedX, clampedY, {
      shouldFreeMove: !wasSwapped && moved,
    });

    // cleanup
    e.dataTransfer.clearData();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = Number(e.dataTransfer.getData("playerId"));

    if (draggedId !== player.id) {
      onSwap(draggedId, player.id);
    }

    // 👇 mark that this was a swap
    e.dataTransfer.setData("swapped", "true");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => setShowRemove((v) => !v)}
      style={{
        position: "absolute",
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 50 : 10,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? "none" : "opacity 0.15s",
      }}
      className="cursor-grab active:cursor-grabbing flex flex-col items-center group select-none transition-transform"
    >
      <div className="relative">
        <div className="w-13 h-13 rounded-full border-2 border-[#e09225]/40 overflow-hidden shadow-md bg-[#FFF5E5]">
          <img
            src={player.image}
            alt={player.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
        {showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(player.id);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#06182e] text-[#FFF5E5] text-xs flex items-center justify-center shadow font-bold leading-none hover:bg-red-500 transition"
          >
            ×
          </button>
        )}
      </div>

      <span className="mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FFF5E5]/90 text-[#06182e] border border-[#e09225]/30 backdrop-blur-sm whitespace-nowrap">
        {player.name}
      </span>
    </div>
  );
};

export default DraggablePlayer;
