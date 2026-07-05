"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import {
  Block,
  CreateBlogModalProps,
  STEPS,
} from "../../Refined-blogs/blog-types";
import StepProgress from "../../Refined-blogs/StepProgress";
import StepBasics from "../../Refined-blogs/StepBasic";
import StepStory from "../../Refined-blogs/StepStory";
import StepPublish from "../../Refined-blogs/StepPublish";

const initialState = {
  title: "",
  thumbnail: "",
  excerpt: "",
  tags: [] as string[],
  status: "draft" as "draft" | "published" | "hidden",
  isFeatured: false,
  blocks: [] as Block[],
};

export default function CreateBlogModal({
  open,
  onClose,
  onSuccess,
}: CreateBlogModalProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [thumbnailError, setThumbnailError] = useState<string | undefined>();
  const [storyError, setStoryError] = useState<string | undefined>();

  const [title, setTitle] = useState(initialState.title);
  const [thumbnail, setThumbnail] = useState(initialState.thumbnail);
  const [excerpt, setExcerpt] = useState(initialState.excerpt);
  const [tags, setTags] = useState<string[]>(initialState.tags);
  const [status, setStatus] = useState(initialState.status);
  const [isFeatured, setIsFeatured] = useState(initialState.isFeatured);
  const [blocks, setBlocks] = useState<Block[]>(initialState.blocks);

  if (!open) return null;

  const resetAndClose = () => {
    setStep(0);
    setTitle(initialState.title);
    setThumbnail(initialState.thumbnail);
    setExcerpt(initialState.excerpt);
    setTags(initialState.tags);
    setStatus(initialState.status);
    setIsFeatured(initialState.isFeatured);
    setBlocks(initialState.blocks);
    setTitleError(undefined);
    setThumbnailError(undefined);
    setStoryError(undefined);
    onClose();
  };

  const addBlock = (type: "text" | "image") => {
    setStoryError(undefined);
    setBlocks((prev) => [...prev, { type, value: "", order: prev.length + 1 }]);
  };

  const updateBlock = (index: number, value: string) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], value };
      return copy;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const copy = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const goNext = () => {
    if (step === 0) {
      if (!title.trim() || !thumbnail.trim()) {
        setTitleError("Give your post a title before continuing");
        setThumbnailError("Add a thumbnail image before continuing");
        toast.error("Your post needs a title and thumbnail first");
        return;
      }
      setTitleError(undefined);
      setThumbnailError(undefined);
    }

    if (step === 1) {
      const hasContent = blocks.some((b) => b.value.trim().length > 0);
      if (blocks.length === 0 || !hasContent) {
        setStoryError("Add at least one paragraph or image before continuing");
        toast.error("Your post needs some content first");
        return;
      }
      setStoryError(undefined);
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleCreate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/blogs/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          thumbnail,
          excerpt,
          status,
          is_featured: isFeatured,
          tags,
          content_blocks: blocks,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success("Blog created");
      onSuccess?.();
      resetAndClose();
    } catch (err) {
      toast.error("Couldn't create the blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="flex h-full items-stretch justify-center sm:items-center sm:p-6">
        <div
          className="
            flex h-full w-full flex-col bg-[#ece1cf]
            sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[#06182e]/10 p-5 sm:p-6">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#06182e] sm:text-xl">
                New blog post
              </h2>
              <p className="truncate text-xs text-[#06182e]/45 sm:hidden">
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </p>
            </div>

            <div className="hidden sm:block">
              <StepProgress steps={STEPS} currentIndex={step} />
            </div>

            <button
              onClick={resetAndClose}
              className="shrink-0 rounded-full p-1.5 text-[#06182e]/50 transition hover:bg-[#06182e]/5 hover:text-[#06182e]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="border-b border-[#06182e]/10 px-5 py-3 sm:hidden">
            <StepProgress steps={STEPS} currentIndex={step} />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {step === 0 && (
              <StepBasics
                title={title}
                setTitle={(v) => {
                  setTitle(v);
                  if (v.trim()) setTitleError(undefined);
                }}
                thumbnail={thumbnail}
                setThumbnail={(v) => {
                  setThumbnail(v);
                  if (v.trim()) setThumbnailError(undefined);
                }}
                excerpt={excerpt}
                setExcerpt={setExcerpt}
                errors={{ title: titleError, thumbnail: thumbnailError }}
              />
            )}

            {step === 1 && (
              <StepStory
                blocks={blocks}
                onAdd={addBlock}
                onUpdate={updateBlock}
                onRemove={removeBlock}
                onMove={moveBlock}
                error={storyError}
              />
            )}

            {step === 2 && (
              <StepPublish
                tags={tags}
                setTags={setTags}
                status={status}
                setStatus={setStatus}
                featured={isFeatured}
                setFeatured={setIsFeatured}
                title={title}
                thumbnail={thumbnail}
                excerpt={excerpt}
                blocks={blocks}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-[#06182e]/10 p-5 sm:p-6">
            {step === 0 ? (
              <button
                onClick={resetAndClose}
                className="px-4 py-2.5 text-sm font-medium text-[#06182e]/60 transition hover:text-[#06182e]"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[#06182e]/70 transition hover:bg-[#06182e]/5"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            )}

            {isLastStep ? (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-xl bg-[#e09225] px-6 py-2.5 text-sm font-semibold text-[#06182e] transition hover:brightness-105 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create blog"}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-xl bg-[#e09225] px-6 py-2.5 text-sm font-semibold text-[#06182e] transition hover:brightness-105"
              >
                Continue
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
