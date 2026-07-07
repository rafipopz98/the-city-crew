"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

type CreateSeasonModalProps = {
  open: boolean;
  onClose: () => void;
  onSeasonCreated: () => void;
};

const CreateSeasonModal = ({
  open,
  onClose,
  onSeasonCreated,
}: CreateSeasonModalProps) => {
  const [seasonYear, setSeasonYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate upcoming years for quick selection
  const currentYear = new Date().getFullYear();
  const upcomingSeasons = [
    `${currentYear}/${(currentYear + 1).toString().slice(-2)}`,
    `${currentYear + 1}/${(currentYear + 2).toString().slice(-2)}`,
    `${currentYear + 2}/${(currentYear + 3).toString().slice(-2)}`,
    `${currentYear + 3}/${(currentYear + 4).toString().slice(-2)}`,
  ];

  const handleCreateSeason = async (year?: string) => {
    const seasonToCreate = year || seasonYear;

    if (!seasonToCreate) {
      setError("Please select or enter a season");
      return;
    }

    // Validate format (e.g., "2026/27" or "2026-27")
    const seasonRegex = /^\d{4}[\/\-]\d{2}$/;
    if (!seasonRegex.test(seasonToCreate)) {
      setError("Please use format: YYYY/YY (e.g., 2026/27)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year: seasonToCreate }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create season");
      }

      onSeasonCreated();
      setSeasonYear("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create season");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#ece1cf] w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="border-b border-black/10 px-6 py-4 flex items-center justify-between">
          <h2 className="para text-2xl uppercase text-black">Create Season</h2>
          <button
            onClick={onClose}
            className="p-2 text-black/40 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Select Seasons */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Quick Select Upcoming Season
            </label>
            <div className="grid grid-cols-2 gap-2">
              {upcomingSeasons.map((season) => (
                <button
                  key={season}
                  onClick={() => handleCreateSeason(season)}
                  disabled={loading}
                  className="
                    px-4 py-3
                    bg-white
                    border border-black/10
                    text-black text-sm font-medium
                    hover:border-[#6CABDD] hover:text-[#6CABDD]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                  "
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#ece1cf] px-2 text-black/40">OR</span>
            </div>
          </div>

          {/* Custom Season Input */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Custom Season
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={seasonYear}
                onChange={(e) => {
                  setSeasonYear(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateSeason();
                  }
                }}
                placeholder="e.g., 2026/27"
                className="
                  flex-1
                  px-4 py-3
                  bg-white
                  border border-black/10
                  text-black
                  placeholder:text-black/40
                  focus:outline-none focus:border-[#6CABDD]
                "
                disabled={loading}
              />
              <button
                onClick={() => handleCreateSeason()}
                disabled={loading || !seasonYear}
                className="
                  px-4 py-3
                  bg-[#6CABDD]
                  text-white
                  hover:bg-[#5a9bc7]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                  flex items-center gap-2
                "
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-[#6CABDD]/5 border border-[#6CABDD]/20">
            <p className="text-xs text-black/60 leading-relaxed">
              <span className="font-medium text-[#6CABDD]">Format:</span> Use
              YYYY/YY format (e.g., 2026/27) for the football season. Seasons
              are unique and cannot be duplicated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSeasonModal;
