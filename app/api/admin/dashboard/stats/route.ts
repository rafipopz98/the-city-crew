import { NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { BlogModel } from "@/lib/models/Blogs";
import { MatchesModel } from "@/lib/models/Matches";
import { PlayersModels } from "@/lib/models/Players";
import { PollModel } from "@/lib/models/Polls";
import { BlogCommentModel } from "@/lib/models/BlogComments";
import { VoteModel } from "@/lib/models/Votes";
import { SeasonModel } from "@/lib/models/Season";

export async function GET() {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await UserModel.findById(payload.userId).select("role");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only fetch counts - no recent data, no lean() with nested objects
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      blogViewsAgg,
      blogLikesAgg,
      totalComments,
      totalMatches,
      upcomingMatches,
      liveMatches,
      finishedMatches,
      totalPlayers,
      activePlayers,
      totalPolls,
      activePolls,
      totalVotes,
      totalUsers,
      latestSeason,
    ] = await Promise.all([
      BlogModel.countDocuments(),
      BlogModel.countDocuments({ status: "published" }),
      BlogModel.countDocuments({ status: "draft" }),
      BlogModel.aggregate([{ $group: { _id: null, total: { $sum: "$views_count" } } }]),
      BlogModel.aggregate([{ $group: { _id: null, total: { $sum: "$likes_count" } } }]),
      BlogCommentModel.countDocuments(),
      MatchesModel.countDocuments(),
      MatchesModel.countDocuments({ status: "upcoming" }),
      MatchesModel.countDocuments({ status: "live" }),
      MatchesModel.countDocuments({ status: "finished" }),
      PlayersModels.countDocuments(),
      PlayersModels.countDocuments({ is_active: true }),
      PollModel.countDocuments(),
      PollModel.countDocuments({ is_active: true }),
      VoteModel.countDocuments(),
      UserModel.countDocuments({ is_deleted: false }),
      SeasonModel.findOne().sort({ year: -1 }).select("year").lean(),
    ]);

    return NextResponse.json({
      blogs: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs,
        views: blogViewsAgg[0]?.total || 0,
        likes: blogLikesAgg[0]?.total || 0,
        comments: totalComments,
      },
      matches: {
        total: totalMatches,
        upcoming: upcomingMatches,
        live: liveMatches,
        finished: finishedMatches,
      },
      players: {
        total: totalPlayers,
        active: activePlayers,
      },
      polls: {
        total: totalPolls,
        active: activePolls,
        votes: totalVotes,
      },
      users: {
        total: totalUsers,
      },
      season: latestSeason?.year || null,
    });
  } catch (error) {
    await logError("/api/admin/dashboard/stats", "GET", error);
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}