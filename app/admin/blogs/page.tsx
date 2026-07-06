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
    <div className="max-w-7xl mx-auto space-y-8 pt-15 sm:pt-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
            Content Management
          </span>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#06182e]">
            Blogs
          </h1>

          <p className="mt-2 text-[#06182e]/60 max-w-xl">
            Manage articles, drafts, featured content and monitor performance
            from one place.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#e09225] hover:bg-[#e09225]/90 text-white px-5 py-3 font-medium transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Create Blog
        </button>
      </div>

      {/* Toolbar */}

      <div className="rounded-2xl border border-[#06182e]/10 bg-[#ece1cf]  p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#06182e]/40"
            />

            <input
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full h-12 rounded-xl border border-[#06182e]/10 bg-[#ece1cf] pl-11 pr-4 text-[#06182e] outline-none transition focus:border-[#e09225]"
            />
          </div>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-12 rounded-xl border border-[#06182e]/10 bg-[#ece1cf] px-4 text-[#06182e] outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="mt-5 border-t border-[#06182e]/8 pt-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-bold text-[#06182e]">{item.value}</p>

              <p className="mt-1 text-sm text-[#06182e]/55">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#06182e]">All Blogs</h2>

          <p className="text-sm text-[#06182e]/55 mt-1">
            {loading
              ? "Loading..."
              : `${pagination?.total ?? blogs.length} article${
                  (pagination?.total ?? blogs.length) !== 1 ? "s" : ""
                }`}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}

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
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: pagination.pages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`h-10 min-w-10 rounded-lg border transition ${
                page === index + 1
                  ? "bg-[#ece1cf] border-[#06182e] text-white"
                  : "bg-white border-[#06182e]/10 text-[#06182e] hover:bg-[#ece1cf]/5"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <CreateBlogModal
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchBlogs}
      />
    </div>
  );
}
