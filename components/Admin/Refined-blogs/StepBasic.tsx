"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import FormField from "./FormField";

type Props = {
  title: string;
  setTitle: (value: string) => void;

  thumbnail: string;
  setThumbnail: (value: string) => void;

  excerpt: string;
  setExcerpt: (value: string) => void;

  errors: { title?: string; thumbnail?: string };
};

const inputClasses =
  "w-full rounded-xl border border-[#06182e]/10 bg-white/60 px-4 py-3 text-[15px] text-[#06182e] placeholder:text-[#06182e]/35 outline-none transition focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/25";

const EXCERPT_LIMIT = 160;

export default function StepBasics({
  title,
  setTitle,
  thumbnail,
  setThumbnail,
  excerpt,
  setExcerpt,
  errors,
}: Props) {
  const [imageBroken, setImageBroken] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#06182e]">
          Let&apos;s start with the basics
        </h3>
        <p className="mt-1 text-sm text-[#06182e]/50">
          This is what readers will see first — make the title count.
        </p>
      </div>

      <FormField label="Title" error={errors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="How Manchester City dominated the derby..."
          className={inputClasses}
          autoFocus
        />
      </FormField>

      <FormField
        label="Thumbnail image"
        error={imageBroken ? "Could not load this image" : undefined}
        hint="Paste a direct image link. This shows up on the blog list and social shares."
      >
        <input
          value={thumbnail}
          onChange={(e) => {
            setThumbnail(e.target.value);
            setImageBroken(false);
          }}
          placeholder="https://example.com/image.jpg"
          className={inputClasses}
        />

        {thumbnail.trim() && (
          <div className="mt-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#06182e]/15 bg-white/40">
            {imageBroken ? (
              <div className="flex flex-col items-center gap-1 text-[#06182e]/35">
                <ImageOff size={20} />
                <span className="text-xs">Couldn&apos;t load this image</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt="Thumbnail preview"
                className="h-full w-full object-cover"
                onError={() => setImageBroken(true)}
              />
            )}
          </div>
        )}
      </FormField>

      <FormField
        label="Excerpt"
        optional
        hint={`Short summary shown in previews. ${excerpt.length}/${EXCERPT_LIMIT} characters`}
      >
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value.slice(0, EXCERPT_LIMIT))}
          placeholder="A quick, punchy summary of what this post is about..."
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </FormField>
    </div>
  );
}
