import { Goal } from "lucide-react";
import { GoalScorer } from "./type-matches";
import { groupGoalScorers } from "@/lib/match";

interface GoalScorersProps {
  goalScorers: GoalScorer[];
}

const formatScorersList = (scorers: GoalScorer[]): string | null => {
  const grouped = groupGoalScorers(scorers);

  return Object.entries(grouped)
    .map(([name, minutes]) => {
      const minuteStr =
        minutes.length > 1 ? minutes.join("', ") + "'" : minutes[0] + "'";
      const playerScorers = scorers.filter((s) => s.playerName === name);
      const penalty = playerScorers.some((s) => s.isPenalty);
      const og = playerScorers.some((s) => s.isOwnGoal);

      let text = `${name} ${minuteStr}`;
      if (penalty) text += " (P)";
      if (og) text += " (OG)";
      return text;
    })
    .join(", ");
};

export const GoalScorers = ({ goalScorers }: GoalScorersProps) => {
  if (!goalScorers || goalScorers.length === 0) return null;

  const homeScorers = goalScorers.filter((g) => g.team === "home");
  const awayScorers = goalScorers.filter((g) => g.team === "away");

  const homeText =
    homeScorers.length > 0 ? formatScorersList(homeScorers) : null;
  const awayText =
    awayScorers.length > 0 ? formatScorersList(awayScorers) : null;

  if (!homeText && !awayText) return null;

  return (
    <div className="space-y-1 text-xs mt-4">
      {homeText && (
        <div className="flex items-center gap-1.5">
          <Goal size={12} className="text-green-600 shrink-0" />
          <span className="text-black/70 font-medium">{homeText}</span>
        </div>
      )}
      {awayText && (
        <div className="flex items-center gap-1.5">
          <Goal size={12} className="text-red-500 shrink-0" />
          <span className="text-black/50">{awayText}</span>
        </div>
      )}
    </div>
  );
};
