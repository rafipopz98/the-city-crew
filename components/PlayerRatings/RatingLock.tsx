"use client";

import Link from "next/link";
import { Lock, Calendar, User } from "lucide-react";
import Image from "next/image";

type Props = {
  isLoggedIn: boolean;
  isFinished: boolean;
  match: any;
  matchId: string;
};

export default function RatingLock({
  isLoggedIn,
  isFinished,
  match,
  matchId,
}: Props) {
  const getMessage = () => {
    if (!isLoggedIn) {
      return {
        icon: User,
        title: "Login Required",
        description: "Sign in to rate players' performances",
        action: (
          <Link
            href={`/login?redirect=/match-hub/${matchId}/ratings`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#e09225] text-white font-bold rounded-full hover:bg-[#e09225]/90 transition"
          >
            Login Now
          </Link>
        ),
      };
    }

    if (!isFinished) {
      return {
        icon: Calendar,
        title: "Match Not Finished",
        description: "Come back after the match ends to rate players",
        action: (
          <Link
            href={`/match-hub/${matchId}`}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition"
          >
            Back to Match
          </Link>
        ),
      };
    }

    return null;
  };

  const info = getMessage();
  if (!info) return null;

  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-[#06182e] relative overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0 blur-sm opacity-30">
        <div className="w-full h-full bg-linear-to-b from-[#06182e] to-[#0a2a4a]" />
        {match?.homeTeam?.image && (
          <Image
            src={match?.homeTeam.image}
            alt="Background"
            fill
            className="object-cover opacity-10"
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
            <Icon size={32} className="text-white" />
          </div>

          <h2 className="text-3xl font-black text-white uppercase mb-2">
            {info.title}
          </h2>

          <p className="text-white/60 text-sm mb-8">{info.description}</p>

          {info.action}

          <div className="mt-6 text-white/30 text-xs">
            <p>
              {match?.homeTeam?.name} vs {match?.awayTeam?.name}
            </p>
            <p className="mt-1">
              {new Date(match?.matchDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
