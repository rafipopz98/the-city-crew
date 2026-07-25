import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { ChallengeAnswerModel } from "@/lib/models/ChallengeAnswer";
import { QuestionModel } from "@/lib/models/Question";
import { UserModel } from "@/lib/models/User";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await UserModel.findById(user.userId).select("role");
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json(
        { message: "challengeId is required" },
        { status: 400 },
      );
    }

    const challenge = await DailyChallengeModel.findById(challengeId).lean();
    if (!challenge) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 },
      );
    }

    // Total participants
    const totalParticipants = await ChallengeAttemptModel.countDocuments({
      challengeId,
    });

    const completedAttempts = await ChallengeAttemptModel.countDocuments({
      challengeId,
      status: "completed",
    });

    // Average stats from completed attempts
    const statsAgg = await ChallengeAttemptModel.aggregate([
      { $match: { challengeId: challenge._id, status: "completed" } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          avgTime: { $avg: "$completionTimeMs" },
          maxScore: { $max: "$score" },
          minTime: { $min: "$completionTimeMs" },
          totalCompletions: { $sum: 1 },
        },
      },
    ]);

    const avgStats = statsAgg[0] || {
      avgScore: 0,
      avgTime: 0,
      maxScore: 0,
      minTime: 0,
      totalCompletions: 0,
    };

    // Score distribution
    const scoreDistribution = await ChallengeAttemptModel.aggregate([
      { $match: { challengeId: challenge._id, status: "completed" } },
      { $group: { _id: "$score", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Most missed and most correct questions
    const allQuestions = await QuestionModel.find({
      challengeId: challenge._id,
    }).lean();

    const questionStats = await ChallengeAnswerModel.aggregate([
      {
        $match: {
          questionId: { $in: allQuestions.map((q) => q._id) },
        },
      },
      {
        $group: {
          _id: "$questionId",
          correctCount: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const questionStatsMap = new Map(
      questionStats.map((qs) => [qs._id.toString(), qs]),
    );

    const enrichedQuestions = allQuestions.map((q) => {
      const stats = questionStatsMap.get(q._id.toString());
      return {
        _id: q._id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        options: q.options,
        order: q.order,
        correctCount: stats?.correctCount || 0,
        totalCount: stats?.totalCount || 0,
        accuracy: stats
          ? Math.round((stats.correctCount / stats.totalCount) * 100)
          : 0,
      };
    });

    // Sort by most missed (lowest accuracy)
    const mostMissed = [...enrichedQuestions]
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const mostCorrect = [...enrichedQuestions]
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // Completion timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyCompletionCount = await ChallengeAttemptModel.aggregate([
      {
        $match: {
          submittedAt: { $gte: sevenDaysAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fetch participants with their details
    const participants = await ChallengeAttemptModel.find({
      challengeId: challenge._id,
      status: "completed",
    })
      .select("userId score completionTimeMs submittedAt")
      .populate("userId", "first_name last_name email")
      .sort({ score: -1, completionTimeMs: 1 })
      .lean();

    const participantsList = participants.map((p: any, index: number) => ({
      rank: index + 1,
      name: `${p.userId?.first_name || ""} ${p.userId?.last_name || ""}`.trim() || "Unknown",
      email: p.userId?.email || "",
      score: p.score,
      completionTimeMs: p.completionTimeMs,
      submittedAt: p.submittedAt,
    }));

    return NextResponse.json({
      challenge: {
        title: challenge.title,
        challengeDate: challenge.challengeDate,
        status: challenge.status,
      },
      stats: {
        totalParticipants,
        completedAttempts,
        participationRate:
          totalParticipants > 0
            ? Math.round((completedAttempts / totalParticipants) * 100)
            : 0,
        averageAccuracy: avgStats.avgScore
          ? Math.round((avgStats.avgScore / 5) * 100)
          : 0,
        averageScore: Math.round(avgStats.avgScore * 10) / 10,
        averageCompletionTimeMs: Math.round(avgStats.avgTime),
        bestScore: avgStats.maxScore,
        bestTimeMs: avgStats.minTime,
      },
      scoreDistribution: scoreDistribution.map((sd) => ({
        score: sd._id,
        count: sd.count,
      })),
      mostMissedQuestions: mostMissed,
      mostCorrectQuestions: mostCorrect,
      dailyCompletionCount,
      participants: participantsList,
    });
  } catch (error) {
    await logError("/api/admin/daily-challenge/stats", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
