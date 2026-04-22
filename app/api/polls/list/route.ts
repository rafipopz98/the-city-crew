import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { PollModel } from "@/lib/models/Polls";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // active | expired

    const skip = (page - 1) * limit;

    // 🔍 Build query
    const query: any = {};

    // search (title + badge)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { badge_text: { $regex: search, $options: "i" } },
      ];
    }

    // status filter
    if (status === "active") {
      query.expires_at = { $gt: new Date() };
    }

    if (status === "expired") {
      query.expires_at = { $lt: new Date() };
    }

    // 🧠 Fetch
    const polls = await PollModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PollModel.countDocuments(query);

    return NextResponse.json({
      polls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error fetching polls" },
      { status: 500 },
    );
  }
}
