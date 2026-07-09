"use client";

import { Goal } from "lucide-react";

type GoalScorer = {
  playerName: string;
  minute: number;
  team: "home" | "away";
  isPenalty: boolean;
  isOwnGoal: boolean;
};

type Props = {
  goalScorers: GoalScorer[];
  homeTeamName: string;
  awayTeamName: string;
};

const MatchScorers = ({ goalScorers, homeTeamName, awayTeamName }: Props) => {
  if (!goalScorers || goalScorers.length === 0) {
    return null;
  }

  const homeScorers = goalScorers.filter((g) => g.team === "home");
  const awayScorers = goalScorers.filter((g) => g.team === "away");

  const formatScorer = (scorer: GoalScorer) => {
    let text = `${scorer.playerName} ${scorer.minute}'`;
    if (scorer.isPenalty) text += " (P)";
    if (scorer.isOwnGoal) text += " (OG)";
    return text;
  };

  const renderScorers = (
    scorers: GoalScorer[],
    teamName: string,
    isHome: boolean,
  ) => {
    if (scorers.length === 0) return null;

    // Group by player name to combine minutes
    const grouped: Record<string, number[]> = {};
    const scorerDetails: Record<
      string,
      { isPenalty: boolean; isOwnGoal: boolean }
    > = {};

    scorers.forEach((s) => {
      if (!grouped[s.playerName]) {
        grouped[s.playerName] = [];
        scorerDetails[s.playerName] = {
          isPenalty: s.isPenalty || false,
          isOwnGoal: s.isOwnGoal || false,
        };
      }
      grouped[s.playerName].push(s.minute);
      if (s.isPenalty) scorerDetails[s.playerName].isPenalty = true;
      if (s.isOwnGoal) scorerDetails[s.playerName].isOwnGoal = true;
    });

    const formattedScorers = Object.entries(grouped).map(([name, minutes]) => {
      const minuteStr =
        minutes.length > 1 ? minutes.join("', ") + "'" : minutes[0] + "'";
      let text = `${name} ${minuteStr}`;
      if (scorerDetails[name].isPenalty) text += " (P)";
      if (scorerDetails[name].isOwnGoal) text += " (OG)";
      return text;
    });

    return (
      <div className="flex items-start gap-3">
        <Goal
          size={16}
          className={`shrink-0 mt-0.5 ${isHome ? "text-green-600" : "text-red-500"}`}
        />
        <div>
          <p className="text-sm font-medium text-black/60">{teamName}</p>
          <p className="text-base font-semibold text-black">
            {formattedScorers.join(", ")}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-20 border-y border-black/10 py-12">
      <h3 className="text-xs uppercase tracking-[0.35em] text-black/40 mb-6">
        Goal Scorers
      </h3>

      <div className="space-y-4">
        {renderScorers(homeScorers, homeTeamName, true)}
        {renderScorers(awayScorers, awayTeamName, false)}
      </div>
    </section>
  );
};

export default MatchScorers;
