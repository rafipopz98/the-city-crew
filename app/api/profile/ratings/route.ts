import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PlayerRating from "@/lib/models/PlayerRating";
import "@/lib/models/Players";
import "@/lib/models/Matches";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

type RatingDoc = {
  _id: { toString(): string };
  rating: number;
  createdAt: string;
  player_id: {
    _id: { toString(): string };
    name: string;
    position: string;
    round_image?: string;
    vertical_image?: string;
  } | null;
  match_id: {
    _id: { toString(): string };
    homeTeam: { name: string };
    awayTeam: { name: string };
    homeTeamScore: number;
    awayTeamScore: number;
    competition: string;
    matchDate: string;
  } | null;
};

type PlayerInfo = {
  id: string;
  name: string;
  position: string;
  image: string;
};

type MatchInfo = {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore: number;
  awayScore: number;
  competition: string;
  matchDate: string;
};

type MatchGroup = {
  match: MatchInfo | null;
  players: {
    id: string;
    rating: number;
    createdAt: string;
    player: PlayerInfo | null;
  }[];
};

// GET /api/profile/ratings?page=1&limit=5 - User's player rating history,
// grouped by match (newest first), 5 matches per page.
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      20,
      Math.max(1, parseInt(url.searchParams.get("limit") || "5")),
    );

    const ratings = await PlayerRating.find({ user_id: user.userId })
      .sort({ createdAt: -1 })
      .populate("player_id", "name position round_image vertical_image")
      .populate(
        "match_id",
        "homeTeam awayTeam homeTeamScore awayTeamScore competition matchDate",
      )
      .lean();

    const docs = ratings as RatingDoc[];

    // Group by match, preserving newest-rating-first order
    const groups = new Map<string, MatchGroup>();

    for (const r of docs) {
      const matchId = r.match_id?._id?.toString() ?? "unknown";

      let group = groups.get(matchId);
      if (!group) {
        group = {
          match: r.match_id
            ? {
                id: r.match_id._id.toString(),
                homeTeam: r.match_id.homeTeam,
                awayTeam: r.match_id.awayTeam,
                homeScore: r.match_id.homeTeamScore,
                awayScore: r.match_id.awayTeamScore,
                competition: r.match_id.competition,
                matchDate: r.match_id.matchDate,
              }
            : null,
          players: [],
        };
        groups.set(matchId, group);
      }

      group.players.push({
        id: r._id.toString(),
        rating: r.rating,
        createdAt: r.createdAt,
        player: r.player_id
          ? {
              id: r.player_id._id.toString(),
              name: r.player_id.name,
              position: r.player_id.position,
              image:
                r.player_id.round_image || r.player_id.vertical_image || "",
            }
          : null,
      });
    }

    const allMatches = Array.from(groups.values());
    const totalMatches = allMatches.length;
    const skip = (page - 1) * limit;
    const matches = allMatches.slice(skip, skip + limit);

    // Summary computed across the whole history (not just the page)
    const totalRatings = docs.length;
    const fiveStars = docs.filter((d) => d.rating === 5).length;
    const averageRating =
      totalRatings > 0
        ? Math.round(
            (docs.reduce((sum, d) => sum + d.rating, 0) / totalRatings) * 10,
          ) / 10
        : 0;
    const uniquePlayers = new Set(
      docs.flatMap((d) => (d.player_id ? [d.player_id._id.toString()] : [])),
    ).size;

    return NextResponse.json({
      summary: { total: totalRatings, averageRating, fiveStars, uniquePlayers },
      matches,
      pagination: {
        page,
        limit,
        totalMatches,
        totalPages: Math.ceil(totalMatches / limit),
        hasMore: skip + limit < totalMatches,
      },
    });
  } catch (error) {
    await logError("/api/profile/ratings", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
