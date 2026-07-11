import { GoalScorer } from "@/components/Landing-Page/Matches/type-matches";

export const formatDate = (date: string): string => {
  if (!date) return "";
  return new Date(date)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
};

export const formatTime = (date: string): string => {
  if (!date) return "";
  const d = new Date(date);
  const day = d.toLocaleDateString("en-GB", { weekday: "long" });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} — ${time}`;
};

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
  return res.json();
};

export const groupGoalScorers = (
  scorers: GoalScorer[],
): Record<string, number[]> => {
  const grouped: Record<string, number[]> = {};
  scorers.forEach((s) => {
    if (!grouped[s.playerName]) grouped[s.playerName] = [];
    grouped[s.playerName].push(s.minute);
  });
  return grouped;
};
