"use client";

import { useEffect, useState } from "react";
import PollCard from "./PollCard";

export type PollOption = {
  _id: string;
  text: string;
  votes: number;
};

export type Poll = {
  _id: string;
  title: string;
  badge_text: string;
  total_votes: number;
  expires_at: string;

  has_voted: boolean;
  selected_option_id: string | null;

  options: PollOption[];
};

const Polls = () => {
  const [tab, setTab] = useState("active");

  const [polls, setPolls] = useState<Poll[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/polls/public?status=${tab}`, {
        credentials: "include",
      });

      const data = await res.json();

      setPolls(data.polls || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [tab]);

  const totalVotes = polls.reduce((acc, poll) => acc + poll.total_votes, 0);

  return (
    <div className="w-full min-h-screen bg-[#FFF5E5] px-6 md:px-12 lg:px-16 pt-28 pb-20 font-[Barlow]">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 pb-6 border-b border-[#06182e]/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#e09225] mb-2">
            <span className="nav w-1.5 h-1.5 rounded-full bg-[#e09225] animate-pulse" />
            Fan Polls · 2024/25
          </div>

          <h1 className="nav text-[clamp(48px,8vw,80px)] font-black leading-[0.85] uppercase text-[#06182e]">
            City <span className="text-[#e09225]">Votes</span>
          </h1>

          <p className="para text-sm text-[#06182e]/50 mt-2">
            Real opinions from the sky blue faithful
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#06182e]/5 rounded-md p-1">
          {["active", "closed"].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`
                px-5 py-1.5 text-xs para font-bold uppercase tracking-wider rounded
                transition-all duration-200
                ${
                  tab === item
                    ? "bg-[#06182e] text-[#FFF5E5]"
                    : "text-[#06182e]/50 hover:text-[#06182e]"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-10 mb-8 nav">
        <Stat label={`${tab} polls`} value={polls.length} />

        <Stat
          label="Total votes cast"
          value={
            totalVotes >= 1000
              ? `${(totalVotes / 1000).toFixed(1)}k`
              : totalVotes
          }
        />
      </div>

      {/* Poll Cards */}
      {loading ? (
        <p className="text-[#06182e]/50">Loading polls...</p>
      ) : polls.length === 0 ? (
        <p className="text-[#06182e]/50">No polls found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {polls.map((poll) => (
            <PollCard key={poll._id} poll={poll} onVoteSuccess={fetchPolls} />
          ))}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div className="para text-2xl font-extrabold text-[#06182e] leading-none">
      {value}
    </div>

    <div className="para text-[11px] text-[#06182e]/40 mt-1 tracking-wide">
      {label}
    </div>
  </div>
);

export default Polls;
