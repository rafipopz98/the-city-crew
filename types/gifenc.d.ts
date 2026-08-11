declare module "gifenc" {
  export type Color =
    | [number, number, number]
    | [number, number, number, number];

  export interface QuantizeOptions {
    format?: "rgb565" | "rgb444" | "rgba4444";
    oneBitAlpha?: boolean | number;
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions,
  ): Color[];

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Color[],
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;

  export interface WriteFrameOptions {
    palette?: Color[];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }

  export interface GIFEncoderInstance {
    reset(): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    writeHeader(): void;
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: WriteFrameOptions,
    ): void;
  }

  export function GIFEncoder(opts?: {
    initialCapacity?: number;
    auto?: boolean;
  }): GIFEncoderInstance;
}
