"use client";

import Link from "next/link";

import { SearchX } from "lucide-react";

import { Blog } from "./Blogs";

type Props = {
  blogs: Blog[];

  loading: boolean;

  search: string;
};

const truncate = (text: string, max = 55) =>
  text.length > max ? text.slice(0, max) + "..." : text;

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
};

export default function BlogsGrid({ blogs, loading, search }: Props) {
  /* Loading */
  if (loading) {
    return (
      <div className="px-5 pb-16 sm:px-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-[45vh] sm:h-[55vh] lg:h-[62vh] bg-black/10 rounded" />

            <div className="mt-4 space-y-2">
              <div className="h-3 w-24 rounded bg-black/10" />

              <div className="h-5 w-full rounded bg-black/10" />

              <div className="h-4 w-3/4 rounded bg-black/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* Empty */
  if (!loading && blogs.length === 0) {
    return (
      <div
        className="
          py-20
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        <SearchX
          size={40}
          className="
            text-black/40
            mb-4
          "
        />

        <h3
          className="
            text-2xl
            uppercase
            para
          "
        >
          No Stories Found
        </h3>

        <p
          className="
            mt-2
            text-black/60
          "
        >
          {search ? `No results for "${search}"` : "No stories available yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FFF5E5]">
      {/* Section Title */}
      <div className="px-5 sm:px-10 mb-8">
        <h2
          className="
            text-black
            text-2xl
            sm:text-3xl

            uppercase
            para
          "
        >
          Latest Stories
        </h2>
      </div>

      {/* Grid */}
      <div
        className="
          px-5
          sm:px-10
          pb-16

          grid
          grid-cols-1
          sm:grid-cols-2

          gap-8
        "
      >
        {blogs.map((blog) => (
          <Link
            href={`/blogs/${blog.slug}`}
            key={blog._id}
            className="
                group
                w-full
                flex
                flex-col
              "
          >
            {/* Image */}
            <div className="relative group h-[45vh] sm:h-[55vh] bg-black rounded overflow-hidden shadow-xl">
              {/* Corners */}
              <div className="absolute inset-0 flex flex-col justify-between z-10">
                <div className="flex justify-between">
                  <span className="ml-4 mt-4 h-2 w-2 bg-white rounded-full" />

                  <span className="mr-4 mt-4 h-2 w-2 bg-white rounded-full" />
                </div>

                <div className="flex justify-between">
                  <span className="ml-4 mb-4 h-2 w-2 bg-white rounded-full" />

                  <span className="mr-4 mb-4 h-2 w-2 bg-white rounded-full" />
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-[#e09225] opacity-0 group-hover:opacity-20 transition duration-500" />

              {/* Image */}
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-90 transition-all duration-500"
              />
            </div>

            {/* Content */}
            <div className="mt-4">
              {/* Meta */}
              <div
                className="
                    text-xs
                    uppercase
                    tracking-wide

                    text-black/50

                    mb-2
                  "
              >
                {formatDate(blog.published_at)}

                {blog.tags?.[0] && ` • ${blog.tags[0]}`}
              </div>

              {/* Title */}
              <h3
                className="
                    para

                    text-xl
                    sm:text-2xl

                    uppercase

                    transition
                    group-hover:text-[#e09225]
                  "
              >
                {truncate(blog.title)}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
