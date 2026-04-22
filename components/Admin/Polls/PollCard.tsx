import Link from "next/link";

type Poll = {
  id: number;
  title: string;
  badge: string;
  total_votes: number;
  expires: string;
};

const PollCard = ({ poll }: { poll: Poll }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#06182e]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[#e09225] font-bold">
          {poll.badge}
        </span>
        <span className="text-xs text-[#06182e]/40">{poll.expires}</span>
      </div>

      <h2 className="text-lg font-bold text-[#06182e] mb-4 leading-snug">
        {poll.title}
      </h2>

      <div className="flex items-center justify-between">
        <span className="text-sm text-[#06182e]/50">
          {poll.total_votes} votes
        </span>

        <button className="text-sm font-semibold text-[#06182e] hover:text-[#e09225] transition">
          <Link href={`/admin/polls/${poll.id}`}>View Details →</Link>
        </button>
      </div>
    </div>
  );
};

export default PollCard;
