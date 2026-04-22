import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { VoteModel } from "@/lib/models/Votes";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ fix

    const { searchParams } = new URL(req.url);

    const option_id = searchParams.get("option_id");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    if (!option_id) {
      return NextResponse.json(
        { message: "option_id required" },
        { status: 400 },
      );
    }

    const skip = (page - 1) * limit;

    const votes = await VoteModel.find({
      poll_id: id, // ✅ use id
      option_id,
    })
      .populate("user_id", "first_name last_name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VoteModel.countDocuments({
      poll_id: id, // ✅ use id
      option_id,
    });

    return NextResponse.json({
      voters: votes.map((v) => ({
        user: v.user_id,
        voted_at: v.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error fetching voters" },
      { status: 500 },
    );
  }
}
