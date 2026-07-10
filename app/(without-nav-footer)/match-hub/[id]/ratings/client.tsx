"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useAuth } from "@/context/AuthContext";
import RatingLock from "@/components/PlayerRatings/RatingLock";
import MobileRating from "@/components/PlayerRatings/MobileRating";
import DesktopRating from "@/components/PlayerRatings/DesktopRating";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = {
  matchId: string;
  isFinished: boolean;
  isLoggedIn: boolean;
};

export default function RatingsClient({
  matchId,
  isFinished,
  isLoggedIn: initialIsLoggedIn,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { user } = useAuth();

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const { data, isLoading, mutate } = useSWR(
    isLoggedIn && isFinished ? `/api/player-ratings/${matchId}` : null,
    fetcher,
  );

  const handleRatingSubmit = async (playerId: string, rating: number) => {
    try {
      const response = await fetch("/api/player-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          playerId,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save rating");
      }

      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isFinished || !isLoggedIn) {
    return (
      <RatingLock
        isLoggedIn={isLoggedIn}
        isFinished={isFinished}
        match={null}
        matchId={matchId}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF5E5]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#e09225]" />
      </div>
    );
  }

  const players = data.players ?? [];
  const match = data.match;

  if (!match) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF5E5]">
        <p className="text-black/50">Unable to load match.</p>
      </div>
    );
  }

  return isMobile ? (
    <MobileRating
      players={players}
      match={match}
      onRatingSubmit={handleRatingSubmit}
    />
  ) : (
    <DesktopRating
      players={players}
      match={match}
      onRatingSubmit={handleRatingSubmit}
    />
  );
}
