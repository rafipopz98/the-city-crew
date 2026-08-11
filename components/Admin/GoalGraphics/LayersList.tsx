"use client";

import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Type,
  ImageIcon,
  Square,
} from "lucide-react";
import { AnyLayer } from "@/constants/goalGraphics";

type Props = {
  layers: AnyLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

const ICONS: Record<AnyLayer["type"], typeof Type> = {
  text: Type,
  image: ImageIcon,
  shape: Square,
};

export default function LayersList({
  layers,
  selectedId,
  onSelect,
  onToggleHidden,
  onMove,
  onDuplicate,
  onDelete,
}: Props) {
  // Front-most layer first in the list (matches visual stacking).
  const ordered = [...layers].map((l, i) => ({ layer: l, index: i })).reverse();

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {ordered.map(({ layer, index }) => {
        const Icon = ICONS[layer.type];
        const isSelected = layer.id === selectedId;

        return (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer text-sm transition ${
              isSelected
                ? "bg-[#06182e] text-[#FFF5E5]"
                : "text-[#06182e] hover:bg-[#06182e]/5"
            }`}
          >
            <Icon
              size={14}
              className={isSelected ? "text-[#e09225]" : "text-[#06182e]/40"}
            />
            <span className="flex-1 truncate">{layer.name}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHidden(layer.id);
              }}
              className={`shrink-0 ${isSelected ? "text-[#FFF5E5]/70" : "text-[#06182e]/40"} hover:opacity-70`}
              title={layer.hidden ? "Show" : "Hide"}
            >
              {layer.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(layer.id, "up");
                }}
                disabled={index === layers.length - 1}
                className={`${isSelected ? "text-[#FFF5E5]/70" : "text-[#06182e]/40"} hover:opacity-70 disabled:opacity-20`}
                title="Bring forward"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(layer.id, "down");
                }}
                disabled={index === 0}
                className={`${isSelected ? "text-[#FFF5E5]/70" : "text-[#06182e]/40"} hover:opacity-70 disabled:opacity-20`}
                title="Send backward"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(layer.id);
                }}
                className={`${isSelected ? "text-[#FFF5E5]/70" : "text-[#06182e]/40"} hover:opacity-70`}
                title="Duplicate"
              >
                <Copy size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(layer.id);
                }}
                className={`${isSelected ? "text-[#FFF5E5]/70" : "text-[#06182e]/40"} hover:text-red-500`}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}

      {layers.length === 0 && (
        <p className="text-center text-xs text-[#06182e]/40 py-6">
          No layers yet — add text, an image, or a shape.
        </p>
      )}
    </div>
  );
}
