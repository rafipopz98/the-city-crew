"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BarChart3, Users } from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Polls", href: "/admin/polls", icon: BarChart3 },
  { name: "Players", href: "/admin/players", icon: Users },
];

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#ece1cf]">
      {/* Sidebar */}
      <div className="w-60 px-6 py-8 border-r border-[#06182e]/10 bg-[#ece1cf]">
        <div className="text-xl font-bold text-[#06182e] mb-8">TCC Admin</div>

        <div className="flex flex-col gap-1">
          {menu.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
              group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all
              ${
                isActive
                  ? "bg-white text-[#06182e] shadow-sm"
                  : "text-[#06182e]/50 hover:text-[#06182e] hover:bg-white/60"
              }
            `}
              >
                <item.icon
                  size={16}
                  className={`${
                    isActive
                      ? "text-[#e09225]"
                      : "text-[#06182e]/40 group-hover:text-[#06182e]"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-10 py-10">{children}</div>
    </div>
  );
}
