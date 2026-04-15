import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  const { pathname } = req.nextUrl;

  // public routes
  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // no token → block
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // verify token
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // role-based protection (example)
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/blog/edit/:path*", "/blog/add", "/admin/:path*"],
};
