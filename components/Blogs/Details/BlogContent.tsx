"use client";

import { ImageLightbox } from "./ImageLightbox";
import { Block } from "./types";

interface BlogContentProps {
  blocks: Block[];
}

export const BlogContent = ({ blocks }: BlogContentProps) => {
  if (!blocks || blocks.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-5 pb-20">
        <div className="text-center py-20">
          <p className="text-[#06182e]/30 text-lg">No content available</p>
          <p className="text-[#06182e]/20 text-sm mt-2">
            This article appears to be empty
          </p>
        </div>
      </section>
    );
  }

  const allImages = blocks
    .filter((block) => block.type === "image")
    .map((block) => block.value);

  // Filter text blocks for proper indexing
  const textBlocks = blocks.filter((block) => block.type === "text");

  return (
    <section className="max-w-3xl mx-auto px-5 pb-20">
      <div className="flex flex-col gap-8 md:gap-12">
        {blocks.map((block, index) => {
          switch (block.type) {
            case "text": {
              // Find the position of this text block among all text blocks
              const textBlockIndex = textBlocks.indexOf(block);

              return (
                <div
                  key={index}
                  id={`section-${textBlockIndex}`}
                  className="scroll-mt-24"
                >
                  {/* Section number indicator (subtle) */}
                  <span className="text-[10px] text-[#06182e]/20 font-mono mb-2 block">
                    {String(textBlockIndex + 1).padStart(2, "0")}
                  </span>

                  <p className="text-lg md:text-xl leading-[1.9] text-[#06182e] whitespace-pre-line">
                    {block.value}
                  </p>
                </div>
              );
            }

            case "image":
              return (
                <div key={index} className="my-4">
                  <ImageLightbox
                    src={block.value}
                    alt="Blog image"
                    allImages={allImages}
                  />
                </div>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Article End Divider */}
      <div className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-[#06182e]/10">
        <div className="h-0.5 w-8 bg-[#e09225]" />
        <span className="text-xs text-[#06182e]/30 uppercase tracking-widest">
          End of Article
        </span>
        <div className="h-0.5 w-8 bg-[#e09225]" />
      </div>
    </section>
  );
};
