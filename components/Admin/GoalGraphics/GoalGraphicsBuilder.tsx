"use client";

import { useEffect, useRef, useState } from "react";
import { domToBlob } from "modern-screenshot";
import { GIFEncoder, quantize, applyPalette, type Color } from "gifenc";
import { toast } from "sonner";
import {
  Type,
  ImageIcon,
  Square,
  UserSquare2,
  Download,
  Grid3x3,
  RotateCcw,
  Undo2,
  Redo2,
  Film,
} from "lucide-react";
import {
  AnyLayer,
  buildDefaultLayers,
  CANVAS_W,
  CANVAS_H,
  uid,
} from "@/constants/goalGraphics";
import LayerNode from "./LayerNode";
import LayersList from "./LayersList";
import PropertiesPanel from "./PropertiesPanel";
import PlayerPickerModal, { PickedPlayer } from "./PlayerPickerModal";

const POSITION_LABELS: Record<string, string> = {
  GK: "GOALKEEPER",
  CB: "DEFENDER",
  LB: "DEFENDER",
  RB: "DEFENDER",
  LWB: "DEFENDER",
  RWB: "DEFENDER",
  CM: "MIDFIELDER",
  CDM: "MIDFIELDER",
  CAM: "MIDFIELDER",
  DM: "MIDFIELDER",
  AM: "MIDFIELDER",
  LM: "MIDFIELDER",
  RM: "MIDFIELDER",
  ST: "FORWARD",
  CF: "FORWARD",
  LW: "FORWARD",
  RW: "FORWARD",
  LF: "FORWARD",
  RF: "FORWARD",
};

// Rapid-fire changes (dragging a slider, dragging a layer) within this window
// collapse into a single undo step instead of one step per tick.
const HISTORY_COALESCE_MS = 500;
const HISTORY_LIMIT = 50;

// Reveal animation used for the GIF export — must match the timing baked
// into the "gg-reveal-in" keyframes below.
const REVEAL_STAGGER_MS = 90;
const REVEAL_DURATION_MS = 550;
const REVEAL_HOLD_MS = 1200;
const GIF_WIDTH = 480;

