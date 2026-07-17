"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

type Props = Omit<ImageProps, "src" | "onError" | "onLoad"> & {
  src: string;
  fallbackName: string;
};

const ImageWithFallback = ({
  src,
  fallbackName,
  className,
  ...rest
}: Props) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fallbackName,
  )}&size=512&background=06182e&color=e09225&bold=true`;

  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-br from-[#06182e]/10 via-[#06182e]/5 to-[#06182e]/10" />
      )}
      <Image
        {...rest}
        src={currentSrc}
        className={`${className ?? ""} transition-all duration-500 ${
          loaded
            ? "scale-100 opacity-100 blur-0"
            : "scale-105 opacity-0 blur-sm"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!failed) {
            setFailed(true);
            setCurrentSrc(fallback);
          }
        }}
      />
    </>
  );
};

export default ImageWithFallback;
