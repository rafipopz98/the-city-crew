"use client";

import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

const TCCSelect = ({ value, onChange, options }: Props) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full

          appearance-none

          bg-transparent

          text-lg

          outline-none
        "
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={18}
        className="
          pointer-events-none

          absolute
          right-0
          top-1/2

          -translate-y-1/2

          text-black/40
        "
      />
    </div>
  );
};

export default TCCSelect;
