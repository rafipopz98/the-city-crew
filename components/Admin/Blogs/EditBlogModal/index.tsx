"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { toast } from "sonner";

import BlogBasicFields from "../CreateBlogModal/BlogBasicFields";
import BlogSettings from "../CreateBlogModal/BlogSettings";
import BlogBlocks from "../CreateBlogModal/BlogBlocks";

import { Block } from "../CreateBlogModal/types";

type Props = {
  open: boolean;
  onClose: () => void;
  blog: any;
  onSuccess?: () => void;
};

export default function EditBlogModal({
  open,
  onClose,
  blog,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");

  const [isFeatured, setIsFeatured] = useState(false);

  const [blocks, setBlocks] = useState<Block[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!blog) return;

    setTitle(blog.title || "");

    setThumbnail(blog.thumbnail || "");

    setExcerpt(blog.excerpt || "");

    setTags((blog.tags || []).join(", "));

    setStatus(blog.status || "draft");

    setIsFeatured(!!blog.is_featured);

    setBlocks(blog.content_blocks || []);
  }, [blog]);

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

  const handleUpdate = async () => {
    try {
      if (!title.trim()) {
        toast.error("Title required");

        return;
      }

      setLoading(true);

      const res = await fetch(`/api/blogs/${blog._id}/edit`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          thumbnail,
          excerpt,

          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),

          status,

          is_featured: isFeatured,

          content_blocks: blocks.filter((block) => block.value.trim() !== ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success("Blog updated", {
        description: "Changes saved successfully.",
      });

      onClose();

      onSuccess?.();
    } catch (error) {
      toast.error("Update failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0
        z-50
        bg-black/40
        backdrop-blur-sm
      "
    >
      <div
        className="
          h-screen
          flex
          items-center
          justify-center
          p-6
        "
      >
        <div
          className="
            bg-white
            w-full
            max-w-4xl
            rounded-3xl
            max-h-[90vh]
            overflow-hidden
            flex flex-col
            shadow-2xl
          "
        >
          {/* Header */}
          <div
            className="
              border-b
              px-6 py-5
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-[#06182e]
                "
              >
                Edit Blog
              </h2>

              <p
                className="
                  text-sm
                  text-[#06182e]/50
                  mt-1
                "
              >
                Update content, settings, and structure
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                p-2
                rounded-xl
                hover:bg-gray-100
                transition
              "
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div
            className="
              flex-1
              overflow-y-auto
              p-6
              space-y-8
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

          {/* Footer */}
          <div
            className="
              border-t
              px-6 py-5
              flex
              justify-end
              gap-3
            "
          >
            <button
              onClick={onClose}
              className="
                px-5 py-2
                text-sm
                font-medium
                text-[#06182e]/70
              "
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="
                flex
                items-center
                gap-2
                bg-[#e09225]
                text-[#06182e]
                px-5 py-2.5
                rounded-xl
                text-sm
                font-medium
                hover:opacity-90
                transition
                disabled:opacity-50
              "
            >
              <Save size={16} />

              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
