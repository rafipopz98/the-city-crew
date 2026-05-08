import Link from "next/link";

import { LayoutDashboard, FileText, BarChart3, Users } from "lucide-react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import AdminSidebar from "@/components/Admin/Sidebar";

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  // not logged in
  if (!accessToken) {
    redirect("/login");
  }

  const payload = await verifyToken(accessToken);

  // invalid token
  if (!payload) {
    redirect("/login");
  }

  await connectDB();

  const user = await UserModel.findById(payload.userId).select("role");

  // not admin
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#ece1cf]">
      <AdminSidebar />

      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  );
}
