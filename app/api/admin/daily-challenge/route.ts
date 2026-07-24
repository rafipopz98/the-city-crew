import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DailyChallengeModel } from "@/lib/models/DailyChallenge";
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const status = searchParams.get("status");

    const query: any = {};
    if (status && ["draft", "active", "completed"].includes(status)) {
      query.status = status;
    }

    const total = await DailyChallengeModel.countDocuments(query);
    const challenges = await DailyChallengeModel.find(query)
      .sort({ challengeDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title challengeDate status totalParticipants createdAt")
      .lean();

    // Get question counts for each challenge
    const challengeIds = challenges.map((c) => c._id);
    const questionCounts = await QuestionModel.aggregate([
      { $match: { challengeId: { $in: challengeIds } } },
      { $group: { _id: "$challengeId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      questionCounts.map((qc) => [qc._id.toString(), qc.count]),
    );

    const enriched = challenges.map((c) => ({
      ...c,
      questionCount: countMap.get(c._id.toString()) || 0,
    }));

    return NextResponse.json({
      challenges: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    await logError("/api/admin/daily-challenge", "GET", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { title, challengeDate, questions } = body;

    // Validation
    if (!title || !challengeDate) {
      return NextResponse.json(
        { message: "Title and challenge date are required" },
        { status: 400 },
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length !== 20) {
      return NextResponse.json(
        { message: "Exactly 20 questions are required" },
        { status: 400 },
      );
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || !q.correctAnswer) {
        return NextResponse.json(
          { message: `Question ${i + 1} is missing required fields` },
          { status: 400 },
        );
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return NextResponse.json(
          { message: `Question ${i + 1} must have exactly 4 options` },
          { status: 400 },
        );
      }

      if (new Set(q.options).size !== 4) {
        return NextResponse.json(
          { message: `Question ${i + 1} has duplicate options` },
          { status: 400 },
        );
      }

      if (!q.options.includes(q.correctAnswer)) {
        return NextResponse.json(
          { message: `Question ${i + 1} correct answer must be one of the options` },
          { status: 400 },
        );
      }

      const hasEmpty = [q.question, ...q.options].some(
        (val) => !val || (typeof val === "string" && val.trim() === ""),
      );
      if (hasEmpty) {
        return NextResponse.json(
          { message: `Question ${i + 1} has empty fields` },
          { status: 400 },
        );
      }
    }

    // Check date uniqueness
    const existingDate = await DailyChallengeModel.findOne({ challengeDate });
    if (existingDate) {
      return NextResponse.json(
        { message: "A challenge with this date already exists" },
        { status: 409 },
      );
    }

    // Create the challenge
    const challenge = await DailyChallengeModel.create({
      title,
      challengeDate,
      status: "draft",
    });

    // Create questions
    const questionDocs = questions.map((q: any, index: number) => ({
      challengeId: challenge._id,
      question: q.question.trim(),
      options: q.options.map((o: string) => o.trim()),
      correctAnswer: q.correctAnswer.trim(),
      order: index + 1,
    }));

    await QuestionModel.insertMany(questionDocs);

    return NextResponse.json(
      {
        message: "Challenge created successfully",
        challenge: {
          _id: challenge._id,
          title: challenge.title,
          challengeDate: challenge.challengeDate,
          status: challenge.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await logError("/api/admin/daily-challenge", "POST", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
