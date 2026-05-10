import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";

import AdminSidebar from "@/components/Admin/Sidebar";

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

      <main
        className="
          flex-1
          px-4
          py-4

          sm:px-6
          sm:py-6

          lg:px-10
          lg:py-10
        "
      >
        {children}
      </main>
    </div>
  );
}
