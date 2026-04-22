"use client";
import CreatePollModal from "@/components/Admin/Polls/CreatePollModal";
import PollCard from "@/components/Admin/Polls/PollCard";
import { useState } from "react";

const dummyPolls = [
  {
    id: 1,
    title: "Question 101?",
    badge: "Trending",
    total_votes: 1240,
    expires: "2h left",
  },
  {
    id: 2,
    title: "Question 101.01?",
    badge: "Football",
    total_votes: 890,
    expires: "5h left",
  },
];

const AdminPollsPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold text-[#06182e]">Polls</h1>
          <p className="text-sm text-[#06182e]/50 mt-1">
            Create and manage community polls
          </p>
        </div>

        {/* Right */}
        <button
          onClick={() => setOpen(true)}
          className="bg-[#06182e] text-[#ece1cf] px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition"
        >
          + Create Poll
        </button>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {dummyPolls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
      <CreatePollModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default AdminPollsPage;
