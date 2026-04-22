import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ fix

    // 🔐 Auth
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔒 Admin only
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, badge, options } = await req.json();

    const poll = await PollModel.findById(id); // ✅ use id

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    // ✏️ Update basic fields
    poll.title = title;
    poll.badge_text = badge;

    // 🧠 Safe options handling
    const updatedOptions: any[] = [];

    for (const existing of poll.options) {
      const incoming = options.find(
        (o: any) => o._id?.toString() === existing._id.toString(),
      );

      // ❌ If option removed
      if (!incoming) {
        if (existing.votes > 0) {
          return NextResponse.json(
            { message: "Cannot delete option with votes" },
            { status: 400 },
          );
        }
        continue;
      }

      // ✅ Update text
      existing.text = incoming.text;
      updatedOptions.push(existing);
    }

    // ➕ Add new options
    for (const opt of options) {
      if (!opt._id) {
        updatedOptions.push({
          text: opt.text,
          votes: 0,
        });
      }
    }

    poll.options = updatedOptions;

    await poll.save();

    return NextResponse.json({ poll });
  } catch (err) {
    return NextResponse.json(
      { message: "Error updating poll" },
      { status: 500 },
    );
  }
}
