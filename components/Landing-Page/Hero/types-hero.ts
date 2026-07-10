export interface BlogData {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
}

export interface Team {
  name: string;
  image: string;
}

export interface Match {
  _id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status: "upcoming" | "live" | "finished";
  matchDate: string;
  competition: string;
  matchday?: number;
  venue?: string;
}

export interface Player {
  _id: string;
  name: string;
  round_image?: string;
  goals?: number;
  assists?: number;
}

export interface BlogResponse {
  data: BlogData;
}

export interface LandingResponse {
  latestMatch?: Match;
  topScorers?: Player[];
  topAssisters?: Player[];
}

export type MatchStatus = Match["status"];
export type PlayerStat = "goals" | "assists";