export default function GoalGraphicsBuilder() {
  const [layers, setLayers] = useState<AnyLayer[]>(() => buildDefaultLayers());
  const [past, setPast] = useState<AnyLayer[][]>([]);
  const [future, setFuture] = useState<AnyLayer[][]>([]);
  const lastCommitRef = useRef(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fileName, setFileName] = useState("goal-graphic");

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [canvasPx, setCanvasPx] = useState({ width: CANVAS_W, height: CANVAS_H });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () =>
      setCanvasPx({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectedLayer = layers.find((l) => l.id === selectedId) ?? null;

  // Every mutation goes through here so undo/redo always has a consistent trail.
  const applyLayers = (next: AnyLayer[]) => {
    const now = Date.now();
    setPast((p) => {
      if (p.length > 0 && now - lastCommitRef.current < HISTORY_COALESCE_MS) {
        return p; // coalesce into the in-flight step
      }
      return [...p, layers].slice(-HISTORY_LIMIT);
    });
    lastCommitRef.current = now;
    setFuture([]);
    setLayers(next);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [layers, ...f]);
    setLayers(previous);
    lastCommitRef.current = 0;
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, layers]);
    setLayers(next);
    lastCommitRef.current = 0;
  };

  const updateLayer = (id: string, patch: Partial<AnyLayer>) =>
    applyLayers(
      layers.map((l) => (l.id === id ? ({ ...l, ...patch } as AnyLayer) : l)),
    );

  const addLayer = (layer: AnyLayer) => {
    applyLayers([...layers, layer]);
    setSelectedId(layer.id);
  };

  const addText = () =>
    addLayer({
      id: uid(),
      type: "text",
      name: "Text",
      text: "NEW TEXT",
      fontKey: "oswald",
      fontSize: 4,
      color: "#FFF5E5",
      fontWeight: 700,
      align: "center",
      letterSpacing: 1,
      uppercase: true,
      x: 25,
      y: 45,
      width: 50,
      height: 8,
      rotation: 0,
      opacity: 1,
    });

  const addShape = () =>
    addLayer({
      id: uid(),
      type: "shape",
      name: "Shape",
      color: "#e09225",
      radius: 0,
      x: 35,
      y: 40,
      width: 20,
      height: 12,
      rotation: 0,
      opacity: 1,
    });

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;
    const src = URL.createObjectURL(file);
    addLayer({
      id: uid(),
      type: "image",
      name: "Image",
      src,
      fit: "cover",
      x: 20,
      y: 20,
      width: 60,
      height: 60,
      rotation: 0,
      opacity: 1,
    });
  };

  const toggleHidden = (id: string) =>
    applyLayers(layers.map((l) => (l.id === id ? { ...l, hidden: !l.hidden } : l)));

  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = layers.findIndex((l) => l.id === id);
    const swapWith = direction === "up" ? index + 1 : index - 1;
    if (swapWith < 0 || swapWith >= layers.length) return;
    const next = [...layers];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    applyLayers(next);
  };

  const duplicateLayer = (id: string) => {
    const source = layers.find((l) => l.id === id);
    if (!source) return;
    const copy = { ...source, id: uid(), name: `${source.name} copy` };
    applyLayers([...layers, copy]);
    setSelectedId(copy.id);
  };

  const deleteLayer = (id: string) => {
    applyLayers(layers.filter((l) => l.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  const resetTemplate = () => {
    if (!confirm("Reset to the default template? This discards all changes.")) return;
    applyLayers(buildDefaultLayers());
    setSelectedId(null);
  };

  const applyPlayer = (player: PickedPlayer) => {
    const [first, ...rest] = player.name.trim().split(" ");
    const last = rest.join(" ");
    const positionLabel = POSITION_LABELS[player.position] ?? player.position.toUpperCase();

    applyLayers(
      layers.map((l) => {
        if (l.type === "text" && l.name === "First name") return { ...l, text: rest.length ? first.toUpperCase() : "" };
        if (l.type === "text" && l.name === "Last name")
          return { ...l, text: (rest.length ? last : first).toUpperCase() };
        if (l.type === "text" && l.name === "Number")
          return { ...l, text: player.number != null ? String(player.number) : "" };
        if (l.type === "text" && l.name === "Position") return { ...l, text: positionLabel };
        if (l.type === "image" && l.name === "Player photo")
          return { ...l, src: player.vertical_image };
        return l;
      }),
    );
    setFileName(`${player.name.replace(/\s+/g, "-").toLowerCase()}-goal`);
    setPickerOpen(false);
    toast.success(`Applied ${player.name}`);
  };

  // Keyboard shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) redo,
  // Delete/Backspace removes the selected layer — skipped while typing.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (!isTyping && (e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteLayer(selectedId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, layers, past, future]);

  const handleExport = async () => {
    setSelectedId(null);
    setIsExporting(true);
    // Let React repaint without selection handles before we capture the node.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    try {
      const node = canvasRef.current;
      if (!node) throw new Error("Canvas not ready");

      const blob = await domToBlob(node, {
        scale: Math.max(window.devicePixelRatio, 2),
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "goal-graphic"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Graphic downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export the graphic.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGif = async () => {
    setSelectedId(null);
    setIsExporting(true);
    setIsAnimating(true);
    // Let React mount the reveal animation (opacity:0 + delayed keyframe) before we start capturing.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    try {
      const node = canvasRef.current;
      if (!node) throw new Error("Canvas not ready");

      const scale = GIF_WIDTH / node.clientWidth;
      const width = Math.round(node.clientWidth * scale);
      const height = Math.round(node.clientHeight * scale);

      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = width;
      frameCanvas.height = height;
      const ctx = frameCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas context unavailable");

      const gif = GIFEncoder();
      const visibleCount = layers.filter((l) => !l.hidden).length;
      const revealMs = Math.min(
        3000,
        visibleCount * REVEAL_STAGGER_MS + REVEAL_DURATION_MS + 200,
      );

      const start = performance.now();
      let lastT = start;
      let lastIndex: Uint8Array | null = null;
      let lastPalette: Color[] | null = null;

      while (performance.now() - start < revealMs) {
        const blob = await domToBlob(node, { scale });
        const bitmap = await createImageBitmap(blob);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const { data } = ctx.getImageData(0, 0, width, height);
        const palette = quantize(data, 128);
        const index = applyPalette(data, palette);

        const now = performance.now();
        const delay = Math.max(30, Math.round(now - lastT));
        lastT = now;

        gif.writeFrame(index, width, height, { palette, delay });
        lastIndex = index;
        lastPalette = palette;
      }

      // Hold on the fully-revealed frame before the GIF loops.
      if (lastIndex && lastPalette) {
        gif.writeFrame(lastIndex, width, height, {
          palette: lastPalette,
          delay: REVEAL_HOLD_MS,
        });
      }

      gif.finish();
      const bytes = gif.bytes();
      const blob = new Blob([bytes as BlobPart], { type: "image/gif" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "goal-graphic"}.gif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Animated GIF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export the animated GIF.");
    } finally {
      setIsAnimating(false);
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Canvas */}
      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="flex w-full max-w-[480px] flex-wrap items-center gap-2">
          <ToolbarButton icon={UserSquare2} label="Pick player" onClick={() => setPickerOpen(true)} />
          <ToolbarButton icon={Type} label="Text" onClick={addText} />
          <ToolbarButton icon={ImageIcon} label="Image" onClick={() => imageInputRef.current?.click()} />
          <ToolbarButton icon={Square} label="Shape" onClick={addShape} />
          <ToolbarButton
            icon={Grid3x3}
            label="Grid"
            active={showGrid}
            onClick={() => setShowGrid((v) => !v)}
          />
          <ToolbarButton icon={Undo2} label="Undo" onClick={undo} disabled={past.length === 0} />
          <ToolbarButton icon={Redo2} label="Redo" onClick={redo} disabled={future.length === 0} />
          <ToolbarButton icon={RotateCcw} label="Reset" onClick={resetTemplate} />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFile(e.target.files?.[0])}
          />
        </div>

        <div className="w-full max-w-[480px]">
          <div
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
            className="relative w-full"
          >
            <div
              id="goal-graphic-canvas"
              ref={canvasRef}
              onMouseDown={() => setSelectedId(null)}
              className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl"
              style={{
                background:
                  "radial-gradient(120% 100% at 30% 0%, #123a63 0%, #06182e 55%, #04101f 100%)",
              }}
            >
              {showGrid && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                    backgroundSize: `${canvasPx.width / 10}px ${canvasPx.width / 10}px`,
                  }}
                />
              )}

              {layers
                .filter((l) => !l.hidden)
                .map((layer, index) => (
                  <LayerNode
                    key={layer.id}
                    layer={layer}
                    canvasWidth={canvasPx.width}
                    canvasHeight={canvasPx.height}
                    selected={layer.id === selectedId}
                    interactive={!isExporting}
                    reveal={isAnimating}
                    staggerIndex={index}
                    onSelect={() => setSelectedId(layer.id)}
                    onChange={(patch) => updateLayer(layer.id, patch)}
                  />
                ))}
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[480px] items-center gap-2">
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="flex-1 rounded-xl border border-[#06182e]/15 bg-white px-3 py-2.5 text-sm text-[#06182e] outline-none focus:border-[#e09225]"
            placeholder="file-name"
          />
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-[#e09225] px-5 py-2.5 text-sm font-semibold text-[#06182e] transition hover:opacity-90 disabled:opacity-60"
          >
            <Download size={16} />
            {isExporting ? "Working..." : "Download PNG"}
          </button>
          <button
            onClick={handleExportGif}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl border border-[#06182e]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#06182e] transition hover:border-[#e09225]/50 disabled:opacity-60"
          >
            <Film size={16} />
            {isExporting ? "Working..." : "Download GIF"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gg-reveal-in {
          from { opacity: 0; }
          to { opacity: var(--gg-op, 1); }
        }
      `}</style>

      {/* Side panels */}
      <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl bg-white/60 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#06182e]/50">
            Layers
          </h3>
          <LayersList
            layers={layers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleHidden={toggleHidden}
            onMove={moveLayer}
            onDuplicate={duplicateLayer}
            onDelete={deleteLayer}
          />
        </div>

        {selectedLayer && (
          <div className="rounded-2xl bg-white/60 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#06182e]/50">
              Properties
            </h3>
            <PropertiesPanel
              layer={selectedLayer}
              onChange={(patch) => updateLayer(selectedLayer.id, patch)}
            />
          </div>
        )}
      </div>

      {pickerOpen && (
        <PlayerPickerModal onSelect={applyPlayer} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: typeof Type;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "border-[#e09225] bg-[#e09225]/10 text-[#e09225]"
          : "border-[#06182e]/15 bg-white text-[#06182e]/70 hover:border-[#e09225]/50"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
