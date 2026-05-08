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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-[#06182e]">{option?.text} voters</h2>

          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="max-h-100 overflow-y-auto flex flex-col gap-3">
          {loading ? (
            <p className="text-sm text-[#06182e]/50">Loading voters...</p>
          ) : voters.length === 0 ? (
            <p className="text-sm text-[#06182e]/50">No voters yet</p>
          ) : (
            voters.map((voter, index) => (
              <div
                key={index}
                className="border border-[#06182e]/10 rounded-md p-3 text-sm"
              >
                <div className="font-semibold text-[#06182e]">
                  {voter.user?.first_name} {voter.user?.last_name || ""}
                </div>

                <div className="text-[#06182e]/50 text-xs">
                  {voter.user?.email}
                </div>

                <div className="text-[#06182e]/40 text-[10px] mt-1">
                  {new Date(voter.voted_at).toLocaleString()}
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
