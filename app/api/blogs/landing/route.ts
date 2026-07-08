import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/models/Blogs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const blogs = await BlogModel.find({
      status: "published",
    })
      .sort({ published_at: -1 })
      .limit(limit)
      .select("title slug thumbnail tags published_at excerpt")
      .lean();

    // If no blogs found
    if (!blogs || blogs.length === 0) {
      return NextResponse.json({
        data: [],
        message: "No published blogs found",
      });
    }

    // If limit is 1, return single object for hero section compatibility
    if (limit === 1) {
      return NextResponse.json({
        data: blogs[0],
      });
    }

    return NextResponse.json({
      data: blogs,
      total: blogs.length,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}
