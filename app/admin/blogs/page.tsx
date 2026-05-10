"use client";

import { useEffect, useState } from "react";

import { Search, Plus, FileText, Eye, Star, PenSquare } from "lucide-react";

import CreateBlogModal from "@/components/Admin/Blogs/CreateBlogModal";
import BlogCard from "@/components/Admin/Blogs/BlogCard";

import BlogCardSkeleton from "@/components/Admin/Blogs/BlogCardSkeleton";
import EmptyBlogs from "@/components/Admin/Blogs/EmptyBlogs";

type Blog = {
  _id: string;
  title: string;
  status: string;
  is_featured: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  thumbnail: string;
};

type Stats = {
  total: number;
  published: number;
  featured: number;
  views: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export default function AdminBlogsPage() {
  const [open, setOpen] = useState(false);

  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    featured: 0,
    views: 0,
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "9",
        search,
        status,
      });

      const res = await fetch(`/api/blogs/list?${params}`, {
        credentials: "include",
      });

      const data = await res.json();

      setBlogs(data.blogs || []);

      setStats(data.stats);

      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, status, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusChange = (value: string) => {
    setPage(1);

    setStatus(value);
  };

  const statsCards = [
    {
      label: "Total Blogs",
      value: stats?.total,
      icon: FileText,
    },
    {
      label: "Published",
      value: stats?.published,
      icon: PenSquare,
    },
    {
      label: "Featured",
      value: stats?.featured,
      icon: Star,
    },
    {
      label: "Views",
      value: stats?.views,
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start pt-15 sm:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-[#06182e]">Blogs</h1>

          <p className="text-[#06182e]/60 mt-2">
            Create, manage, and grow your editorial content.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="
            flex
            items-center
            gap-2
            bg-[#e09225]
            text-[#06182e]
            px-5 py-3
            
            rounded-xl
            font-semibold
            transition
            hover:scale-[1.02]
          "
        >
          <Plus size={18} />
          Create Blog
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {statsCards?.map((item) => {
          const Icon = item?.icon;

          return (
            <div
              key={item?.label}
              className="
                  bg-[#f4ebda]
                  border
                  border-[#06182e]/8
                  rounded-2xl
                  p-5
                "
            >
              <div
                className="
                    w-10 h-10
                    rounded-xl
                    bg-[#e09225]/10
                    flex
                    items-center
                    justify-center
                    mb-3
                  "
              >
                <Icon
                  size={18}
                  className="
                      text-[#e09225]
                    "
                />
              </div>

              <p className="text-sm text-[#06182e]/60">{item?.label}</p>

              <p className="text-2xl font-bold text-[#06182e] mt-1">
                {item?.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#06182e]/40
            "
          />

          <input
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="
              w-full
              bg-[#f4ebda]
              border
              border-[#06182e]/8
              rounded-xl
              pl-11
              pr-4
              py-3
              outline-none
              text-[#06182e]
              placeholder:text-[#06182e]/40
            "
          />
        </div>

        {/* Filter */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="
            bg-[#f4ebda]
            border
            border-[#06182e]/8
            rounded-xl
            px-4 py-3
            text-[#06182e]
            outline-none
          "
        >
          <option value="all">All Status</option>

          <option value="draft">Draft</option>

          <option value="published">Published</option>

          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading &&
          Array.from({
            length: 6,
          }).map((_, index) => <BlogCardSkeleton key={index} />)}

        {!loading &&
          blogs.length > 0 &&
          blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} onSuccess={fetchBlogs} />
          ))}

        {!loading && blogs.length === 0 && (
          <EmptyBlogs onCreate={() => setOpen(true)} />
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({
            length: pagination.pages,
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`
                    px-4 py-2 rounded-xl font-medium transition
                    ${
                      page === index + 1
                        ? "bg-[#e09225] text-[#06182e]"
                        : "bg-[#f4ebda] text-[#06182e]"
                    }
                  `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <CreateBlogModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchBlogs}
      />
    </div>
  );
}
