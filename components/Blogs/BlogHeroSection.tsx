"use client";

import Link from "next/link";

import { Blog } from "./Blogs";

type Props = {
  blog?: Blog;
};

export default function BlogHeroSection({ blog }: Props) {
  if (!blog) {
    return null;
  }

  return (
    <section
      className="
        relative

        w-full

        h-[70vh]
        lg:h-[90vh]

        bg-[#FFF5E5]

        overflow-hidden

        flex
        items-center
      "
    >
      {/* Big Text */}
      <div
        className="
          px-6
          sm:px-10

          z-10
        "
      >
        <h1
          className="
            head

            text-[22vw]
            sm:text-[18vw]

            leading-none

            uppercase
            text-black
          "
        >
          City
        </h1>

        <h1
          className="
            head

            text-[22vw]
            sm:text-[18vw]

            leading-none

            uppercase
            text-black

            -mt-6
            sm:-mt-10
          "
        >
          Stories
        </h1>
      </div>

      {/* Featured */}
      <Link
        href={`/blogs/${blog.slug}`}
        className="
          absolute

          right-[-10%]
          sm:right-[5%]

          top-[20%]
          sm:top-[25%]

          w-[75%]
          sm:w-[40%]
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
        <div className="mt-4 px-2">
          <h3
            className="
              nav

              text-xl
              sm:text-2xl

              uppercase
            "
          >
            {blog.title}
          </h3>

          <p
            className="
              para

              text-sm
              sm:text-base

              mt-2

              line-clamp-2
            "
          >
            {blog.excerpt}
          </p>
        </div>
      </Link>
    </section>
  );
}
