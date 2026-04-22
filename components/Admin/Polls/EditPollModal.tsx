"use client";

import { useState } from "react";

const EditPollModal = ({ open, onClose, poll }: any) => {
  const [title, setTitle] = useState(poll.title);
  const [badge, setBadge] = useState(poll.badge || "");

  const [options, setOptions] = useState(
    poll.options.map((o: any) => ({ ...o, isNew: false })),
  );

  if (!open) return null;

  const addOption = () => {
    setOptions([
      ...options,
      { id: Date.now().toString(), text: "", isNew: true },
    ]);
  };

  const updateOption = (val: string, index: number) => {
    const copy = [...options];
    copy[index].text = val;
    setOptions(copy);
  };

  const removeOption = (index: number) => {
    const copy = [...options];
    copy.splice(index, 1);
    setOptions(copy);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-hidden">
      {/* Center Wrapper */}
      <div className="h-full w-full flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white w-full max-w-2xl rounded-xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-[#06182e]/10 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-bold text-[#06182e]">Edit Poll</h2>
            <button onClick={onClose}>✕</button>
          </div>

          {/* Body (SCROLL FIXED HERE) */}
          <div
            className="p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-6 overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Badge */}
            <div>
              <label className="text-xs font-semibold text-[#06182e]/50 uppercase">
                Badge
              </label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="mt-1 w-full border border-[#06182e]/10 rounded-md px-3 py-2 text-sm outline-none focus:border-[#e09225]"
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
                className="mt-1 w-full border border-[#06182e]/10 rounded-md px-3 py-2 text-sm outline-none focus:border-[#e09225]"
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
                {options.map((opt: any, i: number) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(e.target.value, i)}
                      className="flex-1 border border-[#06182e]/10 rounded-md px-3 py-2 text-sm outline-none focus:border-[#e09225]"
                      placeholder={`Option ${i + 1}`}
                    />

                    {opt.isNew && (
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
          <div className="p-5 border-t border-[#06182e]/10 flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="text-sm text-[#06182e]/50">
              Cancel
            </button>

            <button className="bg-[#06182e] text-[#ece1cf] px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPollModal;
