import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { UserModel } from "@/lib/models/User";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    await connectDB();

    let leaderboard: any[] = [];
    let currentUserRank = null;

    if (period === "daily") {
      // Find the active challenge
      const activeChallenge = await DailyChallengeModel.findOne({
        status: "active",
      }).select("_id challengeDate title");

      if (activeChallenge) {
        const attempts = await ChallengeAttemptModel.find({
          challengeId: activeChallenge._id,
          status: "completed",
        })
          .sort({ score: -1, completionTimeMs: 1, submittedAt: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("userId", "username first_name last_name streak badges")
          .lean();

        leaderboard = attempts.map((a: any, index: number) => ({
          rank: (page - 1) * limit + index + 1,
          userId: a.userId?._id,
          username: a.userId?.username || `${a.userId?.first_name} ${a.userId?.last_name}`,
          score: a.score,
          completionTimeMs: a.completionTimeMs,
          streak: a.userId?.streak || 0,
          badges: a.userId?.badges || [],
        }));

        // Find current user's rank
        const currentUserAttempt = await ChallengeAttemptModel.findOne({
          challengeId: activeChallenge._id,
          userId: user.userId,
          status: "completed",
        });

        if (currentUserAttempt) {
          const rank = await ChallengeAttemptModel.countDocuments({
            challengeId: activeChallenge._id,
            status: "completed",
            $or: [
              { score: { $gt: currentUserAttempt.score } },
              {
                score: currentUserAttempt.score,
                completionTimeMs: { $lt: currentUserAttempt.completionTimeMs },
              },
            ],
          });
          currentUserRank = rank + 1;
        }
      }
    } else if (period === "weekly") {
      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysSinceMonday);
      weekStart.setHours(0, 0, 0, 0);

      const users = await UserModel.find({
        is_deleted: false,
        challengesPlayed: { $gt: 0 },
        updatedAt: { $gte: weekStart },
      })
        .select("username first_name last_name totalPoints totalCorrect bestTime streak badges")
        .sort({ totalPoints: -1, totalCorrect: -1, bestTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      leaderboard = users.map((u: any, index: number) => ({
        rank: (page - 1) * limit + index + 1,
        userId: u._id,
        username: u.username || `${u.first_name} ${u.last_name}`,
        score: u.totalPoints,
        totalCorrect: u.totalCorrect,
        bestTime: u.bestTime,
        streak: u.streak,
        badges: u.badges || [],
      }));

      const currentUser = await UserModel.findById(user.userId).select(
        "totalPoints totalCorrect bestTime",
      );

      if (currentUser && currentUser.challengesPlayed > 0) {
        const rank = await UserModel.countDocuments({
          is_deleted: false,
          challengesPlayed: { $gt: 0 },
          $or: [
            { totalPoints: { $gt: currentUser.totalPoints } },
            {
              totalPoints: currentUser.totalPoints,
              totalCorrect: { $gt: currentUser.totalCorrect },
            },
          ],
        });
        currentUserRank = rank + 1;
      }
    } else if (period === "all_time") {
      const users = await UserModel.find({
        is_deleted: false,
        challengesPlayed: { $gt: 0 },
      })
        .select("username first_name last_name totalPoints totalCorrect bestTime streak badges dailyWins")
        .sort({ totalPoints: -1, totalCorrect: -1, bestTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      leaderboard = users.map((u: any, index: number) => ({
        rank: (page - 1) * limit + index + 1,
        userId: u._id,
        username: u.username || `${u.first_name} ${u.last_name}`,
        score: u.totalPoints,
        totalCorrect: u.totalCorrect,
        bestTime: u.bestTime,
        streak: u.streak,
        badges: u.badges || [],
        dailyWins: u.dailyWins,
      }));

      const currentUser = await UserModel.findById(user.userId).select(
        "totalPoints totalCorrect bestTime",
      );

      if (currentUser && currentUser.challengesPlayed > 0) {
        const rank = await UserModel.countDocuments({
          is_deleted: false,
          challengesPlayed: { $gt: 0 },
          $or: [
            { totalPoints: { $gt: currentUser.totalPoints } },
            {
              totalPoints: currentUser.totalPoints,
              totalCorrect: { $gt: currentUser.totalCorrect },
            },
          ],
        });
        currentUserRank = rank + 1;
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      period,
    });
  } catch (error) {
    await logError("/api/daily-challenge/leaderboard", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
