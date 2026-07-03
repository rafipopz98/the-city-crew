import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/models/Blogs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const data = await BlogModel.findOne({
      is_featured: true,
      is_deleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    return NextResponse.json(
      {
        message: "Featured blog fetched successfully",
        data,
      },
      {
        status: 200,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
