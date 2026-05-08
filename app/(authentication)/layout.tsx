import Navbar from "@/components/common/Navbar";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth/jwt";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (accessToken) {
    const payload = await verifyToken(accessToken);

    if (payload) {
      redirect("/");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="mt-23">{children}</div>
    </div>
  );
};

export default Layout;
