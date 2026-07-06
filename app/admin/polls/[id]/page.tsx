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
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#06182e]">Poll Details</h1>

          <p className="mt-2 text-sm text-[#06182e]/55">
            Review poll performance and manage responses
          </p>
        </div>

        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg bg-[#06182e] px-5 py-2.5 text-sm font-semibold text-[#ece1cf] transition-opacity hover:opacity-90"
        >
          Edit Poll
        </button>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        {/* Back */}
        <Link
          href="/admin/polls"
          className="mb-6 inline-flex items-center text-sm font-medium text-[#06182e]/55 transition-colors hover:text-[#06182e]"
        >
          ← Back to Polls
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf]/35 p-8">
          {/* Poll Info */}
          <div className="border-b border-[#06182e]/10 pb-6">
            <span className="inline-flex rounded-full bg-[#e09225]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e09225]">
              {poll.badge_text}
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#06182e]">
              {poll.title}
            </h2>

            <p className="mt-3 text-sm text-[#06182e]/60">
              {poll.total_votes} total votes
            </p>
          </div>

          {/* Options */}
          <div className="mt-8 space-y-5">
            {poll.options.map((option) => {
              const percentage =
                totalVotes > 0
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0;

              return (
                <div
                  key={option._id}
                  className="rounded-xl border border-[#06182e]/8 bg-white/60 p-5 transition-all duration-200 hover:border-[#06182e]/15 hover:bg-white/80"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#06182e]">
                        {option.text}
                      </h3>

                      <p className="mt-1 text-sm text-[#06182e]/50">
                        {option.votes} vote{option.votes !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <span className="text-lg font-bold text-[#e09225]">
                      {percentage}%
                    </span>
                  </div>

                  <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-[#06182e]/8">
                    <div
                      className="h-full rounded-full bg-[#e09225] transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleOpenVoters(option)}
                    className="text-sm font-medium text-[#06182e]/60 transition-colors hover:text-[#e09225]"
                  >
                    View voters →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <VotersModal
        open={votersOpen}
        onClose={() => setVotersOpen(false)}
        option={selectedOption}
        pollId={poll._id}
      />

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
