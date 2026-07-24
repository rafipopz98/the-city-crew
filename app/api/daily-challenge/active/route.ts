import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the currently active challenge
    const activeChallenge = await DailyChallengeModel.findOne({
      status: "active",
    }).lean();

    if (!activeChallenge) {
      return NextResponse.json(
        { message: "No active challenge available", challenge: null },
        { status: 200 },
      );
    }

    // Check if user has an attempt for this challenge
    const existingAttempt = await ChallengeAttemptModel.findOne({
      userId: user.userId,
      challengeId: activeChallenge._id,
    })
      .select("status score completionTimeMs")
      .lean();

    return NextResponse.json({
      challenge: {
        _id: activeChallenge._id,
        title: activeChallenge.title,
        challengeDate: activeChallenge.challengeDate,
        totalParticipants: activeChallenge.totalParticipants,
      },
      attempt: existingAttempt
        ? {
            status: existingAttempt.status,
            score: existingAttempt.score,
            completionTimeMs: existingAttempt.completionTimeMs,
          }
        : null,
    });
  } catch (error) {
    await logError("/api/daily-challenge/active", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
