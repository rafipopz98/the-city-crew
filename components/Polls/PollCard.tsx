"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Option = {
  _id: string;
  text: string;
  votes: number;
};

type Poll = {
  _id: string;
  badge_text: string;
  title: string;
  options: Option[];
  total_votes: number;
  expires_at: string;

  has_voted: boolean;
  selected_option_id: string | null;
};

type Props = {
  poll: Poll;
  onVoteSuccess?: () => void;
};

const PollCard = ({ poll, onVoteSuccess }: Props) => {
  const router = useRouter();

  const pathname = usePathname();

  const initialSelected = poll.options.findIndex(
    (option) => option._id === poll.selected_option_id,
  );

  const [selected, setSelected] = useState<number | null>(
    initialSelected >= 0 ? initialSelected : null,
  );

  const [voted, setVoted] = useState(poll.has_voted);

  const total = poll.options.reduce((acc, option) => acc + option.votes, 0);

  const getPct = (votes: number) =>
    total === 0 ? 0 : Math.round((votes / total) * 100);

  const handleVote = async () => {
    if (selected === null || voted) {
      return;
    }

    try {
      const option = poll.options[selected];

      const res = await fetch("/api/polls/vote", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poll_id: poll._id,
          option_id: option._id,
        }),
      });

      const data = await res.json();

      // Not logged in
      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);

        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Vote failed");
      }

      setVoted(true);

      onVoteSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Vote failed");
    }
  };

  const fmtVotes = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  const expiresAt = new Date(poll.expires_at);

  const isClosed = expiresAt < new Date();

  return (
    <div className="para bg-white border border-[#06182e]/10 rounded-lg p-5 flex flex-col transition-all duration-200 hover:shadow-md">
      {/* Top Accent */}
      <div
        className={`h-0.75 w-full mb-4 rounded ${
          voted ? "bg-[#e09225]" : "bg-transparent"
        }`}
      />

      {/* Badge */}
      <div className="inline-flex self-start text-[10px] font-bold tracking-[0.12em] uppercase text-[#e09225] bg-[#e09225]/10 border border-[#e09225]/30 rounded px-2 py-1 mb-3">
        {poll.badge_text}
      </div>

      {/* Question */}
      <div className="para text-[17px] font-bold leading-tight uppercase text-[#06182e] mb-4">
        {poll.title}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {poll.options.map((option, index) => {
          const pct = getPct(option.votes);

          const isSelected = selected === index;

          return (
            <button
              key={option._id}
              onClick={() => !voted && !isClosed && setSelected(index)}
              disabled={voted || isClosed}
              className={`
                  group relative overflow-hidden rounded-md px-3 py-2 flex items-center justify-between gap-2
                  border transition-all duration-200
                  ${
                    isSelected
                      ? "border-[#06182e]"
                      : "border-[#06182e]/15 hover:border-[#06182e]/40"
                  }
                `}
            >
              {/* Fill bar */}
              {(voted || isClosed) && (
                <div
                  className="absolute inset-0 bg-[#e09225]/10 rounded-md transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                  }}
                />
              )}

              {/* Radio */}
              <div
                className={`
                    w-3.5 h-3.5 rounded-full shrink-0 relative z-10 transition-all
                    ${
                      isSelected
                        ? "border-4 border-[#06182e]"
                        : "border border-[#06182e]/30"
                    }
                  `}
              />

              {/* Text */}
              <span
                className={`
                    flex-1 text-[13px] relative z-10
                    ${
                      isSelected
                        ? "font-semibold text-[#06182e]"
                        : "text-[#06182e]"
                    }
                  `}
              >
                {option.text}
              </span>

              {/* % */}
              {(voted || isClosed) && (
                <span className="para text-[15px] font-bold min-w-8.5 text-right relative z-10 text-[#e09225]">
                  {pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#06182e]/10">
        <span className="text-[11px] text-[#06182e]/40">
          {fmtVotes(poll.total_votes)} votes
        </span>

        {voted ? (
          <span className="para text-xs font-bold tracking-wider uppercase text-[#e09225]">
            Voted ✓
          </span>
        ) : isClosed ? (
          <span className="para text-xs font-bold tracking-wider uppercase text-red-500">
            Closed
          </span>
        ) : (
          <button
            onClick={handleVote}
            disabled={selected === null}
            className={`
              para text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded border transition-all
              ${
                selected !== null
                  ? "bg-[#06182e] text-[#FFF5E5] border-[#06182e]"
                  : "text-[#06182e]/30 border-[#06182e]/20 cursor-not-allowed"
              }
            `}
          >
            Vote
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard;
