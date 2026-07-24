import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { logError } from "@/lib/errorLogger";

/**
 * Public endpoint — no auth required.
 * Returns whether there's an active challenge, plus whether the
 * current user (if logged in) has completed it.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const activeChallenge = await DailyChallengeModel.findOne({
      status: "active",
    })
      .select("_id")
      .lean();

    if (!activeChallenge) {
      return NextResponse.json({ hasActive: false });
    }

    // Try to get user — may or may not be logged in
    let completed = false;
    try {
      const user = await getUserFromRequest(req);
      if (user) {
        const attempt = await ChallengeAttemptModel.findOne({
          userId: user.userId,
          challengeId: activeChallenge._id,
          status: "completed",
        })
          .select("_id")
          .lean();
        completed = !!attempt;
      }
    } catch {
      // Not logged in — that's fine
    }

    return NextResponse.json({ hasActive: true, completed });
  } catch (error) {
    await logError("/api/daily-challenge/public-check", "GET", error);
    return NextResponse.json(
      { hasActive: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
