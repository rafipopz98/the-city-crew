export interface Team {
  name: string;
  image: string;
}

export interface GoalScorer {
  _id?: string;
  playerName: string;
  minute: number;
  team: "home" | "away";
  isPenalty?: boolean;
  isOwnGoal?: boolean;
}

export interface Match {
  _id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status: "finished" | "live" | "upcoming";
  matchDate: string;
  competition: string;
  matchday?: number;
  venue?: string;
  goalScorers?: GoalScorer[];
}

export interface MatchesResponse {
  matches: Match[];
}

export type RowType = "results" | "fixtures" | null;
