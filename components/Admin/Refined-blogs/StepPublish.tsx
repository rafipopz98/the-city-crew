"use client";

import { useState } from "react";
import { ImageOff, X } from "lucide-react";
import { Block } from "./blog-types";
import FormField from "./FormField";

type Status = "draft" | "published" | "hidden";

type Props = {
  tags: string[];
  setTags: (tags: string[]) => void;

  status: Status;
  setStatus: (status: Status) => void;

  featured: boolean;
  setFeatured: (value: boolean) => void;

  title: string;
  thumbnail: string;
  excerpt: string;
  blocks: Block[];
};

const STATUS_OPTIONS: { value: Status; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Only you can see this" },
  { value: "published", label: "Published", hint: "Live for everyone" },
  { value: "hidden", label: "Hidden", hint: "Saved, but not listed" },
];

export default function StepPublish({
  tags,
  setTags,
  status,
  setStatus,
  featured,
  setFeatured,
  title,
  thumbnail,
  excerpt,
  blocks,
}: Props) {
  const [tagInput, setTagInput] = useState("");
  const [imageBroken, setImageBroken] = useState(false);

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#06182e]">Final touches</h3>
        <p className="mt-1 text-sm text-[#06182e]/50">
          Add some tags, choose who can see it, then you&apos;re done.
        </p>
      </div>

      <FormField label="Tags" optional hint="Press Enter or comma to add a tag">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#06182e]/10 bg-white/60 px-3 py-2 focus-within:border-[#e09225] focus-within:ring-2 focus-within:ring-[#e09225]/25">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-[#e09225]/15 px-3 py-1 text-xs font-medium text-[#06182e]"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="text-[#06182e]/50 hover:text-[#06182e]"
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder={tags.length ? "" : "premier league, city..."}
            className="min-w-30 flex-1 bg-transparent py-1 text-[15px] text-[#06182e] placeholder:text-[#06182e]/35 outline-none"
          />
        </div>
      </FormField>

      <FormField label="Status">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`
                rounded-xl border px-4 py-3 text-left transition
                ${
                  status === option.value
                    ? "border-[#e09225] bg-[#e09225]/10"
                    : "border-[#06182e]/10 bg-white/50 hover:border-[#06182e]/25"
                }
              `}
            >
              <p className="text-sm font-medium text-[#06182e]">
                {option.label}
              </p>
              <p className="text-xs text-[#06182e]/45">{option.hint}</p>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Featured" hint="Pin this post to the top of the blog">
        <button
          type="button"
          onClick={() => setFeatured(!featured)}
          className={`h-8 w-14 rounded-full transition ${
            featured ? "bg-[#e09225]" : "bg-[#06182e]/10"
          }`}
          aria-pressed={featured}
        >
          <div
            className={`h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
              featured ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </FormField>

      <div className="rounded-2xl border border-[#06182e]/10 bg-white/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#06182e]/40">
          Review
        </p>
        <div className="flex gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#06182e]/10 bg-white/60">
            {thumbnail.trim() && !imageBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImageBroken(true)}
              />
            ) : (
              <ImageOff size={16} className="text-[#06182e]/25" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#06182e]">
              {title || "Untitled post"}
            </p>
            <p className="line-clamp-2 text-xs text-[#06182e]/50">
              {excerpt || "No excerpt added"}
            </p>
            <p className="mt-1 text-xs text-[#06182e]/40">
              {blocks.length} content {blocks.length === 1 ? "block" : "blocks"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
