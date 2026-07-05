"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export default function FormField({
  label,
  hint,
  error,
  optional,
  children,
}: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-[#06182e]">{label}</label>
        {optional && (
          <span className="text-xs text-[#06182e]/40">Optional</span>
        )}
      </div>

      {children}

      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#06182e]/45">{hint}</p>
      ) : null}
    </div>
  );
}
