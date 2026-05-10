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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-[#06182e]/10 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#06182e]">Edit Poll</h2>

            <button onClick={onClose}>✕</button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-6">
            {/* Badge */}
            <div>
              <label className="text-xs font-semibold text-[#06182e]/50 uppercase">
                Badge
              </label>

              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
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
                {options.map((option, index) => (
                  <div key={option._id || index} className="flex gap-2">
                    <input
                      value={option.text}
                      onChange={(e) => updateOption(e.target.value, index)}
                      className="flex-1 border border-[#06182e]/10 rounded-md px-3 py-2 text-sm"
                      placeholder={`Option ${index + 1}`}
                    />

                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
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
              onClick={handleUpdate}
              disabled={loading}
              className="bg-[#06182e] text-[#ece1cf] px-5 py-2 rounded-md text-sm font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPollModal;
