"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import BlogHero from "./Details/BlogHero";
import BlogContent from "./Details/BlogContent";
import BlogComments from "./Details/BlogComments";
import BlogNotFound from "./Details/BlogNotFound";
import BlogUnavailable from "./Details/BlogUnavailable";
import BlogLoading from "./Details/BlogLoading";

type Block = {
  type: "text" | "image";

  value: string;

  order: number;
};

type Comment = {
  _id: string;

  text: string;

  parent_id: string | null;

  user_id: {
    first_name: string;
    email: string;
  };

  createdAt: string;
};

type Blog = {
  _id: string;

  title: string;

  thumbnail: string;

  excerpt: string;

  tags: string[];

  status: string;

  published_at: string;

  views_count: number;

  likes_count: number;

  has_liked: boolean;

  content_blocks: Block[];
};

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default function BlogDetails({ params }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const [blog, setBlog] = useState<Blog | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);

  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);

  const [likesCount, setLikesCount] = useState(0);

  const fetchComments = async (blogId: string) => {
    const res = await fetch(`/api/blogs/comments/${blogId}`);

    const data = await res.json();

    setComments(data.comments || []);
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { slug } = await params;

        const res = await fetch(`/api/blogs/public/${slug}`, {
          credentials: "include",
        });

        const data = await res.json();

        setBlog(data.blog);

        setLiked(data.blog?.has_liked);

        setLikesCount(data.blog?.likes_count);

        await fetchComments(data.blog?._id);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

  if (loading) {
    return <BlogLoading />;
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
    <div className="bg-[#FFF5E5] pt-15">
      <BlogHero
        blog={blog}
        liked={liked}
        likesCount={likesCount}
        setLiked={setLiked}
        setLikesCount={setLikesCount}
        pathname={pathname}
        router={router}
      />

      <BlogContent blocks={blog.content_blocks} />

      <BlogComments
        blogId={blog._id}
        comments={comments}
        pathname={pathname}
        router={router}
        refresh={() => fetchComments(blog._id)}
      />
    </div>
  );
}
