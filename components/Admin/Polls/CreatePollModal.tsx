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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-[#06182e]/10 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#06182e]">Create Poll</h2>

            <button onClick={onClose}>✕</button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
            {/* Badge */}
            <div>
              <label className="text-xs font-semibold text-[#06182e]/50 uppercase">
                Badge
              </label>

              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Trending"
                className="mt-1 w-full border border-[#06182e]/10 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-[#06182e]/50 uppercase">
                Question
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter poll question"
                className="mt-1 w-full border border-[#06182e]/10 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#06182e]/50 uppercase">
                  Options
                </label>

                <button
                  onClick={addOption}
                  className="text-xs text-[#e09225] font-semibold"
                >
                  + Add option
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex gap-2">
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(e.target.value, i)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-[#06182e]/10 rounded-md px-3 py-2 text-sm"
                    />

                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        className="text-xs text-red-500"
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
          <div className="p-5 border-t border-[#06182e]/10 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="text-sm text-[#06182e]/50"
            >
              Cancel
            </button>

            <button
              onClick={handleCreatePoll}
              disabled={loading}
              className="bg-[#06182e] text-[#ece1cf] px-5 py-2 rounded-md text-sm font-semibold"
            >
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
