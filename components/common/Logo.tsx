"use client";

import Image from "next/image";
import { forwardRef } from "react";

const Logo = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref}>
      <Image
        src="/logo-dark.png"
        alt="The City Crew"
        width={180}
        height={180}
        priority
      />
    </div>
  );
});

Logo.displayName = "Logo";

export default Logo;
