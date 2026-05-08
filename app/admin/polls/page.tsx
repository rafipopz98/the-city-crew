"use client";

import { usePolls } from "@/app/hooks/usePolls";
import CreatePollModal from "@/components/Admin/Polls/CreatePollModal";
import PollCard from "@/components/Admin/Polls/PollCard";
import { useState } from "react";

const AdminPollsPage = () => {
  const [open, setOpen] = useState(false);

  const { polls, loading, refreshPolls } = usePolls();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#06182e]">Polls</h1>

          <p className="text-sm text-[#06182e]/50 mt-1">
            Create and manage community polls
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-[#06182e] text-[#ece1cf] px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition"
        >
          + Create Poll
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <p>Loading polls...</p>
        ) : polls.length > 0 ? (
          polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={{
                id: poll._id,
                title: poll.title,
                badge: poll.badge_text,
                total_votes: poll.total_votes,
                expires: poll.expires_at,
              }}
            />
          ))
        ) : (
          <p>No polls found.</p>
        )}
      </div>

      <CreatePollModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refreshPolls}
      />
    </div>
  );
};

export default AdminPollsPage;
