import { connectDB } from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";
import PlayerRating from "@/lib/models/PlayerRating";
import { MatchesModel } from "@/lib/models/Matches";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

type RouteContext = {
  params: Promise<{
    matchId: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { matchId } = await params;

    const user = await getUserFromRequest(req);

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

    let userRatings: Record<string, number> = {};

    if (isLoggedIn) {
      const ratings = await PlayerRating.find({
        match_id: match._id,
        user_id: user.userId,
        player_id: {
          $in: (match.lineup || []).map((p: any) => p._id),
        },
      }).lean();

      for (const rating of ratings) {
        userRatings[rating.player_id.toString()] = rating.rating;
      }
    }

    const playerIds = (match.lineup || []).map((p: any) => p._id);

    const avgRatings = await PlayerRating.aggregate([
      {
        $match: {
          match_id: match._id,
          player_id: {
            $in: playerIds,
          },
        },
      },
      {
        $group: {
          _id: "$player_id",
          averageRating: {
            $avg: "$rating",
          },
          totalRatings: {
            $sum: 1,
          },
        },
      },
    ]);

    const avgMap: Record<
      string,
      {
        avg: number;
        count: number;
      }
    > = {};

    avgRatings.forEach((item) => {
      avgMap[item._id.toString()] = {
        avg: Math.round(item.averageRating * 10) / 10,
        count: item.totalRatings,
      };
    });

    const positionOrder: Record<string, number> = {
      ST: 1,
      CF: 1,
      LW: 1,
      RW: 1,
      LF: 1,
      RF: 1,

      CAM: 2,
      CM: 2,
      CDM: 2,
      AM: 2,
      DM: 2,
      LM: 2,
      RM: 2,

      LB: 3,
      RB: 3,
      CB: 3,
      LWB: 3,
      RWB: 3,

      GK: 4,
    };

    const players = (match.lineup || [])
      .map((player: any) => {
        const avg = avgMap[player._id.toString()];

        return {
          _id: player._id.toString(),
          name: player.name,
          position: player.position,
          country: player.country,
          vertical_image: player.vertical_image,
          number: player.number,

          userRating: userRatings[player._id.toString()] ?? null,
          averageRating: avg?.avg ?? 0,
          totalRatings: avg?.count ?? 0,

          positionOrder: positionOrder[player.position] ?? 99,
        };
      })
      .sort((a: any, b: any) => a.positionOrder - b.positionOrder)
      .map(({ positionOrder, ...player }: any) => player);

    return NextResponse.json({
      players,

      isFinished,

      isLoggedIn,

      match: {
        _id: match._id.toString(),

        competition: match.competition,

        status: match.status,

        homeTeam: {
          name: match.homeTeam?.name ?? "",
          image: match.homeTeam?.image ?? "",
        },

        awayTeam: {
          name: match.awayTeam?.name ?? "",
          image: match.awayTeam?.image ?? "",
        },

        homeTeamScore: match.homeTeamScore,

        awayTeamScore: match.awayTeamScore,

        matchDate: match.matchDate
          ? new Date(match.matchDate).toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch player ratings",
      },
      {
        status: 500,
      },
    );
  }
}
