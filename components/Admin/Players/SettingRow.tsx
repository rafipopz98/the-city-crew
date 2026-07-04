"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

const SettingRow = ({ label, children }: Props) => {
  return (
    <div
      className="
        flex
        flex-col
        gap-4

        border-b
        border-black/10

        pb-6

        md:flex-row
        md:items-center
      "
    >
      {/* Label */}

      <div
        className="
          w-full
          shrink-0

          md:w-56
        "
      >
        <p
          className="
            text-sm

            text-black/60
          "
        >
          {label}
        </p>
      </div>

      {/* Input */}

      <div className="flex-1">{children}</div>
    </div>
  );
};

export default SettingRow;
