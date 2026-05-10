"use client";

import { useEffect, useRef } from "react";

export default function SmoothScrollWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let locomotiveScroll: any;

    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      if (scrollRef.current) {
        locomotiveScroll = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
        } as any);
      }
    })();

    return () => {
      locomotiveScroll?.destroy();
    };
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container>
      {children}
    </div>
  );
}
