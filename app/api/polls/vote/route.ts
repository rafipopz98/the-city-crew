import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";
import { VoteModel } from "@/lib/models/Votes";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 Auth
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { poll_id, option_id } = await req.json();

    if (!poll_id || !option_id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // 🧠 Check existing vote
    const existing = await VoteModel.findOne({
      poll_id,
      user_id: user.userId,
    });

    if (existing) {
      return NextResponse.json({ message: "Already voted" }, { status: 400 });
    }

    // 🔍 Get poll
    const poll = await PollModel.findById(poll_id);

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    // ❌ Check expired
    if (poll.expires_at < new Date()) {
      return NextResponse.json({ message: "Poll expired" }, { status: 400 });
    }

    // 🔍 Find option
    const option = poll.options.id(option_id);

    if (!option) {
      return NextResponse.json(
        { message: "Option not found" },
        { status: 404 },
      );
    }

    // 🗳️ Save vote
    await VoteModel.create({
      poll_id,
      user_id: user.userId,
      option_id,
    });

    // 📊 Update counts
    option.votes += 1;
    poll.total_votes += 1;

    await poll.save();

    return NextResponse.json({
      message: "Vote successful",
    });
  } catch (err) {
    return NextResponse.json({ message: "Error voting" }, { status: 500 });
  }
}
