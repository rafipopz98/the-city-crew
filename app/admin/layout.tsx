import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";

import AdminSidebar from "@/components/Admin/Sidebar";
import { ArrowLeft, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const payload = await verifyToken(accessToken);

  if (!payload) {
    redirect("/login");
  }

  await connectDB();

  const user = await UserModel.findById(payload.userId).select("role");

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#ece1cf]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-[#06182e]/10 bg-[#ece1cf]/95 backdrop-blur supports-backdrop-filter:bg-[#ece1cf]/80">
          <div
            className="
              flex items-center justify-between
              h-14
              px-4
              sm:px-6
              lg:px-10
            "
          >
            {/* Left spacer for mobile menu button space */}
            <div className="lg:hidden w-10" />

            {/* Page title could go here if needed */}
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-[#06182e]/50">
                Admin Panel
              </span>
            </div>

            {/* Back to Site Button */}
            <Link
              href="/"
              className="
                inline-flex items-center gap-2
                px-4 py-2
                rounded-xl
                bg-[#06182e]
                text-[#ece1cf]
                text-sm font-medium
                hover:bg-[#06182e]/90
                hover:-translate-y-0.5
                transition-all
                shadow-sm hover:shadow-md
              "
            >
              <Home size={16} />
              <span className="hidden sm:inline">Back to Site</span>
              <ArrowLeft size={14} className="sm:hidden" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="
            flex-1
            px-4
            py-6
            sm:px-6
            sm:py-8
            lg:px-10
            lg:py-10
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
