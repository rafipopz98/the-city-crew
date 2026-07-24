import { NextRequest, NextResponse } from "next/server";

import { logError } from "@/lib/errorLogger";
import { connectDB } from "@/lib/db/mongoose";

import { BlogModel } from "@/lib/models/Blogs";

import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;

    const limit = Number(searchParams.get("limit")) || 9;

    const search = searchParams.get("search") || "";

    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (status !== "all") {
      filter.status = status;
    }

    const blogs = await BlogModel.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await BlogModel.countDocuments(filter);

    const stats = await BlogModel.aggregate([
      {
        $group: {
          _id: null,

          total: {
            $sum: 1,
          },

          published: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "published"],
                },
                1,
                0,
              ],
            },
          },

          featured: {
            $sum: {
              $cond: ["$is_featured", 1, 0],
            },
          },

          views: {
            $sum: "$views_count",
          },
        },
      },
    ]);

    return NextResponse.json({
      blogs,

      pagination: {
        page,
        limit,
        total,

        pages: Math.ceil(total / limit),
      },

      stats: stats[0] || {
        total: 0,
        published: 0,
        featured: 0,
        views: 0,
      },
    });
  } catch (error) {
    await logError("/api/blogs/list", "GET", error);
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
