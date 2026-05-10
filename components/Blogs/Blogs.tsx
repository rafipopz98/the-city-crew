"use client";

import { useEffect, useState } from "react";

import BlogHeroSection from "./BlogHeroSection";
import BlogsGrid from "./BlogsGrid";

export type Blog = {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  excerpt: string;
  tags: string[];
  is_featured: boolean;
  published_at: string;
};

type Pagination = {
  page: number;
  pages: number;
  total: number;
};

export default function Blogs() {
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [heroBlog, setHeroBlog] = useState<Blog | null>(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      setError("");

      const params = new URLSearchParams({
        search,
        page: String(page),
        limit: "6",
      });

      const res = await fetch(`/api/blogs/public?${params}`);

      const data = await res.json();

      const fetchedBlogs = data.blogs || [];

      setBlogs(fetchedBlogs);

      setPagination(data.pagination);

      /* Hero only set once */
      if (!heroBlog && fetchedBlogs.length > 0) {
        const featured =
          fetchedBlogs.find((blog: Blog) => blog.is_featured) ||
          fetchedBlogs[0];

        setHeroBlog(featured);
      }
    } catch {
      setError("Failed to load stories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchBlogs();
  }, [search]);

  return (
    <div className="w-full bg-[#FFF5E5]">
      {/* Hero always stays */}
      <BlogHeroSection blog={heroBlog || undefined} />

      {/* Search */}
      <div
        className="
          px-5
          sm:px-10
          py-8
          flex
          justify-center
        "
      >
        <div
          className="
            w-full
            max-w-2xl

            flex
            items-center

            border
            border-black/20

            rounded-full

            px-6
            py-4
          "
        >
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              setPage(1);
            }}
            placeholder="Search stories..."
            className="
              w-full
              bg-transparent
              outline-none
            "
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="
            text-center
            text-red-500
            pb-8
          "
        >
          {error}
        </div>
      )}

      {/* Grid */}
      <BlogsGrid blogs={blogs} loading={loading} search={search} />

      {/* Pagination */}
      {!loading && pagination && pagination.pages > 1 && (
        <div
          className="
              flex
              justify-center
              gap-2
              pb-16
            "
        >
          {Array.from({
            length: pagination.pages,
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`
                    px-4 py-2 rounded-full transition

                    ${
                      page === index + 1
                        ? "bg-black text-white"
                        : "border border-black"
                    }
                  `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
