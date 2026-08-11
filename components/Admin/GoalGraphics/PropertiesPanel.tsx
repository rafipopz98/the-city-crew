"use client";

import { useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, Upload } from "lucide-react";
import { AnyLayer, CLUB_LOGOS } from "@/constants/goalGraphics";
import { FONT_OPTIONS } from "./fonts";

type Props = {
  layer: AnyLayer;
  onChange: (patch: Partial<AnyLayer>) => void;
};

const fieldLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#06182e]/50";
const inputBase =
  "w-full rounded-lg border border-[#06182e]/15 bg-white px-3 py-2 text-sm text-[#06182e] outline-none focus:border-[#e09225]";

export default function PropertiesPanel({ layer, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ src: url } as Partial<AnyLayer>);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={fieldLabel}>Layer name</label>
        <input
          className={`${inputBase} mt-1`}
          value={layer.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      {layer.type === "text" && (
        <>
          <div>
            <label className={fieldLabel}>Text</label>
            <textarea
              className={`${inputBase} mt-1 resize-none`}
              rows={2}
              value={layer.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<AnyLayer>)}
            />
          </div>

          <div>
            <label className={fieldLabel}>Font</label>
            <select
              className={`${inputBase} mt-1`}
              value={layer.fontKey}
              onChange={(e) => onChange({ fontKey: e.target.value } as Partial<AnyLayer>)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Size</label>
              <input
                type="range"
                min={0.5}
                max={24}
                step={0.1}
                value={layer.fontSize}
                onChange={(e) =>
                  onChange({ fontSize: parseFloat(e.target.value) } as Partial<AnyLayer>)
                }
                className="w-full mt-2 accent-[#e09225]"
              />
            </div>
            <div>
              <label className={fieldLabel}>Weight</label>
              <select
                className={`${inputBase} mt-1`}
                value={layer.fontWeight}
                onChange={(e) =>
                  onChange({ fontWeight: parseInt(e.target.value) } as Partial<AnyLayer>)
                }
              >
                {[400, 500, 600, 700, 800, 900].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={layer.color}
                  onChange={(e) => onChange({ color: e.target.value } as Partial<AnyLayer>)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded border border-[#06182e]/15"
                />
                <input
                  className={inputBase}
                  value={layer.color}
                  onChange={(e) => onChange({ color: e.target.value } as Partial<AnyLayer>)}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Letter spacing</label>
              <input
                type="range"
                min={-2}
                max={12}
                step={0.5}
                value={layer.letterSpacing}
                onChange={(e) =>
                  onChange({ letterSpacing: parseFloat(e.target.value) } as Partial<AnyLayer>)
                }
                className="w-full mt-3 accent-[#e09225]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className={fieldLabel}>Align</label>
              <div className="mt-1 flex gap-1">
                {(["left", "center", "right"] as const).map((a) => {
                  const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={a}
                      onClick={() => onChange({ align: a } as Partial<AnyLayer>)}
                      className={`rounded-lg border px-2.5 py-2 ${
                        layer.align === a
                          ? "border-[#e09225] bg-[#e09225]/10 text-[#e09225]"
                          : "border-[#06182e]/15 text-[#06182e]/50"
                      }`}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#06182e]/70">
              <input
                type="checkbox"
                checked={layer.uppercase}
                onChange={(e) => onChange({ uppercase: e.target.checked } as Partial<AnyLayer>)}
                className="accent-[#e09225]"
              />
              Uppercase
            </label>
          </div>
        </>
      )}

      {layer.type === "image" && (
        <>
          <div>
            <label className={fieldLabel}>Photo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#e09225]/50 bg-[#e09225]/5 px-3 py-2.5 text-sm font-medium text-[#e09225] hover:bg-[#e09225]/10"
            >
              <Upload size={14} />
              Upload from device
            </button>
            <p className="mt-1 text-[11px] text-[#06182e]/40">
              Stays in your browser — nothing is uploaded to a server.
            </p>
          </div>

          <div>
            <label className={fieldLabel}>Or use a club crest</label>
            <select
              className={`${inputBase} mt-1`}
              value=""
              onChange={(e) => {
                if (e.target.value) onChange({ src: e.target.value, fit: "contain" } as Partial<AnyLayer>);
              }}
            >
              <option value="">Select club...</option>
              {CLUB_LOGOS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Fit</label>
              <select
                className={`${inputBase} mt-1`}
                value={layer.fit}
                onChange={(e) => onChange({ fit: e.target.value } as Partial<AnyLayer>)}
              >
                <option value="cover">Fill (crop)</option>
                <option value="contain">Fit (no crop)</option>
              </select>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#06182e]/70">
                <input
                  type="checkbox"
                  checked={!!layer.grayscale}
                  onChange={(e) => onChange({ grayscale: e.target.checked } as Partial<AnyLayer>)}
                  className="accent-[#e09225]"
                />
                Grayscale
              </label>
              <label className="flex items-center gap-2 text-sm text-[#06182e]/70">
                <input
                  type="checkbox"
                  checked={!!layer.invert}
                  onChange={(e) => onChange({ invert: e.target.checked } as Partial<AnyLayer>)}
                  className="accent-[#e09225]"
                />
                Invert
              </label>
            </div>
          </div>
        </>
      )}

      {layer.type === "shape" && (
        <>
          <div>
            <label className={fieldLabel}>Color</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={layer.color}
                onChange={(e) => onChange({ color: e.target.value } as Partial<AnyLayer>)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded border border-[#06182e]/15"
              />
              <input
                className={inputBase}
                value={layer.color}
                onChange={(e) => onChange({ color: e.target.value } as Partial<AnyLayer>)}
              />
            </div>
          </div>
          <div>
            <label className={fieldLabel}>Corner radius</label>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={layer.radius}
              onChange={(e) => onChange({ radius: parseFloat(e.target.value) } as Partial<AnyLayer>)}
              className="w-full mt-2 accent-[#e09225]"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-[#06182e]/10 pt-4">
        <div>
          <label className={fieldLabel}>Opacity</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={layer.opacity}
            onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
            className="w-full mt-2 accent-[#e09225]"
          />
        </div>
        <div>
          <label className={fieldLabel}>Rotation</label>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={layer.rotation}
            onChange={(e) => onChange({ rotation: parseFloat(e.target.value) })}
            className="w-full mt-2 accent-[#e09225]"
          />
        </div>
      </div>
    </div>
  );
}
