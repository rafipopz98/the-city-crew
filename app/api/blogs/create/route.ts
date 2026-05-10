import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

import { getUserFromRequest } from "@/utils/getUserFromRequest";

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // auth
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

    // admin only
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

    const {
      title,
      thumbnail,
      excerpt,
      tags,
      content_blocks,
      status,
      is_featured,
    } = await req.json();

    // validation
    if (!title || !thumbnail || !content_blocks?.length) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    const slug = createSlug(title);

    // duplicate slug
    const existing = await BlogModel.findOne({
      slug,
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Blog title already exists",
        },
        {
          status: 400,
        },
      );
    }

    const blog = await BlogModel.create({
      title,

      slug,

      thumbnail,

      excerpt: excerpt || "",

      tags: tags || [],

      content_blocks,

      status: status || "draft",

      is_featured: !!is_featured,

      published_at: status === "published" ? new Date() : null,

      created_by: user.userId,
    });

    return NextResponse.json({
      message: "Blog created successfully",

      blog,
    });
  } catch (error) {
    console.error("BLOG_CREATE_ERROR:", error);

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
