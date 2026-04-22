import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ important fix

    // 🔐 Auth
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔒 Admin only
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const poll = await PollModel.findById(id); // use id here

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    // 🧠 Soft delete
    poll.is_active = false;
    await poll.save();

    return NextResponse.json({
      message: "Poll deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error deleting poll" },
      { status: 500 },
    );
  }
}
