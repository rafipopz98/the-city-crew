import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

import { BlogLikeModel } from "@/lib/models/BlogLikes";

import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function GET(
  req: NextRequest,

  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  try {
    await connectDB();

    const { slug } = await context.params;

    // user optional
    const user = await getUserFromRequest(req);

    const blog = await BlogModel.findOne({
      slug,

      status: "published",
    });

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

    // increment views
    blog.views_count += 1;

    await blog.save();

    let hasLiked = false;

    // logged in?
    if (user) {
      const existingLike = await BlogLikeModel.findOne({
        blog_id: blog._id,

        user_id: user.userId,
      });

      hasLiked = !!existingLike;
    }

    return NextResponse.json({
      blog: {
        ...blog.toObject(),

        has_liked: hasLiked,
      },
    });
  } catch (error) {
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
