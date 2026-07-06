"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type PollOption = {
  _id?: string;
  text: string;
  votes?: number;
  isNew?: boolean;
};

type Poll = {
  _id: string;
  title: string;
  badge_text: string;
  options: PollOption[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  poll: Poll;
  onSuccess?: () => void;
};

const EditPollModal = ({ open, onClose, poll, onSuccess }: Props) => {
  const [title, setTitle] = useState("");

  const [badge, setBadge] = useState("");

  const [loading, setLoading] = useState(false);

  const [options, setOptions] = useState<PollOption[]>([]);

  useEffect(() => {
    if (!poll) {
      return;
    }

    setTitle(poll.title || "");

    setBadge(poll.badge_text || "");

    setOptions(
      (poll.options || []).map((option) => ({
        ...option,
        isNew: false,
      })),
    );
  }, [poll]);

  if (!open) {
    return null;
  }

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        text: "",
        votes: 0,
        isNew: true,
      },
    ]);
  };

  const updateOption = (value: string, index: number) => {
    setOptions((prev) => {
      const copy = [...prev];

      copy[index].text = value;

      return copy;
    });
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const cleanedOptions = options.filter(
        (option) => option.text.trim() !== "",
      );

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

      const res = await fetch(`/api/polls/${poll._id}/edit`, {
        method: "PUT",
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
        throw new Error(data.message || "Update failed");
      }

      onClose();

      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.error("Update failed", {
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
            <h2 className="text-xl font-bold text-[#06182e]">Edit Poll</h2>
            <p className="mt-1 text-sm text-[#06182e]/55">
              Update your poll question and options.
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
              className="w-full rounded-xl border border-[#06182e]/10 bg-white/70 px-4 py-3 text-sm text-[#06182e] outline-none transition focus:border-[#e09225]"
              placeholder="e.g. Community Poll"
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
              className="w-full rounded-xl border border-[#06182e]/10 bg-white/70 px-4 py-3 text-sm text-[#06182e] outline-none transition focus:border-[#e09225]"
              placeholder="Enter your poll question"
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
              {options.map((option, index) => (
                <div
                  key={option._id || index}
                  className="flex items-center gap-3 rounded-xl border border-[#06182e]/10 bg-white/60 p-3"
                >
                  <input
                    value={option.text}
                    onChange={(e) => updateOption(e.target.value, index)}
                    className="flex-1 bg-transparent text-sm text-[#06182e] outline-none"
                    placeholder={`Option ${index + 1}`}
                  />

                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
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
            onClick={handleUpdate}
            disabled={loading}
            className="rounded-lg bg-[#06182e] px-5 py-2.5 text-sm font-semibold text-[#ece1cf] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPollModal;
