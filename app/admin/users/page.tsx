"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Calendar, Shield } from "lucide-react";

type User = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <main className="min-h-screen bg-[#ece1cf]">
      <div className="w-full px-5">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-[#e09225]">
              Management
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#06182e]">
              Users
            </h1>
            <p className="mt-2 text-sm text-[#06182e]/60">
              {totalUsers} user{totalUsers !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#06182e]/40"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#06182e]/10 text-sm text-[#06182e] placeholder:text-[#06182e]/30 focus:outline-none focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#e09225] text-white text-sm font-medium hover:bg-[#e09225]/90 transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="mt-8 rounded-2xl border border-[#06182e]/10 bg-[#ece1cf] overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center gap-4 p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#06182e]/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#06182e]/10 rounded w-1/3" />
                    <div className="h-3 bg-[#06182e]/10 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-[#06182e]/10 rounded w-16" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Mail size={40} className="mx-auto text-[#06182e]/20 mb-3" />
              <p className="text-sm text-[#06182e]/50">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#06182e]/8">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-4 p-4 hover:bg-[#f4ebda] transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e09225]/20 to-[#e09225]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#e09225]">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#06182e] truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-[#06182e]/50">
                        <Mail size={12} />
                        {user.email}
                      </span>
                      {user.createdAt && (
                        <span className="flex items-center gap-1 text-xs text-[#06182e]/40">
                          <Calendar size={12} />
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <span
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
                      user.role === "admin"
                        ? "bg-[#e09225]/10 text-[#e09225]"
                        : "bg-[#06182e]/8 text-[#06182e]/60"
                    }`}
                  >
                    <Shield size={12} />
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#06182e]/50">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white border border-[#06182e]/10 text-sm font-medium text-[#06182e]/70 hover:bg-[#f4ebda] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-[#06182e]/10 text-sm font-medium text-[#06182e]/70 hover:bg-[#f4ebda] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
