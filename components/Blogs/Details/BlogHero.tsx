"use client";

import { Heart, Eye } from "lucide-react";

type Blog = {
  _id: string;

  title: string;

  thumbnail: string;

  excerpt: string;

  tags: string[];

  published_at: string;

  views_count: number;
};

type Props = {
  blog: Blog;

  liked: boolean;

  likesCount: number;

  setLiked: (value: boolean) => void;

  setLikesCount: (value: number) => void;

  pathname: string;

  router: any;
};

export default function BlogHero({
  blog,

  liked,

  likesCount,

  setLiked,

  setLikesCount,

  pathname,

  router,
}: Props) {
  const handleLike = async () => {
    try {
      const res = await fetch("/api/blogs/like", {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          blog_id: blog._id,
        }),
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);

        return;
      }

      const data = await res.json();

      setLiked(data.liked);

      setLikesCount(data.likes_count);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-5 pt-20 pb-12">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span
          className="
                border
                border-[#06182e]/20

                px-3 py-1

                rounded-full

                text-xs
                uppercase
              "
        >
          {blog?.tags}
        </span>
      </div>

      {/* Title */}
      <h1
        className="
          text-4xl
          md:text-6xl
          lg:text-7xl

          font-black
          uppercase

          text-[#06182e]

          leading-[0.95]
        "
      >
        {blog.title}
      </h1>

      {/* Excerpt */}
      <p
        className="
          mt-6

          text-lg
          md:text-xl

          max-w-3xl

          text-[#06182e]/70
        "
      >
        {blog.excerpt}
      </p>

      {/* Meta */}
      <div
        className="
          mt-8

          flex
          flex-wrap
          items-center

          gap-6

          text-sm
          text-[#06182e]/50
        "
      >
        <span>{new Date(blog.published_at).toDateString()}</span>

        <div className="flex items-center gap-2">
          <Eye size={16} />
          {blog.views_count}
        </div>

        <button
          onClick={handleLike}
          className="
            flex
            items-center
            gap-2

            border
            border-[#06182e]/15

            px-4 py-2

            rounded-full

            hover:bg-white
            transition
          "
        >
          <Heart
            size={16}
            fill={liked ? "#e09225" : "none"}
            className={liked ? "text-[#e09225]" : "text-[#06182e]"}
          />

          {likesCount}
        </button>
      </div>

      {/* Hero Image */}
      <div className="mt-12">
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="
            w-full

            h-[45vh]
            md:h-[70vh]

            object-cover

            rounded-2xl
          "
        />
      </div>
    </section>
  );
}
