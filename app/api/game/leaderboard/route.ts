import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { logError } from "@/lib/errorLogger";

// GET /api/game/leaderboard?sort=xp&limit=50
export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const sort = url.searchParams.get("sort") || "xp";
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50")));

    let sortField: Record<string, 1 | -1> = { xp: -1 };
    let projection: Record<string, 1 | -1> = { username: 1, xp: 1, total_wins: 1, total_matches: 1 };
    let pipeline: any[] | null = null;

    // Only show users who have completed onboarding (active players)
    const baseMatch = { has_completed_onboarding: true };

    switch (sort) {
      case "win_rate":
        // Win rate requires minimum 10 matches
        pipeline = [
          { $match: { ...baseMatch, total_matches: { $gte: 10 } } },
          {
            $addFields: {
              win_rate: {
                $cond: [
                  { $gt: ["$total_matches", 0] },
                  { $round: [{ $multiply: [{ $divide: ["$total_wins", "$total_matches"] }, 100] }, 1] },
                  0,
                ],
              },
            },
          },
          { $sort: { win_rate: -1, total_matches: -1 } },
          { $limit: limit },
          {
            $project: {
              username: 1,
              total_wins: 1,
              total_matches: 1,
              win_rate: 1,
              xp: 1,
              longest_streak: 1,
              goals_scored: 1,
            },
          },
        ];
        break;

      case "wins":
        sortField = { total_wins: -1, total_matches: -1 };
        projection = {
          username: 1,
          total_wins: 1,
          total_matches: 1,
          xp: 1,
          longest_streak: 1,
          goals_scored: 1,
        };
        break;

      case "streak":
        sortField = { longest_streak: -1, total_wins: -1 };
        projection = {
          username: 1,
          longest_streak: 1,
          total_wins: 1,
          total_matches: 1,
          xp: 1,
          goals_scored: 1,
        };
        break;

      case "goals":
        sortField = { goals_scored: -1, total_matches: -1 };
        projection = {
          username: 1,
          goals_scored: 1,
          goals_conceded: 1,
          total_matches: 1,
          total_wins: 1,
          xp: 1,
        };
        break;

      case "xp":
      default:
        sortField = { xp: -1, total_wins: -1 };
        projection = {
          username: 1,
          xp: 1,
          total_wins: 1,
          total_matches: 1,
          longest_streak: 1,
          goals_scored: 1,
        };
        break;
    }

    let leaderboard;
    if (pipeline) {
      leaderboard = await GameUserModel.aggregate(pipeline);
    } else {
      leaderboard = await GameUserModel.find(baseMatch)
        .sort(sortField)
        .limit(limit)
        .select(projection)
        .lean();
    }

    // Add rank position
    const ranked = leaderboard.map((entry: any, index: number) => ({
      rank: index + 1,
      username: entry.username,
      xp: entry.xp || 0,
      wins: entry.total_wins || 0,
      matches: entry.total_matches || 0,
      winRate: entry.win_rate ?? (entry.total_matches > 0
        ? Math.round((entry.total_wins / entry.total_matches) * 1000) / 10
        : 0),
      streak: entry.longest_streak || 0,
      goalsScored: entry.goals_scored || 0,
      goalsConceded: entry.goals_conceded || 0,
    }));

    return NextResponse.json({
      leaderboard: ranked,
      sort,
      total: ranked.length,
    });
  } catch (error) {
    await logError("/api/game/leaderboard", "GET", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
