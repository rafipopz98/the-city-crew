"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ImageIcon, Type, Plus } from "lucide-react";

type Props = {
  onSelect: (type: "text" | "image") => void;
};

const AddSectionButton = ({ onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", click);

    return () => window.removeEventListener("click", click);
  }, []);

  return (
    <div ref={ref} className="relative mt-14 flex justify-center">
      <button
        onClick={() => setOpen(!open)}
        className="
          group

          flex
          items-center
          gap-3

          rounded-full

          border
          border-black/10

          bg-white/50

          px-5
          py-3

          transition-all

          hover:border-[#e09225]
          hover:bg-white
        "
      >
        <Plus size={16} className="transition group-hover:rotate-90" />

        <span
          className="
            text-sm

            uppercase

            tracking-[0.25em]
          "
        >
          Add Section
        </span>

        <ChevronDown
          size={16}
          className={`
            transition
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && (
        <div
          className="
            absolute

            top-16

            w-60

            overflow-hidden

            rounded-2xl

            border
            border-black/10

            bg-[#ece1cf]

            shadow-xl
          "
        >
          <button
            onClick={() => {
              onSelect("text");
              setOpen(false);
            }}
            className="
              flex
              w-full
              items-center
              gap-4

              px-5
              py-4

              transition

              hover:bg-white/60
            "
          >
            <Type size={18} />

            <div className="text-left">
              <p className="font-medium">Paragraph</p>

              <p className="text-sm text-black/45">Write text</p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelect("image");
              setOpen(false);
            }}
            className="
              flex
              w-full
              items-center
              gap-4

              border-t
              border-black/10

              px-5
              py-4

              transition

              hover:bg-white/60
            "
          >
            <ImageIcon size={18} />

            <div className="text-left">
              <p className="font-medium">Image</p>

              <p className="text-sm text-black/45">Paste image URL</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddSectionButton;
