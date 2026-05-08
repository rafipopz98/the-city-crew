"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import VotersModal from "@/components/Admin/Polls/VotersModal";
import EditPollModal from "@/components/Admin/Polls/EditPollModal";

type PollOption = {
  _id: string;
  text: string;
  votes: number;
};

type Poll = {
  _id: string;
  title: string;
  badge_text: string;
  total_votes: number;
  options: PollOption[];
};

const PollDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [poll, setPoll] = useState<Poll | null>(null);

  const [loading, setLoading] = useState(true);

  const [votersOpen, setVotersOpen] = useState(false);

  const [selectedOption, setSelectedOption] = useState<PollOption | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  const fetchPoll = async () => {
    try {
      setLoading(true);

      const { id } = await params;

      const res = await fetch(`/api/polls/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      setPoll(data.poll || null);
    } catch (error) {
      console.error("Failed to fetch poll:", error);

      setPoll(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, []);

  const handleOpenVoters = (option: PollOption) => {
    setSelectedOption(option);

    setVotersOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-[#06182e]/50">Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="p-6">
        <p className="text-[#06182e]/50">Poll not found</p>
      </div>
    );
  }

  const totalVotes = poll.options.reduce(
    (acc, option) => acc + option.votes,
    0,
  );

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

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/admin/polls"
            className="text-sm text-[#06182e]/50 hover:text-[#06182e]"
          >
            ← Back to polls
          </Link>
        </div>

        {/* Poll Card */}
        <div className="w-full bg-white/70 rounded-xl p-6">
          {/* Poll Info */}
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-wider text-[#e09225] font-bold">
              {poll.badge_text}
            </span>

            <h2 className="text-2xl font-bold text-[#06182e] mt-2">
              {poll.title}
            </h2>

            <p className="text-sm text-[#06182e]/50 mt-2">
              {poll.total_votes} total votes
            </p>
          </div>

          {/* Poll Options */}
          <div className="flex flex-col gap-4">
            {poll.options.map((option) => {
              const percentage =
                totalVotes > 0
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0;

              return (
                <div
                  key={option._id}
                  className="rounded-lg p-4 hover:bg-white/80 transition"
                >
                  {/* Top */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#06182e]">
                      {option.text}
                    </span>

                    <span className="text-sm font-bold text-[#e09225]">
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="w-full h-2 bg-[#06182e]/5 rounded mb-3 overflow-hidden">
                    <div
                      className="h-full bg-[#e09225] rounded transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  {/* View voters */}
                  <button
                    onClick={() => handleOpenVoters(option)}
                    className="text-xs text-[#06182e]/40 hover:text-[#e09225] transition"
                  >
                    View voters →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voters Modal */}
      <VotersModal
        open={votersOpen}
        onClose={() => setVotersOpen(false)}
        option={selectedOption}
        pollId={poll._id}
      />

      {/* Edit Modal */}
      <EditPollModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        poll={poll}
        onSuccess={fetchPoll}
      />
    </div>
  );
};

export default PollDetailsPage;
