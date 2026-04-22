import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { NextResponse } from "next/server";

export const POST = async (req: Response) => {
  try {
    await connectDB();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, badge, options } = body;

    if (!title || !badge || !options || options.length < 2) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const poll = await PollModel.create({
      added_by: user.userId,
      title,
      badge_text: badge,
      options: options.map((text: string) => ({ text })),
      total_votes: 0,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return NextResponse.json({ poll });
  } catch (error) {
    console.log("Error while adding new poll", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
};
