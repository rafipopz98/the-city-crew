"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { Block } from "./blog-types";

type Props = {
  blocks: Block[];
  onAdd: (type: "text" | "image") => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  error?: string;
};

const textareaClasses =
  "w-full rounded-xl border border-[#06182e]/10 bg-white/60 px-4 py-3 text-[15px] text-[#06182e] placeholder:text-[#06182e]/35 outline-none transition focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/25 resize-none";

export default function StepStory({
  blocks,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  error,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#06182e]">
          Now, tell the story
        </h3>
        <p className="mt-1 text-sm text-[#06182e]/50">
          Build your post piece by piece. Add a paragraph, drop in an image,
          repeat.
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#06182e]/15 bg-white/40 px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#06182e]/60">
            Nothing here yet
          </p>
          <p className="text-xs text-[#06182e]/40">
            Add your first paragraph or image to start telling the story.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#06182e]/10 bg-white/50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#06182e]/40">
                  {block.type === "text" ? (
                    <Type size={13} />
                  ) : (
                    <ImageIcon size={13} />
                  )}
                  {block.type === "text"
                    ? `Paragraph ${index + 1}`
                    : `Image ${index + 1}`}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="rounded-lg p-1.5 text-[#06182e]/40 transition hover:bg-[#06182e]/5 hover:text-[#06182e] disabled:opacity-25 disabled:hover:bg-transparent"
                    aria-label="Move up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, "down")}
                    disabled={index === blocks.length - 1}
                    className="rounded-lg p-1.5 text-[#06182e]/40 transition hover:bg-[#06182e]/5 hover:text-[#06182e] disabled:opacity-25 disabled:hover:bg-transparent"
                    aria-label="Move down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-lg p-1.5 text-[#06182e]/40 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove block"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {block.type === "text" ? (
                <textarea
                  value={block.value}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  placeholder="Write a paragraph..."
                  rows={4}
                  className={textareaClasses}
                />
              ) : (
                <input
                  value={block.value}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className={textareaClasses}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onAdd("text")}
          className="flex items-center gap-2 rounded-xl border border-[#06182e]/15 bg-white/60 px-4 py-2.5 text-sm font-medium text-[#06182e] transition hover:border-[#e09225] hover:bg-white"
        >
          <Plus size={15} />
          Add paragraph
        </button>
        <button
          type="button"
          onClick={() => onAdd("image")}
          className="flex items-center gap-2 rounded-xl border border-[#06182e]/15 bg-white/60 px-4 py-2.5 text-sm font-medium text-[#06182e] transition hover:border-[#e09225] hover:bg-white"
        >
          <Plus size={15} />
          Add image
        </button>
      </div>
    </div>
  );
}
