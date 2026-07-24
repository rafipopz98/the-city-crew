import {
  NextRequest,
  NextResponse,
} from "next/server";

import { logError } from "@/lib/errorLogger";
import { connectDB } from "@/lib/db/mongoose";

import { BlogCommentModel } from "@/lib/models/BlogComments";

// register user model for populate
import "@/lib/models/User";

export async function GET(
  req: NextRequest,

  context: {
    params: Promise<{
      blogId: string;
    }>;
  },
) {
  try {
    await connectDB();

    const {
      blogId,
    } =
      await context.params;

    const comments =
      await BlogCommentModel.find(
        {
          blog_id:
            blogId,
        },
      )
        .populate(
          "user_id",
          "first_name email",
        )
        .sort({
          createdAt:
            -1,
        });

    return NextResponse.json(
      {
        comments,
      },
    );
  } catch (
    error
  ) {
    await logError("/api/blogs/comments/[blogId]", "GET", error);
    console.error(
      "BLOG_COMMENTS_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}