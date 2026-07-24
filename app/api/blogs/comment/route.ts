import { NextRequest, NextResponse } from "next/server";

import { logError } from "@/lib/errorLogger";
import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

import { BlogCommentModel } from "@/lib/models/BlogComments";

import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function POST(req: NextRequest) {
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

    const {
      blog_id,

      parent_id,

      text,
    } = await req.json();

    if (!blog_id || !text?.trim()) {
      return NextResponse.json(
        {
          message: "Invalid data",
        },
        {
          status: 400,
        },
      );
    }

    const blog = await BlogModel.findById(blog_id);

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

    await BlogCommentModel.create({
      blog_id,

      user_id: user.userId,

      parent_id: parent_id || null,

      text,
    });

    blog.comments_count += 1;

    await blog.save();

    return NextResponse.json({
      message: "Comment added",
    });
  } catch (error) {
    await logError("/api/blogs/comment", "POST", error);
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
