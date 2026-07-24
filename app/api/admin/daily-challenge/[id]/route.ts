import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
import { QuestionModel } from "@/lib/models/Question";
import { ChallengeAttemptModel } from "@/lib/models/ChallengeAttempt";
import { ChallengeAnswerModel } from "@/lib/models/ChallengeAnswer";
import { UserModel } from "@/lib/models/User";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const challenge = await DailyChallengeModel.findById(id).lean();
    if (!challenge) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 },
      );
    }

    const questions = await QuestionModel.find({ challengeId: id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ challenge, questions });
  } catch (error) {
    await logError("/api/admin/daily-challenge/[id]", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const body = await req.json();
    const { title, challengeDate, status, questions } = body;

    const challenge = await DailyChallengeModel.findById(id);
    if (!challenge) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 },
      );
    }

    // Prevent editing active or completed challenges
    if (challenge.status !== "draft" && status !== "completed") {
      if (title || challengeDate || questions) {
        return NextResponse.json(
          {
            message:
              "Cannot edit an active or completed challenge. Set it back to draft first.",
          },
          { status: 400 },
        );
      }
    }

    // Update challenge fields
    if (title) challenge.title = title;
    if (challengeDate) {
      // Check date uniqueness if changed
      const existing = await DailyChallengeModel.findOne({
        challengeDate,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "A challenge with this date already exists" },
          { status: 409 },
        );
      }
      challenge.challengeDate = challengeDate;
    }

    // Handle status changes
    if (status && ["draft", "active", "completed"].includes(status)) {
      if (status === "active" && challenge.status === "draft") {
        // Deactivate any other active challenges
        await DailyChallengeModel.updateMany(
          { status: "active", _id: { $ne: id } },
          { status: "completed" },
        );
        challenge.startAt = new Date();
      }
      if (status === "completed") {
        challenge.endAt = new Date();
      }
      challenge.status = status;
    }

    await challenge.save();

    // Update questions if provided
    if (questions && Array.isArray(questions) && challenge.status === "draft") {
      // Delete existing questions and recreate
      await QuestionModel.deleteMany({ challengeId: id });

      const questionDocs = questions.map((q: any, index: number) => ({
        challengeId: id,
        question: q.question.trim(),
        options: q.options.map((o: string) => o.trim()),
        correctAnswer: q.correctAnswer.trim(),
        order: index + 1,
      }));

      await QuestionModel.insertMany(questionDocs);
    }

    return NextResponse.json({
      message: "Challenge updated successfully",
    });
  } catch (error) {
    await logError("/api/admin/daily-challenge/[id]", "PUT", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const challenge = await DailyChallengeModel.findById(id);
    if (!challenge) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 },
      );
    }

    if (challenge.status === "active") {
      return NextResponse.json(
        { message: "Cannot delete an active challenge. Complete it first." },
        { status: 400 },
      );
    }

    // Delete all related data
    const attempts = await ChallengeAttemptModel.find({ challengeId: id }).select("_id");
    const attemptIds = attempts.map((a) => a._id);

    if (attemptIds.length > 0) {
      await ChallengeAnswerModel.deleteMany({ attemptId: { $in: attemptIds } });
    }
    await ChallengeAttemptModel.deleteMany({ challengeId: id });
    await QuestionModel.deleteMany({ challengeId: id });
    await DailyChallengeModel.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Challenge and all related data deleted successfully",
    });
  } catch (error) {
    await logError("/api/admin/daily-challenge/[id]", "DELETE", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
