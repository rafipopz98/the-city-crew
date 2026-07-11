import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { PlayersModels } from "@/lib/models/Players";
import { PollModel } from "@/lib/models/Polls";
import { UserModel } from "@/lib/models/User";
import { SeasonModel } from "@/lib/models/Season";
import { BlogModel } from "@/lib/models/Blogs";
import { BlogCommentModel } from "@/lib/models/BlogComments";
import { VoteModel } from "@/lib/models/Votes";

export async function GET(req: NextRequest) {
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

    // Fetch all stats in parallel
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalBlogViews,
      totalBlogLikes,
      totalBlogComments,
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
      totalSubscribers,
      latestSeason,
      recentBlogs,
      recentMatches,
      recentPlayers,
      recentPolls,
    ] = await Promise.all([
      // Blog stats
      BlogModel.countDocuments(),
      BlogModel.countDocuments({ status: "published" }),
      BlogModel.countDocuments({ status: "draft" }),
      BlogModel.aggregate([
        { $group: { _id: null, total: { $sum: "$views_count" } } },
      ]).then((res) => res[0]?.total || 0),
      BlogModel.aggregate([
        { $group: { _id: null, total: { $sum: "$likes_count" } } },
      ]).then((res) => res[0]?.total || 0),
      BlogCommentModel.countDocuments(),

      // Match stats
      MatchesModel.countDocuments(),
      MatchesModel.countDocuments({ status: "upcoming" }),
      MatchesModel.countDocuments({ status: "live" }),
      MatchesModel.countDocuments({ status: "finished" }),

      // Player stats
      PlayersModels.countDocuments(),
      PlayersModels.countDocuments({ is_active: true }),

      // Poll stats
      PollModel.countDocuments(),
      PollModel.countDocuments({ is_active: true }),
      VoteModel.countDocuments(),

      // User stats
      UserModel.countDocuments({ is_deleted: false }),

      // Newsletter subscribers (if you have the model)
      // NewsLetterModel.countDocuments(),
      0, // Placeholder for newsletter count

      // Latest season
      SeasonModel.findOne().sort({ year: -1 }).select("year"),

      // Recent items
      BlogModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status createdAt")
        .lean(),

      MatchesModel.find()
        .sort({ matchDate: -1 })
        .limit(5)
        .select("homeTeam.name awayTeam.name matchDate status competition")
        .lean(),

      PlayersModels.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name position number createdAt")
        .lean(),

      PollModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title total_votes createdAt is_active")
        .lean(),
    ]);

    const stats = {
      blogs: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs,
        views: totalBlogViews,
        likes: totalBlogLikes,
        comments: totalBlogComments,
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
        subscribers: totalSubscribers,
      },
      season: latestSeason?.year || null,
    };

    const recent = {
      blogs: recentBlogs,
      matches: recentMatches.map((m) => ({
        ...m,
        homeTeam: m.homeTeam?.name || "Unknown",
        awayTeam: m.awayTeam?.name || "Unknown",
      })),
      players: recentPlayers,
      polls: recentPolls,
    };

    return NextResponse.json({ stats, recent }, { status: 200 });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
