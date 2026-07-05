"use client";

import { Check } from "lucide-react";

type Props = {
  steps: readonly string[];
  currentIndex: number;
};

export default function StepProgress({ steps, currentIndex }: Props) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`
                  flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold
                  transition-colors
                  ${
                    isDone
                      ? "bg-[#e09225] text-[#06182e]"
                      : isCurrent
                        ? "bg-[#06182e] text-[#ece1cf]"
                        : "bg-[#06182e]/10 text-[#06182e]/40"
                  }
                `}
              >
                {isDone ? <Check size={13} /> : index + 1}
              </div>
              <span
                className={`
                  hidden text-xs font-medium sm:block
                  ${isCurrent ? "text-[#06182e]" : "text-[#06182e]/40"}
                `}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`h-px w-4 sm:w-8 ${
                  isDone ? "bg-[#e09225]" : "bg-[#06182e]/15"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
