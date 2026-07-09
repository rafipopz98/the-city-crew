"use client";

import { Star } from "lucide-react";

type Props = {
  rating: number;
  onRatingSelect: (rating: number) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  /** Background this component sits on — controls the empty-star color so it stays visible */
  surface?: "dark" | "light";
};

export default function RatingStars({
  rating,
  onRatingSelect,
  disabled = false,
  size = "medium",
  surface = "light",
}: Props) {
  const sizePx = { small: 24, medium: 32, large: 40 }[size];

  // On a dark bg (mobile), empty stars need to be light.
  // On a light bg (desktop), empty stars need to be dark.
  const emptyColor = surface === "dark" ? "text-white/50" : "text-black/30";

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onRatingSelect(star)}
          disabled={disabled}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className={`
            transition-all duration-300
            ${disabled ? "cursor-default" : "cursor-pointer hover:scale-110"}
            ${rating >= star ? "text-[#e09225]" : emptyColor}
          `}
        >
          <Star
            size={sizePx}
            fill={rating >= star ? "#e09225" : "none"}
            strokeWidth={rating >= star ? 1.5 : 2}
          />
        </button>
      ))}
    </div>
  );
}
