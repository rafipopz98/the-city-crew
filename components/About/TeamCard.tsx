"use client";

type Member = {
  name: string;
  role: string;
};

type Props = {
  member: Member;
  onClick: () => void;
};

const TeamCard = ({ member, onClick }: Props) => {
  return (
    <div onClick={onClick} className="cursor-pointer group">
      <div className="bg-white border border-[#06182e]/10 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
        {/* Image */}
        <div className="aspect-square bg-[#06182e]/5">
          <img
            src={`https://i.pravatar.cc/300?u=${member.name}`}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          />
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="para font-bold text-[#06182e] text-sm">
            {member.name}
          </div>
          <div className="para text-[11px] text-[#06182e]/40">
            {member.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
