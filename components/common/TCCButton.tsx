"use client";

import { ArrowUpRight } from "lucide-react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

const TCCButton = ({ children, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="
        group

        inline-flex
        items-center
        gap-3

        border-b-2
        border-black

        pb-2

        para
        uppercase
        text-lg

        transition-all
        duration-300

        hover:border-[#e09225]
        hover:text-[#e09225]
      "
    >
      <span>{children}</span>

      <ArrowUpRight
        size={18}
        className="
          transition-all
          duration-300

          group-hover:translate-x-1
          group-hover:-translate-y-1
        "
      />
    </button>
  );
};

export default TCCButton;
