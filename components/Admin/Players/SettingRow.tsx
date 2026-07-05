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
    gap-3

    border-b
    border-black/10

    pb-4

    md:flex-row
    md:items-center
  "
    >
      <div
        className="
      w-full
      shrink-0

      md:w-52
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

      <div className="flex-1">{children}</div>
    </div>
  );
};

export default SettingRow;
