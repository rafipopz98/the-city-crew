import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";
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

    // Get user (optional - for like status)
    const user = await getUserFromRequest(req);

    // Find the blog
    const blog = await BlogModel.findOne({
      slug,
      status: "published",
    }).lean();

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    // Increment views
    await BlogModel.updateOne({ _id: blog._id }, { $inc: { views_count: 1 } });

    // Check if user has liked the blog
    let hasLiked = false;
    if (user) {
      const existingLike = await BlogLikeModel.findOne({
        blog_id: blog._id,
        user_id: user.userId,
      });
      hasLiked = !!existingLike;
    }

    // Fetch related posts
    const relatedPosts = await BlogModel.find({
      _id: { $ne: blog._id }, // Exclude current blog
      status: "published",
      $or: [
        { tags: { $in: blog.tags || [] } }, // Same tags
        { category: blog.category }, // Same category (if exists)
      ],
    })
      .select("title slug thumbnail published_at tags")
      .sort({ published_at: -1 })
      .limit(3)
      .lean();

    // If not enough related posts by tags/category, get latest posts
    if (relatedPosts.length < 3) {
      const additionalPosts = await BlogModel.find({
        _id: {
          $nin: [blog._id, ...relatedPosts.map((p) => p._id)],
        },
        status: "published",
      })
        .select("title slug thumbnail published_at tags")
        .sort({ published_at: -1 })
        .limit(3 - relatedPosts.length)
        .lean();

      relatedPosts.push(...additionalPosts);
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount =
      blog.content_blocks
        ?.filter((block: any) => block.type === "text")
        ?.reduce((acc: number, block: any) => {
          const words =
            block.value?.replace(/<[^>]*>/g, "")?.split(/\s+/)?.length || 0;
          return acc + words;
        }, 0) || 0;

    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return NextResponse.json({
      blog: {
        ...blog,
        has_liked: hasLiked,
        read_time: readTime,
        // Ensure views_count is updated in response
        views_count: blog.views_count + 1,
      },
      relatedPosts,
    });
  } catch (error) {
    await logError("/api/blogs/public/[slug]", "GET", error);
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
