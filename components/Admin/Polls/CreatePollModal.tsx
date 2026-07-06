"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type PollOption = {
  id: string;
  text: string;
};

const CreatePollModal = ({ open, onClose, onSuccess }: Props) => {
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("");

  const [loading, setLoading] = useState(false);

  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);

  if (!open) return null;

  const resetForm = () => {
    setTitle("");
    setBadge("");

    setOptions([
      { id: "1", text: "" },
      { id: "2", text: "" },
    ]);
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: "",
      },
    ]);
  };

  const updateOption = (val: string, index: number) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index].text = val;
      return copy;
    });
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePoll = async () => {
    try {
      const cleanedOptions = options
        .map((item) => item.text.trim())
        .filter(Boolean);

      if (!title.trim()) {
        return toast.warning("Question is required", {
          description: "Please enter a question.",
        });
      }

      if (!badge.trim()) {
        return toast.warning("Badge is required", {
          description: "Please enter a badge.",
        });
      }

      if (cleanedOptions.length < 2) {
        return toast.warning("At least 2 options required", {
          description: "Please add at least 2 options.",
        });
      }

      setLoading(true);

      const res = await fetch("/api/polls/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          badge,
          options: cleanedOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create poll");
      }

      resetForm();

      onClose();

      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.error("Failed to create poll", {
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#06182e]/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#06182e]">Create Poll</h2>

            <p className="mt-1 text-sm text-[#06182e]/55">
              Create a new community poll for your audience.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#06182e]/60 transition-colors hover:bg-[#06182e]/8 hover:text-[#06182e]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-3">
          {/* Badge */}
          <div>
            <label className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#06182e]/50">
              Badge
            </label>

            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Trending"
              className="w-full rounded-xl border border-[#06182e]/10 bg-white/70 px-4 py-3 text-sm text-[#06182e] outline-none transition focus:border-[#e09225]"
            />
          </div>

          {/* Question */}
          <div>
            <label className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#06182e]/50">
              Question
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your poll question"
              className="w-full rounded-xl border border-[#06182e]/10 bg-white/70 px-4 py-3 text-sm text-[#06182e] outline-none transition focus:border-[#e09225]"
            />
          </div>

          {/* Options */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#06182e]/50">
                Options
              </label>

              <button
                onClick={addOption}
                className="text-sm font-semibold text-[#e09225] transition hover:opacity-80"
              >
                + Add Option
              </button>
            </div>

            <div className="space-y-3">
              {options.map((opt, i) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 rounded-xl border border-[#06182e]/10 bg-white/60 p-3 transition-colors hover:bg-white/80"
                >
                  <input
                    value={opt.text}
                    onChange={(e) => updateOption(e.target.value, i)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-transparent text-sm text-[#06182e] outline-none placeholder:text-[#06182e]/30"
                  />

                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="text-sm font-medium text-red-500 transition hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#06182e]/10 px-6 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#06182e]/60 transition hover:bg-[#06182e]/6 hover:text-[#06182e]"
          >
            Cancel
          </button>

          <button
            onClick={handleCreatePoll}
            disabled={loading}
            className="rounded-lg bg-[#06182e] px-5 py-2.5 text-sm font-semibold text-[#ece1cf] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
