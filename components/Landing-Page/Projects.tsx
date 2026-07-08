"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const truncate = (text: string, max = 50) =>
  text.length > max ? text.slice(0, max) + "..." : text;

const Projects = () => {
  const { data, error, isLoading } = useSWR(
    "/api/blogs/landing?limit=6",
    fetcher,
  );

  const blogs = data?.data || [];
  // If API returns single object, convert to array
  const matchesList = Array.isArray(blogs) ? blogs : blogs ? [blogs] : [];

  if (isLoading) {
    return (
      <div className="h-auto w-full p-3 bg-[#FFF5E5]">
        <div className="px-5 mb-8 flex justify-between items-center">
          <h2 className="text-black text-2xl sm:text-3xl uppercase nav">
            Recent Matches
          </h2>
        </div>
        <div className="relative mb-10 px-5 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full flex flex-col">
              <div className="relative h-[45vh] sm:h-[55vh] lg:h-[62vh] bg-gray-200 rounded overflow-hidden animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mx-auto sm:mx-0" />
                <div className="flex gap-2 justify-center sm:justify-start">
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-auto w-full p-3 bg-[#FFF5E5]">
        <div className="px-5 mb-8 flex justify-between items-center">
          <h2 className="text-black text-2xl sm:text-3xl uppercase nav">
            Recent Matches
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-black/40 text-sm uppercase tracking-wider">
            Unable to load match content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-auto w-full p-3 bg-[#FFF5E5]">
      {/* TITLE */}
      <div className="px-5 mb-8 flex justify-between items-center">
        <h2 className="text-black text-2xl sm:text-3xl uppercase nav">
          Recent Matches
        </h2>
        <Link
          href="/blogs"
          className="text-sm uppercase nav cursor-pointer hover:text-[#e09225] transition"
        >
          View All →
        </Link>
      </div>

      {/* GRID */}
      {matchesList.length > 0 ? (
        <div className="relative mb-10 px-5 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {matchesList.map((blog: any) => (
            <Link
              href={`/blogs/${blog.slug}`}
              key={blog._id || blog.slug}
              className="w-full flex flex-col group"
            >
              {/* IMAGE */}
              <div className="relative h-[45vh] sm:h-[55vh] lg:h-[62vh] bg-black rounded overflow-hidden">
                {/* corners */}
                <div className="absolute inset-0 flex flex-col justify-between z-10">
                  <div className="flex justify-between">
                    <span className="ml-4 mt-4 h-2 w-2 bg-white rounded-full"></span>
                    <span className="mr-4 mt-4 h-2 w-2 bg-white rounded-full"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ml-4 mb-4 h-2 w-2 bg-white rounded-full"></span>
                    <span className="mr-4 mb-4 h-2 w-2 bg-white rounded-full"></span>
                  </div>
                </div>

                {/* hover overlay */}
                <div className="absolute inset-0 bg-[#e09225] opacity-0 group-hover:opacity-20 transition duration-500 z-20"></div>

                {/* image */}
                {blog.thumbnail && (
                  <Image
                    src={blog.thumbnail}
                    alt={blog.title}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-90 transition-all duration-500"
                  />
                )}
              </div>

              {/* TEXT */}
              <div className="mt-3 flex flex-col items-center justify-between sm:flex-row gap-3">
                <h4 className="nav text-xl sm:text-2xl font-medium uppercase tracking-wide text-center sm:text-left group-hover:text-[#e09225] transition">
                  {truncate(blog.title)}
                </h4>

                <div className="flex text-sm sm:text-base gap-2 shrink-0">
                  {blog.tags && blog.tags.length > 0 ? (
                    blog.tags.slice(0, 2).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="uppercase nav border px-2 py-1 rounded text-xs sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="uppercase nav border px-2 py-1 rounded text-xs sm:text-sm">
                      Match
                    </span>
                  )}
                  {blog.published_at && (
                    <span className="nav border px-2 py-1 rounded text-xs sm:text-sm">
                      {new Date(blog.published_at).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-black/40 text-sm uppercase tracking-wider">
            No match reports yet
          </p>
          <Link
            href="/blogs"
            className="mt-4 inline-block text-sm text-[#e09225] hover:underline"
          >
            Browse all articles →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Projects;
