import Link from "next/link";
import moment from "moment";
type Poll = {
  id: string;
  title: string;
  badge: string;
  total_votes: number;
  expires: string;
};

const PollCard = ({ poll }: { poll: Poll }) => {
  return (
    <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf]/35 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#06182e]/20 hover:shadow-lg">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="rounded-full bg-[#e09225]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e09225]">
          {poll.badge}
        </span>

        <span className="text-xs text-[#06182e]/45 whitespace-nowrap">
          {moment(poll.expires).format("MMM DD, YYYY")}
        </span>
      </div>

      <h2 className="mb-6 text-xl font-bold leading-snug text-[#06182e]">
        {poll.title}
      </h2>

      <div className="flex items-center justify-between border-t border-[#06182e]/10 pt-4">
        <span className="text-sm font-medium text-[#06182e]/60">
          {poll.total_votes} votes
        </span>

        <Link
          href={`/admin/polls/${poll.id}`}
          className="text-sm font-semibold text-[#06182e] transition-colors hover:text-[#e09225]"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default PollCard;
