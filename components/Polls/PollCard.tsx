"use client";

import { useState } from "react";

type Option = {
  text: string;
  votes: number;
};

type Poll = {
  id: number;
  badge: string;
  question: string;
  options: Option[];
  totalVotes: number;
  endsIn: string;
  tag: string;
};

type Props = {
  poll: Poll;
};

const PollCard = ({ poll }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);

  const total = poll.options.reduce((a, o) => a + o.votes, 0);

  const getPct = (votes: number) =>
    total === 0 ? 0 : Math.round((votes / total) * 100);

  const handleVote = () => {
    if (selected === null || voted) return;
    setVoted(true);
  };

  const fmtVotes = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

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
        {poll.badge}
      </div>

      {/* Question */}
      <div className="para text-[17px] font-bold leading-tight uppercase text-[#06182e] mb-4">
        {poll.question}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {poll.options.map((opt, i) => {
          const pct = getPct(opt.votes);
          const isSelected = selected === i;

          return (
            <button
              key={i}
              onClick={() => !voted && setSelected(i)}
              disabled={voted}
              className={`
                group relative overflow-hidden rounded-md px-3 py-2 flex items-center justify-between gap-2
                border transition-all duration-200
                ${
                  isSelected
                    ? "border-[#06182e]"
                    : "border-[#06182e]/15 hover:border-[#06182e]/40"
                }
                ${voted ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {/* Fill bar */}
              {voted && (
                <div
                  className={`
                    absolute inset-0 rounded-md transition-all duration-700
                    ${
                      i === 0
                        ? "bg-[#06182e]/10"
                        : i === 1
                          ? "bg-[#e09225]/15"
                          : "bg-[#06182e]/5"
                    }
                  `}
                  style={{ width: `${pct}%` }}
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
                {opt.text}
              </span>

              {/* % */}
              {voted && (
                <span
                  className={`
                    para text-[15px] font-bold min-w-8.5 text-right relative z-10
                    ${i === 0 ? "text-[#06182e]" : "text-[#e09225]"}
                  `}
                >
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
          {fmtVotes(poll.totalVotes)} votes · Ends: {poll.endsIn}
        </span>

        {voted ? (
          <span className="para text-xs font-bold tracking-wider uppercase text-[#e09225]">
            Voted ✓
          </span>
        ) : (
          <button
            onClick={handleVote}
            disabled={selected === null}
            className={`
              para text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded border transition-all
              ${
                selected !== null
                  ? "bg-[#06182e] text-[#FFF5E5] border-[#06182e] hover:opacity-90"
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
