import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

import { BlogLikeModel } from "@/lib/models/BlogLikes";

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

    const { blog_id } = await req.json();

    if (!blog_id) {
      return NextResponse.json(
        {
          message: "Blog ID required",
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

    const existingLike = await BlogLikeModel.findOne({
      blog_id,

      user_id: user.userId,
    });

    // unlike
    if (existingLike) {
      await BlogLikeModel.deleteOne({
        _id: existingLike._id,
      });

      blog.likes_count = Math.max(0, blog.likes_count - 1);

      await blog.save();

      return NextResponse.json({
        liked: false,

        likes_count: blog.likes_count,
      });
    }

    // like
    await BlogLikeModel.create({
      blog_id,

      user_id: user.userId,
    });

    blog.likes_count += 1;

    await blog.save();

    return NextResponse.json({
      liked: true,

      likes_count: blog.likes_count,
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
