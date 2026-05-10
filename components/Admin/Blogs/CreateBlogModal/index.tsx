"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import BlogBasicFields from "./BlogBasicFields";
import BlogSettings from "./BlogSettings";
import BlogBlocks from "./BlogBlocks";

import { Block, CreateBlogModalProps } from "./types";

export default function CreateBlogModal({
  open,
  onClose,
  onSuccess,
}: CreateBlogModalProps) {
  const [title, setTitle] = useState("");

  const [thumbnail, setThumbnail] = useState("");

  const [excerpt, setExcerpt] = useState("");

  const [tags, setTags] = useState("");

  const [status, setStatus] = useState("draft");

  const [isFeatured, setIsFeatured] = useState(false);

  const [blocks, setBlocks] = useState<Block[]>([]);

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const addBlock = (type: "text" | "image") => {
    setBlocks((prev) => [
      ...prev,
      {
        type,
        value: "",
        order: prev.length + 1,
      },
    ]);
  };

  const updateBlock = (index: number, value: string) => {
    setBlocks((prev) => {
      const copy = [...prev];

      copy[index].value = value;

      return copy;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    try {
      if (!title.trim()) {
        toast.error("Title required");

        return;
      }

      setLoading(true);

      await fetch("/api/blogs/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          thumbnail,
          excerpt,
          status,
          is_featured: isFeatured,
          tags: tags.split(",").map((t) => t.trim()),
          content_blocks: blocks,
        }),
      });

      toast.success("Blog created");

      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-screen flex items-center justify-center p-6">
        <div
          className="
            bg-white
            w-full max-w-4xl
            rounded-3xl
            max-h-[90vh]
            overflow-hidden
            flex flex-col
          "
        >
          <div className="border-b p-6 flex justify-between">
            <h2 className="text-xl font-bold">Create Blog</h2>

            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <div
            className="
              p-6
              space-y-8
              overflow-y-auto
            "
          >
            <BlogBasicFields
              title={title}
              setTitle={setTitle}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
            />

            <BlogSettings
              tags={tags}
              setTags={setTags}
              status={status}
              setStatus={setStatus}
              isFeatured={isFeatured}
              setIsFeatured={setIsFeatured}
            />

            <BlogBlocks
              blocks={blocks}
              addBlock={addBlock}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
            />
          </div>

          <div className="border-t p-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4">
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="
                bg-[#e09225]
                text-[#06182e]
                px-6 py-2
                rounded-xl
              "
            >
              {loading ? "Creating..." : "Create Blog"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
