"use client";

import { useCallback, useEffect, useState } from "react";

export type Poll = {
  _id: string;
  title: string;
  badge_text: string;
  total_votes: number;
  expires_at: string;
};

type PollResponse = {
  polls: Poll[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/polls/list?page=1&limit=10", {
        credentials: "include",
      });

      const data: PollResponse = await res.json();

      setPolls(data.polls || []);
    } catch (error) {
      console.error("Failed to fetch polls:", error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return {
    polls,
    loading,
    refreshPolls: fetchPolls,
  };
};
