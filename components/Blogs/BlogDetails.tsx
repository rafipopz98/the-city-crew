"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Blog, RelatedPost } from "./Details/types";
import BlogNotFound from "./Details/BlogNotFound";
import { ReadingProgress } from "./Details/ReadingProgress";
import BlogHero from "./Details/BlogHero";
import { BlogContent } from "./Details/BlogContent";
import { TableOfContents } from "./Details/TableOfContents";
import { RelatedPosts } from "./Details/RelatedPosts";
import BlogComments from "./Details/BlogComments";
import { NewsletterSignup } from "./Details/NewsletterSignup";
import { BackToTop } from "./Details/BackToTop";
import { BlogDetailsSkeleton } from "./Details/BlogDetailsSkeleton";
import { BlogUnavailable } from "./Details/BlogUnavailable";

type Comment = {
  _id: string;

  text: string;

  parent_id: string | null;

  user_id: {
    first_name: string;
  };
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default function BlogDetails({ params }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchComments = async (blogId: string) => {
    try {
      const res = await fetch(`/api/blogs/comments/${blogId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { slug } = await params;

        const res = await fetch(`/api/blogs/public/${slug}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch blog");

        const data = await res.json();

        setBlog(data.blog);
        setLiked(data.blog?.has_liked || false);
        setLikesCount(data.blog?.likes_count || 0);
        setRelatedPosts(data.relatedPosts || []);

        if (data.blog?._id) {
          await fetchComments(data.blog._id);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

  if (loading) {
    return <BlogDetailsSkeleton />;
  }

  if (!blog) {
    return <BlogNotFound />;
  }

  if (blog.status === "draft") {
    return <BlogUnavailable type="draft" />;
  }

  if (blog.status === "hidden") {
    return <BlogUnavailable type="hidden" />;
  }

  return (
    <div className="bg-[#FFF5E5] min-h-screen pt-15">
      <ReadingProgress />

      <BlogHero
        blog={blog}
        liked={liked}
        likesCount={likesCount}
        setLiked={setLiked}
        setLikesCount={setLikesCount}
        pathname={pathname}
        router={router}
      />

      <div className="max-w-6xl mx-auto flex gap-8 lg:gap-12 px-5">
        <div className="flex-1">
          <BlogContent blocks={blog.content_blocks} />
        </div>
        <aside className="hidden md:block w-64 shrink-0">
          <TableOfContents blocks={blog.content_blocks} />
        </aside>
      </div>

      <RelatedPosts posts={relatedPosts} />

      <BlogComments
        blogId={blog._id}
        comments={comments}
        pathname={pathname}
        router={router}
        refresh={() => fetchComments(blog._id)}
      />

      <NewsletterSignup />

      <BackToTop />
    </div>
  );
}
