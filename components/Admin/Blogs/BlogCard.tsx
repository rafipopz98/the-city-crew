"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Heart, MessageSquare, Pencil, Trash2, Star } from "lucide-react";

import { toast } from "sonner";
import CreateBlogModal from "./CreateBlogModal";

type Props = {
  blog: any;
  onSuccess?: () => void;
};

const BlogCard = ({ blog, onSuccess }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const res = await fetch(`/api/blogs/${blog._id}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      toast.success("Blog deleted", {
        description: "The blog was removed successfully.",
      });

      onSuccess?.();
    } catch (error) {
      toast.error("Delete failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const statusColors = {
    published: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    archived: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <>
      <div
        className="
          group
        bg-[#e09225]/5
          border border-[#06182e]/10
          rounded-2xl
          overflow-hidden
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >
        {/* Image */}
        <div className="relative h-56 w-full">
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            fill
            className="object-cover"
          />

          {/* Featured */}
          {blog.is_featured && (
            <div
              className="
                absolute
                top-3
                right-3
                flex
                items-center
                gap-1
                px-3
                py-1
                rounded-full
                bg-[#e09225]
                text-white
                text-xs
                font-medium
              "
            >
              <Star size={12} />
              Featured
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Status */}
          <div className="mb-3">
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-medium border
                ${
                  statusColors[blog.status as keyof typeof statusColors] ||
                  "bg-slate-50 text-slate-700"
                }
              `}
            >
              {blog.status}
            </span>
          </div>

          {/* Title */}
          <h2
            className="
              text-lg
              font-semibold
              text-[#06182e]
              line-clamp-2
              leading-snug
            "
          >
            {blog.title}
          </h2>

          {/* Stats */}
          <div
            className="
              mt-5
              flex
              items-center
              gap-5
              text-sm
              text-[#06182e]/60
            "
          >
            <div className="flex items-center gap-1.5">
              <Eye size={16} />
              {blog.views_count}
            </div>

            <div className="flex items-center gap-1.5">
              <Heart size={16} />
              {blog.likes_count}
            </div>

            <div className="flex items-center gap-1.5">
              <MessageSquare size={16} />
              {blog.comments_count}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="
                flex-1
                flex
                items-center
                justify-center
                gap-2
                bg-[#e09225]
                text-[#06182e]
                py-2.5
                rounded-xl
                text-sm
                font-medium
                hover:opacity-90
                transition
              "
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="
                w-11
                h-11
                flex
                items-center
                justify-center
                border
                border-red-200
                text-red-500
                rounded-xl
                hover:bg-red-50
                transition
                disabled:opacity-50
              "
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
      <CreateBlogModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          onSuccess?.();
        }}
        mode="edit"
        initialData={blog}
      />
    </>
  );
};

export default BlogCard;
