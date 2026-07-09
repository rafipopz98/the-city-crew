"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useAuth } from "@/context/AuthContext";
import RatingLock from "@/components/PlayerRatings/RatingLock";
import MobileRating from "@/components/PlayerRatings/MobileRating";
import DesktopRating from "@/components/PlayerRatings/DesktopRating";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = {
  matchId: string;
  initialMatch: any;
  isFinished: boolean;
  isLoggedIn: boolean;
};

export default function RatingsClient({
  matchId,
  initialMatch,
  isFinished,
  isLoggedIn: initialIsLoggedIn,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();

  // Check session on client side
  useEffect(() => {
    const checkSession = async () => {
      setIsLoggedIn(!!user);
    };
    checkSession();
  }, []);

  // Fetch players with ratings
  const { data, error, isLoading, mutate } = useSWR(
    isLoggedIn && isFinished ? `/api/player-ratings/${matchId}` : null,
    fetcher,
    {
      fallbackData: {
        players: [],
        match: initialMatch,
        isFinished,
        isLoggedIn,
      },
    },
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

      // Refresh data
      mutate();
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  // If not finished or not logged in, show lock overlay
  if (!isFinished || !isLoggedIn) {
    return (
      <RatingLock
        isLoggedIn={isLoggedIn}
        isFinished={isFinished}
        match={initialMatch}
        matchId={matchId}
      />
    );
  }

  const players = data?.players || [];
  const match = data?.match || initialMatch;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5E5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e09225]"></div>
      </div>
    );
  }

  // Render mobile or desktop
  return (
    <>
      {isMobile ? (
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
      )}
    </>
  );
}
