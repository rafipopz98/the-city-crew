import { FileText, ImageIcon, Trash2 } from "lucide-react";

import { Block } from "./types";

type Props = {
  blocks: Block[];
  addBlock: (type: "text" | "image") => void;
  updateBlock: (index: number, value: string) => void;
  removeBlock: (index: number) => void;
};

export default function BlogBlocks({
  blocks,
  addBlock,
  updateBlock,
  removeBlock,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => addBlock("text")}
          className="
            flex items-center gap-2
            border rounded-xl
            px-4 py-2
          "
        >
          <FileText size={16} />
          Text
        </button>

        <button
          onClick={() => addBlock("image")}
          className="
            flex items-center gap-2
            border rounded-xl
            px-4 py-2
          "
        >
          <ImageIcon size={16} />
          Image
        </button>
      </div>

      {blocks.map((block, index) => (
        <div
          key={index}
          className="
              border border-[#06182e]/10
              rounded-2xl
              p-4
            "
        >
          <div className="flex justify-between mb-3">
            <p className="text-sm font-semibold capitalize">
              {block.type} Block
            </p>

            <button onClick={() => removeBlock(index)} className="text-red-500">
              <Trash2 size={16} />
            </button>
          </div>

          {block.type === "text" ? (
            <textarea
              rows={4}
              value={block.value}
              onChange={(e) => updateBlock(index, e.target.value)}
              className="
                  w-full
                  border rounded-xl
                  px-4 py-3
                "
            />
          ) : (
            <input
              value={block.value}
              onChange={(e) => updateBlock(index, e.target.value)}
              placeholder="Image URL..."
              className="
                  w-full
                  border rounded-xl
                  px-4 py-3
                "
            />
          )}
        </div>
      ))}
    </div>
  );
}
