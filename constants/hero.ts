import { MatchStatus } from "@/components/Landing-Page/Hero/types-hero";

export const STATUS_STYLES: Record<MatchStatus, string> = {
  finished: "bg-green-500/20 text-green-400",
  live: "bg-red-500/20 text-red-400 animate-pulse",
  upcoming: "bg-blue-500/20 text-blue-400",
};

export const STATUS_LABELS: Record<MatchStatus, string> = {
  finished: "FT",
  live: "LIVE",
  upcoming: "UPCOMING",
};

export const API_ENDPOINTS = {
  BLOGS_HOME: "/api/blogs/home",
  LANDING: "/api/landing",
} as const;

export const EMPTY_STATE_MESSAGES = {
  NO_GOALS: "No goals yet this season",
  NO_ASSISTS: "No assists yet this season",
} as const;
