"use client";

import React from "react";
import { ImageLightbox } from "./ImageLightbox";
import { Block } from "./types";

interface BlogContentProps {
  blocks: Block[];
}

// Fix: Use a more explicit approach for dynamic heading tags
const HeadingTag = ({
  level = 2,
  children,
  index,
}: {
  level?: 2 | 3 | 4;
  children: React.ReactNode;
  index: number;
}) => {
  const baseClasses = "font-bold text-[#06182e] scroll-mt-24";

  const styles = {
    2: "text-3xl md:text-4xl mt-8",
    3: "text-2xl md:text-3xl mt-6",
    4: "text-xl md:text-2xl mt-4",
  };

  const className = `${baseClasses} ${styles[level]}`;
  const id = `heading-${index}`;

  // Fix: Use explicit conditional rendering instead of dynamic tag
  switch (level) {
    case 3:
      return (
        <h3 id={id} className={className}>
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 id={id} className={className}>
          {children}
        </h4>
      );
    case 2:
    default:
      return (
        <h2 id={id} className={className}>
          {children}
        </h2>
      );
  }
};

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

  return (
    <section className="max-w-3xl mx-auto px-5 pb-20">
      <div className="flex flex-col gap-8 md:gap-12">
        {blocks.map((block, index) => {
          switch (block.type) {
            case "heading":
              return (
                <HeadingTag key={index} level={block.level || 2} index={index}>
                  {block.value}
                </HeadingTag>
              );

            case "text":
              return (
                <div
                  key={index}
                  className="prose prose-lg md:prose-xl max-w-none
                    prose-p:text-[#06182e]/80 prose-p:leading-relaxed prose-p:mb-4
                    prose-strong:text-[#06182e] prose-strong:font-bold
                    prose-a:text-[#e09225] prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                    prose-ul:text-[#06182e]/80 prose-ul:my-4
                    prose-ol:text-[#06182e]/80 prose-ol:my-4
                    prose-li:my-1
                    prose-img:rounded-2xl prose-img:shadow-lg
                  "
                  dangerouslySetInnerHTML={{ __html: block.value }}
                />
              );

            case "image":
              return (
                <div key={index} className="my-4">
                  <ImageLightbox
                    src={block.value}
                    alt={block.caption || "Blog image"}
                    caption={block.caption}
                    allImages={allImages}
                  />
                </div>
              );

            case "quote":
              return (
                <blockquote
                  key={index}
                  className="border-l-4 border-[#e09225] pl-6 py-2 my-8 bg-[#e09225]/5 rounded-r-xl"
                >
                  <p className="text-xl md:text-2xl text-[#06182e]/70 italic leading-relaxed">
                    &ldquo;{block.value}&rdquo;
                  </p>
                </blockquote>
              );

            case "list":
              return (
                <div
                  key={index}
                  className="prose prose-lg md:prose-xl max-w-none
                    prose-ul:text-[#06182e]/80
                    prose-li:text-[#06182e]/80 prose-li:leading-relaxed
                  "
                  dangerouslySetInnerHTML={{ __html: block.value }}
                />
              );

            default:
              return (
                <div key={index} className="text-[#06182e]/30 text-sm">
                  Unsupported block type: {block.type}
                </div>
              );
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
