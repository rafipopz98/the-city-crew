import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";

import { PollModel } from "@/lib/models/Polls";

import { VoteModel } from "@/lib/models/Votes";

import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromRequest(req);

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "active";

    const query: Record<string, unknown> = {};

    if (status === "active") {
      query.expires_at = {
        $gt: new Date(),
      };
    }

    if (status === "closed") {
      query.expires_at = {
        $lt: new Date(),
      };
    }

    const polls = await PollModel.find(query).sort({
      createdAt: -1,
    });

    let userVotes: any[] = [];

    if (user) {
      userVotes = await VoteModel.find({
        user_id: user.userId,
      });
    }

    const formattedPolls = polls.map((poll) => {
      const vote = userVotes.find(
        (v) => v.poll_id.toString() === poll._id.toString(),
      );

      return {
        ...poll.toObject(),
        has_voted: !!vote,
        selected_option_id: vote?.option_id || null,
      };
    });

    return NextResponse.json({
      polls: formattedPolls,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch polls",
      },
      {
        status: 500,
      },
    );
  }
}
