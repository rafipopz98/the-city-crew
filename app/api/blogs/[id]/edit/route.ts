import { NextRequest, NextResponse } from "next/server";

import { logError } from "@/lib/errorLogger";
import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function PUT(
  req: NextRequest,

  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    const { id } = await context.params;

    const {
      title,
      thumbnail,
      excerpt,
      tags,
      content_blocks,
      status,
      is_featured,
    } = await req.json();

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

    blog.title = title;

    blog.thumbnail = thumbnail;

    blog.excerpt = excerpt;

    blog.tags = tags;

    blog.content_blocks = content_blocks;

    blog.status = status;

    blog.is_featured = is_featured;

    if (status === "published" && !blog.published_at) {
      blog.published_at = new Date();
    }

    await blog.save();

    return NextResponse.json({
      message: "Blog updated successfully",

      blog,
    });
  } catch (error) {
    await logError("/api/blogs/[id]/edit", "PUT", error);
    console.error(error);

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
