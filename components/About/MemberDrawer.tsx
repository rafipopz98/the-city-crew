"use client";

import { useEffect } from "react";

type Member = {
  name: string;
  role: string;
};

type Props = {
  member: Member | null;
  onClose: () => void;
};

const MemberDrawer = ({ member, onClose }: Props) => {
  useEffect(() => {
    if (member) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [member]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300
          ${member ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-105 bg-[#FFF5E5] z-50
          shadow-2xl transition-transform duration-300
          ${member ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {member && (
          <div className="p-6 flex flex-col h-full">
            {/* Close */}
            <button
              onClick={onClose}
              className="text-[#06182e]/40 text-sm mb-6"
            >
              Close
            </button>

            {/* Image */}
            <div className="w-full aspect-square rounded-lg overflow-hidden mb-6">
              <img
                src={`https://i.pravatar.cc/400?u=${member.name}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* BIG NAME */}
            <h2 className="nav text-[32px] font-black uppercase text-[#06182e] leading-tight">
              {member.name}
            </h2>

            <div className="para text-[#e09225] text-xs uppercase tracking-wider mb-6">
              {member.role}
            </div>

            {/* DETAILS */}
            <div className="flex flex-col gap-5 text-sm text-[#06182e]/70">
              <p>
                Lifelong Manchester City supporter. Loves tactical football and
                late winners.
              </p>

              <div>
                <div className="font-bold text-[#06182e] text-xs uppercase mb-1">
                  Favourite Game
                </div>
                <div>City 3-2 QPR (Agueroooo)</div>
              </div>

              <div>
                <div className="font-bold text-[#06182e] text-xs uppercase mb-1">
                  Best Moment
                </div>
                <div>Treble-winning season</div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-6 border-t border-[#06182e]/10">
              <button className="w-full bg-[#06182e] text-[#FFF5E5] py-3 text-xs uppercase font-bold tracking-wider rounded hover:opacity-90">
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemberDrawer;
