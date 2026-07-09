import { connectDB } from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";
import PlayerRating from "@/lib/models/PlayerRating";
import { MatchesModel } from "@/lib/models/Matches";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

type RouteContext = {
  params: Promise<{ matchId: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const { matchId } = await params;
    const user = await getUserFromRequest(req);

    // Get match with lineup populated
    const match = await MatchesModel.findById(matchId)
      .populate({
        path: "lineup",
        select: "name position country vertical_image number",
      })
      .lean();

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const isFinished = match.status === "finished";
    const isLoggedIn = !!user;

    // Get user's ratings for these players
    let userRatings: Record<string, number> = {};
    if (isLoggedIn) {
      const ratings = await PlayerRating.find({
        match_id: matchId,
        user_id: user?.userId,
        player_id: { $in: match.lineup?.map((p: any) => p._id) || [] },
      });
      ratings.forEach((r) => {
        userRatings[r.player_id.toString()] = r.rating;
      });
    }

    // Get average ratings for each player
    const playerIds = match.lineup?.map((p: any) => p._id) || [];
    const avgRatings = await PlayerRating.aggregate([
      {
        $match: {
          match_id: match._id,
          player_id: { $in: playerIds },
        },
      },
      {
        $group: {
          _id: "$player_id",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const avgMap: Record<string, { avg: number; count: number }> = {};
    avgRatings.forEach((item) => {
      avgMap[item._id.toString()] = {
        avg: Math.round(item.averageRating * 10) / 10,
        count: item.totalRatings,
      };
    });

    // Position order for sorting
    const positionOrder: Record<string, number> = {
      ST: 1,
      CF: 1,
      LW: 1,
      RW: 1,
      LF: 1,
      RF: 1,
      CM: 2,
      CDM: 2,
      CAM: 2,
      DM: 2,
      AM: 2,
      LM: 2,
      RM: 2,
      CB: 3,
      LB: 3,
      RB: 3,
      LWB: 3,
      RWB: 3,
      GK: 4,
    };

    // Sort players: ST → MID → DEF → GK
    const sortedPlayers = (match.lineup || [])
      .map((player: any) => {
        const avg = avgMap[player._id.toString()];
        return {
          ...player,
          positionOrder: positionOrder[player.position] || 99,
          userRating: userRatings[player._id.toString()] || null,
          averageRating: avg?.avg || 0,
          totalRatings: avg?.count || 0,
        };
      })
      .sort((a: any, b: any) => a.positionOrder - b.positionOrder);

    return NextResponse.json({
      players: sortedPlayers,
      isFinished,
      isLoggedIn,
      match: {
        _id: match._id,
        competition: match.competition,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeTeamScore: match.homeTeamScore,
        awayTeamScore: match.awayTeamScore,
        matchDate: match.matchDate,
      },
    });
  } catch (error) {
    console.error("Error fetching player ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch player ratings" },
      { status: 500 },
    );
  }
}
