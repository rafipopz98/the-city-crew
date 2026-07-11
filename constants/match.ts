export const API_ENDPOINTS = {
  RESULTS: "/api/matches?latest=results&limit=3",
  FIXTURES: "/api/matches?latest=fixtures&limit=3",
} as const;

export const EMPTY_STATES = {
  NO_RESULTS: "No recent results",
  NO_FIXTURES: "No upcoming fixtures",
} as const;

export const MATCH_STATUS = {
  FINISHED: "FT",
  LIVE: "LIVE",
  UPCOMING: "UPCOMING",
} as const;

export const BUTTON_LABELS = {
  VIEW_MATCH: "VIEW MATCH",
  VIEW_DETAILS: "VIEW DETAILS",
} as const;
