"use client";

import { useEffect, useState } from "react";

type Voter = {
  user: {
    first_name: string;
    last_name?: string;
    email: string;
  };
  voted_at: string;
};

type Option = {
  _id: string;
  text: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  option: Option | null;
  pollId: string;
};

const VotersModal = ({ open, onClose, option, pollId }: Props) => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !option?._id) {
      return;
    }

    const fetchVoters = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/polls/${pollId}/voters?option_id=${option._id}`,
          {
            credentials: "include",
          },
        );

        const data = await res.json();

        setVoters(data.voters || []);
      } catch (error) {
        console.error("Failed to fetch voters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, [open, option, pollId]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#06182e]/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#06182e]">{option?.text}</h2>

            <p className="mt-1 text-sm text-[#06182e]/55">
              People who voted for this option
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
        <div className="max-h-125 space-y-3 overflow-y-auto p-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#06182e]/55">
              Loading voters...
            </div>
          ) : voters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#06182e]/15 bg-white/50 py-12 text-center">
              <p className="font-medium text-[#06182e]">No voters yet</p>
              <p className="mt-1 text-sm text-[#06182e]/55">
                Votes will appear here once people participate.
              </p>
            </div>
          ) : (
            voters.map((voter, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#06182e]/10 bg-white/60 p-4 transition-colors hover:bg-white/80"
              >
                <div className="font-semibold text-[#06182e]">
                  {voter.user?.first_name} {voter.user?.last_name || ""}
                </div>

                <div className="mt-1 text-sm text-[#06182e]/55">
                  {voter.user?.email}
                </div>

                <div className="mt-2 text-xs text-[#06182e]/40">
                  Voted on {new Date(voter.voted_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VotersModal;
