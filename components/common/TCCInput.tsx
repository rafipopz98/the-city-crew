"use client";

import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

const TCCInput = ({ className = "", ...props }: Props) => {
  return (
    <input
      {...props}
      className={`w-full bg-transparent text-[17px] outline-none placeholder:text-black/25 ${className}`}
    />
  );
};

export default TCCInput;
