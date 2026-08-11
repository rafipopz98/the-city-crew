"use client";

import { Rnd } from "react-rnd";
import { AnyLayer } from "@/constants/goalGraphics";
import { FONTS } from "./fonts";

type Props = {
  layer: AnyLayer;
  canvasWidth: number;
  canvasHeight: number;
  selected: boolean;
  interactive: boolean; // false while exporting — render as plain content, no handles
  reveal?: boolean; // true while capturing a GIF — plays a staggered fade-in
  staggerIndex?: number;
  onSelect: () => void;
  onChange: (patch: Partial<AnyLayer>) => void;
};

const ALIGN_TO_FLEX: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

function LayerContent({
  layer,
  canvasWidth,
}: {
  layer: AnyLayer;
  canvasWidth: number;
}) {
  if (layer.type === "image") {
    return (
      <div className="w-full h-full overflow-hidden">
        {layer.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={layer.src}
            alt=""
            draggable={false}
            className="w-full h-full select-none"
            style={{
              objectFit: layer.fit,
              filter:
                [layer.grayscale && "grayscale(1)", layer.invert && "invert(1)"]
                  .filter(Boolean)
                  .join(" ") || undefined,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/30 text-white/60 text-[11px] text-center px-2 leading-snug">
            No image — pick a photo in Properties
          </div>
        )}
      </div>
    );
  }

  if (layer.type === "shape") {
    return (
      <div
        className="w-full h-full"
        style={{
          background: layer.color,
          borderRadius: `${layer.radius}%`,
        }}
      />
    );
  }

  const font = FONTS[layer.fontKey] ?? FONTS.oswald;
  const fontSizePx = (layer.fontSize / 100) * canvasWidth;

  return (
    <div
      className="w-full h-full flex select-none"
      style={{
        alignItems: "center",
        justifyContent: ALIGN_TO_FLEX[layer.align],
        fontFamily: font.fontFamily,
        fontSize: fontSizePx,
        color: layer.color,
        fontWeight: layer.fontWeight,
        letterSpacing: layer.letterSpacing,
        textTransform: layer.uppercase ? "uppercase" : "none",
        textAlign: layer.align,
        lineHeight: 1.05,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {layer.text}
    </div>
  );
}

export default function LayerNode({
  layer,
  canvasWidth,
  canvasHeight,
  selected,
  interactive,
  reveal,
  staggerIndex = 0,
  onSelect,
  onChange,
}: Props) {
  const pxX = (layer.x / 100) * canvasWidth;
  const pxY = (layer.y / 100) * canvasHeight;
  const pxW = (layer.width / 100) * canvasWidth;
  const pxH = (layer.height / 100) * canvasHeight;

  if (interactive && selected) {
    return (
      <Rnd
        size={{ width: pxW, height: pxH }}
        position={{ x: pxX, y: pxY }}
        style={{ opacity: layer.opacity }}
        onDragStop={(_e, d) => {
          onChange({
            x: (d.x / canvasWidth) * 100,
            y: (d.y / canvasHeight) * 100,
          });
        }}
        onResizeStop={(_e, _dir, ref, _delta, pos) => {
          onChange({
            width: (ref.offsetWidth / canvasWidth) * 100,
            height: (ref.offsetHeight / canvasHeight) * 100,
            x: (pos.x / canvasWidth) * 100,
            y: (pos.y / canvasHeight) * 100,
          });
        }}
        onMouseDown={(e: MouseEvent) => e.stopPropagation()}
      >
        <div
          className="w-full h-full outline outline-2 outline-[#e09225] outline-offset-2"
          style={{
            transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
          }}
        >
          <LayerContent layer={layer} canvasWidth={canvasWidth} />
        </div>
      </Rnd>
    );
  }

  const revealStyle: React.CSSProperties = reveal
    ? ({
        "--gg-op": layer.opacity,
        opacity: 0,
        animation: `gg-reveal-in 550ms cubic-bezier(0.16,1,0.3,1) ${staggerIndex * 90}ms both`,
      } as React.CSSProperties)
    : { opacity: layer.opacity };

  return (
    <div
      onMouseDown={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onSelect();
      }}
      className={interactive ? "absolute cursor-pointer" : "absolute"}
      style={{
        left: pxX,
        top: pxY,
        width: pxW,
        height: pxH,
        transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
        ...revealStyle,
      }}
    >
      <LayerContent layer={layer} canvasWidth={canvasWidth} />
    </div>
  );
}
