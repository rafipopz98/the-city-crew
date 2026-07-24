import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";
import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ fix

    const poll = await PollModel.findById(id);

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({ poll });
  } catch (err) {
    await logError("/api/polls/[id]", "GET", err);
    return NextResponse.json(
      { message: "Error fetching poll" },
      { status: 500 },
    );
  }
}
