"use client";

import Link from "next/link";

import { useState } from "react";

import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Menu,
  X,
} from "lucide-react";

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

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed
          top-4
          left-4
          z-50

          lg:hidden

          bg-[#e09225]
          text-[#06182e]

          p-3
          rounded-xl
          shadow-md
        "
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            bg-black/30
            z-40

            lg:hidden
          "
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-50

          h-screen
          w-72

          px-6
          py-8

          border-r
          border-[#06182e]/10

          bg-[#ece1cf]

          transition-transform
          duration-300

          lg:sticky
          lg:translate-x-0

          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close */}
        <button
          onClick={() => setOpen(false)}
          className="
            absolute
            top-4
            right-4

            lg:hidden
          "
        >
          <X size={20} className="text-[#06182e]" />
        </button>

        {/* Logo */}
        <div
          className="
            mb-10
            text-2xl
            font-bold
            text-[#06182e]
          "
        >
          TCC Admin
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2">
          {menu.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                    group
                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    rounded-xl

                    text-sm
                    font-medium

                    transition-all

                    ${
                      isActive
                        ? "bg-[#f4ebda] text-[#06182e]"
                        : "text-[#06182e]/60 hover:bg-[#f4ebda]"
                    }
                  `}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-[#e09225]" : "text-[#06182e]/40"}
                />

                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
