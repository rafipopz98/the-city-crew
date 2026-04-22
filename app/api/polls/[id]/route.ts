import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const poll = await PollModel.findById(params.id);

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({ poll });
  } catch (err) {
    return NextResponse.json(
      { message: "Error fetching poll" },
      { status: 500 },
    );
  }
}
