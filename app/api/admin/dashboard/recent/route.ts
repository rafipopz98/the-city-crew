import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { BlogModel } from "@/lib/models/Blogs";
import { MatchesModel } from "@/lib/models/Matches";
import { PlayersModels } from "@/lib/models/Players";
import { PollModel } from "@/lib/models/Polls";

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

    // Only fetch recent items - lightweight queries
    const [recentBlogs, recentMatches, recentPlayers, recentPolls] =
      await Promise.all([
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

    return NextResponse.json({
      blogs: recentBlogs,
      matches: recentMatches.map((m: any) => ({
        _id: m._id,
        homeTeam: m.homeTeam?.name || "Unknown",
        awayTeam: m.awayTeam?.name || "Unknown",
        matchDate: m.matchDate,
        status: m.status,
        competition: m.competition,
      })),
      players: recentPlayers,
      polls: recentPolls,
    });
  } catch (error) {
    console.error("Recent API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
