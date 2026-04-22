"use client";

import { useState } from "react";
import Link from "next/link";
import VotersModal from "@/components/Admin/Polls/VotersModal";
import EditPollModal from "@/components/Admin/Polls/EditPollModal";

const dummyPoll = {
  badge: "Trending",
  title: "Some Question 101?",
  total_votes: 1240,
  options: [
    { id: "1", text: "01.01", votes: 800 },
    { id: "2", text: "02.02", votes: 440 },
  ],
};

const PollDetailsPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  const total = dummyPoll.options.reduce((a, o) => a + o.votes, 0);

  const handleOpen = (opt: any) => {
    setSelectedOption(opt);
    setOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#06182e]">Polls</h1>
          <p className="text-sm text-[#06182e]/50 mt-1">
            Create and manage community polls
          </p>
        </div>

        <button
          onClick={() => setEditOpen(true)}
          className="bg-[#06182e] text-[#ece1cf] px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition"
        >
          Edit Poll
        </button>
      </div>

      {/* Centered Container */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Back + Edit */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/polls"
            className="text-sm text-[#06182e]/50 hover:text-[#06182e]"
          >
            ← Back to polls
          </Link>
        </div>

        {/* Content */}

        {/* Content */}
        <div className="w-full max-w-4xl bg-white/70 rounded-xl p-6">
          {/* Poll Header */}
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-wider text-[#e09225] font-bold">
              {dummyPoll.badge}
            </span>

            <h2 className="text-2xl font-bold text-[#06182e] mt-2 leading-tight">
              {dummyPoll.title}
            </h2>

            <p className="text-sm text-[#06182e]/50 mt-2">
              {dummyPoll.total_votes} total votes
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-4">
            {dummyPoll.options.map((opt) => {
              const pct = Math.round((opt.votes / total) * 100);

              return (
                <div
                  key={opt.id}
                  className="rounded-lg p-4 hover:bg-white/80 transition"
                >
                  {/* Top */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#06182e]">
                      {opt.text}
                    </span>
                    <span className="text-sm font-bold text-[#e09225]">
                      {pct}%
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="w-full h-2 bg-[#06182e]/5 rounded mb-3 overflow-hidden">
                    <div
                      className="h-full bg-[#e09225] rounded transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Voters */}
                  <button
                    onClick={() => handleOpen(opt)}
                    className="text-xs text-[#06182e]/40 hover:text-[#e09225] transition"
                  >
                    View voters →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Modal */}
          <VotersModal
            open={open}
            onClose={() => setOpen(false)}
            option={selectedOption}
          />
          <EditPollModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            poll={dummyPoll}
          />
        </div>
      </div>
    </div>
  );
};

export default PollDetailsPage;
