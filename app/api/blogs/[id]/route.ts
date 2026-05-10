import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const blog = await BlogModel.findById(id);

    if (!blog) {
      return NextResponse.json(
        {
          message: "Blog not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      blog,
    });
  } catch (error) {
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
