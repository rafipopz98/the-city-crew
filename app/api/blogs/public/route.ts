import { NextRequest, NextResponse } from "next/server";

import { logError } from "@/lib/errorLogger";
import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const page = Number(searchParams.get("page")) || 1;

    const limit = Number(searchParams.get("limit")) || 6;

    const skip = (page - 1) * limit;

    const query: any = {
      status: "published",
    };

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },

        {
          excerpt: {
            $regex: search,
            $options: "i",
          },
        },

        {
          tags: {
            $in: [new RegExp(search, "i")],
          },
        },
      ];
    }

    const blogs = await BlogModel.find(query)
      .sort({
        is_featured: -1,

        published_at: -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await BlogModel.countDocuments(query);

    return NextResponse.json({
      blogs,

      pagination: {
        page,

        limit,

        total,

        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    await logError("/api/blogs/public", "GET", error);
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
