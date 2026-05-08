"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, FileText, BarChart3, Users } from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    name: "Polls",
    href: "/admin/polls",
    icon: BarChart3,
  },
  {
    name: "Players",
    href: "/admin/players",
    icon: Users,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        w-64 px-6 py-8
        border-r border-[#06182e]/10
        bg-[#ece1cf]
      "
    >
      <div className="mb-10 text-xl font-bold text-[#06182e]">TCC Admin</div>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                  group flex items-center gap-3
                  px-4 py-3 rounded-md
                  text-sm font-medium
                  transition-all

                  ${
                    isActive
                      ? "bg-white text-[#06182e] shadow-sm"
                      : "text-[#06182e]/50 hover:bg-white/70 hover:text-[#06182e]"
                  }
                `}
            >
              <item.icon
                size={18}
                className={
                  isActive
                    ? "text-[#e09225]"
                    : "text-[#06182e]/40 group-hover:text-[#06182e]"
                }
              />

              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
